"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const Ticket_js_1 = require("../models/Ticket.js");
const TicketComment_js_1 = require("../models/TicketComment.js");
const TicketWorkLog_js_1 = require("../models/TicketWorkLog.js");
const slaEngine_js_1 = require("./slaEngine.js");
const aiService_js_1 = require("./aiService.js");
const notificationService_js_1 = require("./notificationService.js");
const auditService_js_1 = require("./auditService.js");
const AppError_js_1 = require("../utils/AppError.js");
const mongoose_1 = __importDefault(require("mongoose"));
class TicketService {
    /**
     * Generates the next sequential ticket ID (e.g. SDP-1001).
     */
    static async getNextTicketId() {
        const latest = await Ticket_js_1.Ticket.findOne({}, { ticketId: 1 })
            .sort({ ticketId: -1 })
            .collation({ locale: "en", numericOrdering: true });
        if (!latest || !latest.ticketId) {
            return 'SDP-1001';
        }
        const match = latest.ticketId.match(/SDP-(\d+)/);
        if (!match)
            return 'SDP-1001';
        const nextNum = parseInt(match[1], 10) + 1;
        return `SDP-${nextNum}`;
    }
    /**
     * Validates whether a state machine transition is allowed.
     */
    static isValidTransition(current, next) {
        if (current === next)
            return true;
        const allowedTransitions = {
            open: ['assigned', 'in_progress', 'pending', 'escalated', 'closed'],
            assigned: ['in_progress', 'pending', 'resolved', 'escalated', 'open'],
            in_progress: ['pending', 'resolved', 'escalated', 'assigned'],
            pending: ['in_progress', 'resolved', 'assigned'],
            resolved: ['closed', 'reopened'],
            closed: ['reopened'],
            reopened: ['assigned', 'in_progress', 'escalated'],
            escalated: ['assigned', 'in_progress', 'resolved', 'pending'],
        };
        return (allowedTransitions[current] || []).includes(next);
    }
    /**
     * Creates a new ticket with SLA deadlines, AI suggestions, and notifications.
     */
    static async createTicket(data, requester, reqMeta) {
        const ticketId = await this.getNextTicketId();
        // AI Classification
        const aiResult = await aiService_js_1.AIService.classifyTicket(data.title, data.description);
        const finalPriority = data.priority || aiResult.priority || 'medium';
        const finalCategory = data.category || aiResult.category || 'Other';
        // Calculate SLAs
        const { policyId, slaResponseDeadline, slaDeadline } = await slaEngine_js_1.SLAEngine.calculateDeadlines(finalPriority);
        const ticket = await Ticket_js_1.Ticket.create({
            ticketId,
            title: data.title,
            description: data.description,
            category: finalCategory,
            subcategory: data.subcategory || '',
            priority: finalPriority,
            status: data.assignedTechnician ? 'assigned' : 'open',
            requester: requester._id,
            department: data.department || requester.department,
            assignedTechnician: data.assignedTechnician || undefined,
            assignedTeam: data.assignedTeam || undefined,
            asset: data.asset || undefined,
            tags: data.tags || [],
            dueDate: data.dueDate || undefined,
            slaPolicy: policyId,
            slaResponseDeadline,
            slaDeadline,
            slaStatus: 'on_track',
            aiSuggestions: {
                category: aiResult.category,
                priority: aiResult.priority,
                confidence: aiResult.confidence,
                suggestedSteps: aiResult.suggestedSteps,
                classifiedAt: new Date(),
            },
        });
        // Notify requester
        await notificationService_js_1.NotificationService.send({
            recipient: requester._id,
            type: 'ticket_created',
            title: `Ticket Created: ${ticket.ticketId}`,
            message: `Your ticket "${ticket.title}" has been logged successfully.`,
            link: `/tickets/${ticket.ticketId}`,
        });
        // Notify assigned technician or IT Managers
        if (data.assignedTechnician) {
            await notificationService_js_1.NotificationService.send({
                recipient: data.assignedTechnician,
                type: 'ticket_assigned',
                title: `Ticket Assigned: ${ticket.ticketId}`,
                message: `You have been assigned to ticket "${ticket.title}".`,
                link: `/tickets/${ticket.ticketId}`,
            });
        }
        await auditService_js_1.AuditService.log({
            req: reqMeta?.req,
            user: requester,
            action: 'CREATE_TICKET',
            entityType: 'ticket',
            entityId: ticket.ticketId,
            entityDisplay: ticket.title,
            changes: { current: ticket.toJSON() },
        });
        return ticket;
    }
    /**
     * Transitions ticket status with state machine enforcement.
     */
    static async updateStatus(ticketId, newStatus, user, resolutionNotes, reqMeta) {
        const ticket = await Ticket_js_1.Ticket.findOne({
            $or: [{ _id: mongoose_1.default.isValidObjectId(ticketId) ? ticketId : null }, { ticketId }],
        }).populate('requester assignedTechnician');
        if (!ticket) {
            throw new AppError_js_1.AppError(`Ticket ${ticketId} not found`, 404);
        }
        if (!this.isValidTransition(ticket.status, newStatus)) {
            throw new AppError_js_1.AppError(`Invalid status transition from '${ticket.status}' to '${newStatus}'`, 400);
        }
        const previousStatus = ticket.status;
        ticket.status = newStatus;
        if (newStatus === 'resolved') {
            ticket.resolvedAt = new Date();
            if (resolutionNotes) {
                ticket.resolutionNotes = resolutionNotes;
            }
        }
        else if (newStatus === 'closed') {
            ticket.closedAt = new Date();
        }
        else if (newStatus === 'reopened') {
            ticket.reopenCount = (ticket.reopenCount || 0) + 1;
            ticket.resolvedAt = undefined;
            ticket.closedAt = undefined;
        }
        if (!ticket.firstResponseAt && ['in_progress', 'resolved'].includes(newStatus)) {
            ticket.firstResponseAt = new Date();
        }
        await ticket.save();
        // Audit log
        await auditService_js_1.AuditService.log({
            req: reqMeta?.req,
            user,
            action: 'UPDATE_TICKET_STATUS',
            entityType: 'ticket',
            entityId: ticket.ticketId,
            entityDisplay: ticket.title,
            changes: { previous: previousStatus, current: newStatus },
        });
        // Notify requester
        if (ticket.requester && ticket.requester._id.toString() !== user._id.toString()) {
            await notificationService_js_1.NotificationService.send({
                recipient: ticket.requester._id,
                sender: user._id,
                type: 'ticket_status',
                title: `Ticket Status Updated: ${ticket.ticketId}`,
                message: `Your ticket status is now "${newStatus.replace('_', ' ').toUpperCase()}".`,
                link: `/tickets/${ticket.ticketId}`,
            });
        }
        return ticket;
    }
    /**
     * Assigns ticket to a technician or team.
     */
    static async assignTicket(ticketId, assigneeId, teamId, user, reqMeta) {
        const ticket = await Ticket_js_1.Ticket.findOne({
            $or: [{ _id: mongoose_1.default.isValidObjectId(ticketId) ? ticketId : null }, { ticketId }],
        });
        if (!ticket)
            throw new AppError_js_1.AppError('Ticket not found', 404);
        const prevTech = ticket.assignedTechnician?.toString();
        ticket.assignedTechnician = assigneeId ? new mongoose_1.default.Types.ObjectId(assigneeId) : undefined;
        if (teamId) {
            ticket.assignedTeam = new mongoose_1.default.Types.ObjectId(teamId);
        }
        if (ticket.status === 'open' && assigneeId) {
            ticket.status = 'assigned';
        }
        await ticket.save();
        await auditService_js_1.AuditService.log({
            req: reqMeta?.req,
            user,
            action: 'ASSIGN_TICKET',
            entityType: 'ticket',
            entityId: ticket.ticketId,
            entityDisplay: ticket.title,
            changes: { previous: prevTech, current: assigneeId },
        });
        if (assigneeId && assigneeId !== user._id.toString()) {
            await notificationService_js_1.NotificationService.send({
                recipient: assigneeId,
                sender: user._id,
                type: 'ticket_assigned',
                title: `Ticket Assigned: ${ticket.ticketId}`,
                message: `${user.name} assigned ticket "${ticket.title}" to you.`,
                link: `/tickets/${ticket.ticketId}`,
            });
        }
        return ticket;
    }
    /**
     * Adds a public comment or private internal note.
     */
    static async addComment(ticketId, content, isInternal, user, attachments = [], reqMeta) {
        const ticket = await Ticket_js_1.Ticket.findOne({
            $or: [{ _id: mongoose_1.default.isValidObjectId(ticketId) ? ticketId : null }, { ticketId }],
        }).populate('requester assignedTechnician');
        if (!ticket)
            throw new AppError_js_1.AppError('Ticket not found', 404);
        // Employees cannot post internal notes
        if (isInternal && user.role === 'employee') {
            throw new AppError_js_1.AppError('Employees are not authorized to create internal notes', 403);
        }
        const comment = await TicketComment_js_1.TicketComment.create({
            ticket: ticket._id,
            author: user._id,
            content,
            isInternal,
            attachments,
        });
        // If technician responds publicly for the first time, record firstResponseAt
        if (!ticket.firstResponseAt && user.role !== 'employee' && !isInternal) {
            ticket.firstResponseAt = new Date();
            await ticket.save();
        }
        await auditService_js_1.AuditService.log({
            req: reqMeta?.req,
            user,
            action: isInternal ? 'ADD_INTERNAL_NOTE' : 'ADD_TICKET_COMMENT',
            entityType: 'ticket',
            entityId: ticket.ticketId,
            entityDisplay: ticket.title,
        });
        // Notify other parties if public comment
        if (!isInternal) {
            const recipient = user._id.toString() === ticket.requester._id.toString()
                ? ticket.assignedTechnician
                    ? ticket.assignedTechnician._id
                    : null
                : ticket.requester._id;
            if (recipient) {
                await notificationService_js_1.NotificationService.send({
                    recipient,
                    sender: user._id,
                    type: 'ticket_comment',
                    title: `New Comment on ${ticket.ticketId}`,
                    message: `${user.name}: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`,
                    link: `/tickets/${ticket.ticketId}`,
                });
            }
        }
        return await comment.populate('author', 'name email avatarUrl role');
    }
    /**
     * Logs work time for a technician.
     */
    static async logWork(ticketId, timeSpentMinutes, description, user) {
        const ticket = await Ticket_js_1.Ticket.findOne({
            $or: [{ _id: mongoose_1.default.isValidObjectId(ticketId) ? ticketId : null }, { ticketId }],
        });
        if (!ticket)
            throw new AppError_js_1.AppError('Ticket not found', 404);
        const workLog = await TicketWorkLog_js_1.TicketWorkLog.create({
            ticket: ticket._id,
            technician: user._id,
            timeSpentMinutes,
            description,
            loggedAt: new Date(),
        });
        await auditService_js_1.AuditService.log({
            user,
            action: 'LOG_WORK_TIME',
            entityType: 'ticket',
            entityId: ticket.ticketId,
            entityDisplay: `${timeSpentMinutes} mins logged on ${ticket.ticketId}`,
        });
        return await workLog.populate('technician', 'name email avatarUrl role');
    }
}
exports.TicketService = TicketService;
