"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLAEngine = void 0;
const SLAPolicy_js_1 = require("../models/SLAPolicy.js");
const Ticket_js_1 = require("../models/Ticket.js");
const User_js_1 = require("../models/User.js");
const businessHours_js_1 = require("../utils/businessHours.js");
const notificationService_js_1 = require("./notificationService.js");
const auditService_js_1 = require("./auditService.js");
const logger_js_1 = require("../utils/logger.js");
class SLAEngine {
    /**
     * Retrieves the applicable SLA policy for a given ticket priority.
     */
    static async getPolicyForPriority(priority) {
        let policy = await SLAPolicy_js_1.SLAPolicy.findOne({ priority, isActive: true });
        if (!policy) {
            policy = await SLAPolicy_js_1.SLAPolicy.findOne({ isDefault: true, isActive: true });
        }
        if (!policy) {
            // Hardcoded fallback policy if DB empty
            const defaultMins = {
                critical: { resp: 30, res: 120 },
                high: { resp: 60, res: 240 },
                medium: { resp: 240, res: 1440 },
                low: { resp: 480, res: 4320 },
            };
            const fallback = defaultMins[priority] || defaultMins.medium;
            policy = new SLAPolicy_js_1.SLAPolicy({
                name: `Default ${priority.toUpperCase()} SLA`,
                priority,
                responseTimeMinutes: fallback.resp,
                resolutionTimeMinutes: fallback.res,
                operatingHours: priority === 'critical' ? '24_7' : 'business_hours',
                isActive: true,
            });
        }
        return policy;
    }
    /**
     * Calculates SLA deadlines for a newly created or updated ticket.
     */
    static async calculateDeadlines(priority, startDate = new Date(), config = businessHours_js_1.DEFAULT_BUSINESS_CONFIG) {
        const policy = await this.getPolicyForPriority(priority);
        const slaResponseDeadline = (0, businessHours_js_1.calculateSLADeadline)(startDate, policy.responseTimeMinutes, policy.operatingHours, config);
        const slaDeadline = (0, businessHours_js_1.calculateSLADeadline)(startDate, policy.resolutionTimeMinutes, policy.operatingHours, config);
        return {
            policyId: policy._id,
            slaResponseDeadline,
            slaDeadline,
        };
    }
    /**
     * Evaluates the current SLA state of a single ticket and updates if changed.
     */
    static evaluateTicketSLA(ticket, now = new Date()) {
        const isResolved = ['resolved', 'closed'].includes(ticket.status);
        return (0, businessHours_js_1.evaluateSLAStatus)(ticket.createdAt, ticket.slaDeadline, now, isResolved);
    }
    /**
     * Background scan: runs every minute to evaluate open tickets for AT_RISK or BREACHED SLAs.
     */
    static async checkAllActiveTickets() {
        try {
            const activeTickets = await Ticket_js_1.Ticket.find({
                status: { $in: ['open', 'assigned', 'in_progress', 'pending', 'reopened'] },
            }).populate('assignedTechnician requester');
            const now = new Date();
            for (const ticket of activeTickets) {
                const evaluation = this.evaluateTicketSLA(ticket, now);
                const previousStatus = ticket.slaStatus;
                if (evaluation.status !== previousStatus) {
                    ticket.slaStatus = evaluation.status;
                    await ticket.save();
                    logger_js_1.logger.info(`Ticket ${ticket.ticketId} SLA transitioned from ${previousStatus} -> ${evaluation.status}`);
                    // Find IT Managers to notify
                    const itManagers = await User_js_1.User.find({ role: 'it_manager', isActive: true });
                    const managerIds = itManagers.map((m) => m._id);
                    const recipients = [];
                    if (ticket.assignedTechnician) {
                        recipients.push(ticket.assignedTechnician._id);
                    }
                    recipients.push(...managerIds);
                    if (evaluation.status === 'at_risk') {
                        await notificationService_js_1.NotificationService.sendToMany(recipients, {
                            type: 'sla_warning',
                            title: `⚠️ SLA Warning: Ticket ${ticket.ticketId}`,
                            message: `Ticket "${ticket.title}" is nearing SLA breach (${evaluation.remainingMinutes} minutes remaining).`,
                            link: `/tickets/${ticket.ticketId}`,
                        });
                        await auditService_js_1.AuditService.log({
                            action: 'SLA_STATUS_WARNING',
                            entityType: 'ticket',
                            entityId: ticket.ticketId,
                            entityDisplay: ticket.title,
                            changes: { previous: previousStatus, current: 'at_risk' },
                        });
                    }
                    else if (evaluation.status === 'breached') {
                        await notificationService_js_1.NotificationService.sendToMany(recipients, {
                            type: 'sla_breached',
                            title: `🚨 SLA BREACHED: Ticket ${ticket.ticketId}`,
                            message: `Ticket "${ticket.title}" has breached its SLA resolution deadline. Immediate action required.`,
                            link: `/tickets/${ticket.ticketId}`,
                        });
                        await auditService_js_1.AuditService.log({
                            action: 'SLA_STATUS_BREACHED',
                            entityType: 'ticket',
                            entityId: ticket.ticketId,
                            entityDisplay: ticket.title,
                            changes: { previous: previousStatus, current: 'breached' },
                        });
                    }
                }
            }
        }
        catch (error) {
            logger_js_1.logger.error('Error in SLA background checker:', error.message);
        }
    }
}
exports.SLAEngine = SLAEngine;
