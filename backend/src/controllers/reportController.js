"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const Ticket_1 = require("../models/Ticket");
const Asset_1 = require("../models/Asset");
const User_1 = require("../models/User");
const Team_1 = require("../models/Team");
class ReportController {
    static async getDashboardMetrics(req, res, next) {
        try {
            const role = req.user?.role;
            let metrics = {
                role,
                generatedAt: new Date(),
            };
            // Common metrics for all users
            const totalTickets = await Ticket_1.Ticket.countDocuments();
            const openTickets = await Ticket_1.Ticket.countDocuments({ status: { $in: ['open', 'assigned', 'in_progress'] } });
            const resolvedTickets = await Ticket_1.Ticket.countDocuments({ status: 'resolved' });
            metrics.tickets = { total: totalTickets, open: openTickets, resolved: resolvedTickets };
            // Role-specific metrics
            if (role === 'admin' || role === 'it_manager') {
                const slaBreached = await Ticket_1.Ticket.countDocuments({ slaStatus: 'breached' });
                const slaAtRisk = await Ticket_1.Ticket.countDocuments({ slaStatus: 'at_risk' });
                const technicians = await User_1.User.countDocuments({ role: 'technician' });
                const teams = await Team_1.Team.countDocuments();
                const assets = await Asset_1.Asset.countDocuments();
                const assetsUnderRepair = await Asset_1.Asset.countDocuments({ status: 'under_repair' });
                metrics.sla = { breached: slaBreached, atRisk: slaAtRisk };
                metrics.teams = teams;
                metrics.technicians = technicians;
                metrics.assets = { total: assets, underRepair: assetsUnderRepair };
            }
            if (role === 'technician') {
                const assignedTickets = await Ticket_1.Ticket.countDocuments({ assignedTechnician: req.user?._id });
                const highPriorityTickets = await Ticket_1.Ticket.countDocuments({
                    assignedTechnician: req.user?._id,
                    priority: 'critical',
                });
                metrics.assignedTickets = assignedTickets;
                metrics.highPriorityTickets = highPriorityTickets;
            }
            if (role === 'employee') {
                const myTickets = await Ticket_1.Ticket.countDocuments({ requester: req.user?._id });
                const pendingTickets = await Ticket_1.Ticket.countDocuments({
                    requester: req.user?._id,
                    status: { $in: ['open', 'in_progress', 'pending'] },
                });
                metrics.myTickets = myTickets;
                metrics.pendingTickets = pendingTickets;
            }
            res.status(200).json({
                success: true,
                data: metrics,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getTicketsByStatus(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const filter = {};
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate)
                    filter.createdAt.$gte = new Date(startDate);
                if (endDate)
                    filter.createdAt.$lte = new Date(endDate);
            }
            const data = await Ticket_1.Ticket.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getTicketsByPriority(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const filter = {};
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate)
                    filter.createdAt.$gte = new Date(startDate);
                if (endDate)
                    filter.createdAt.$lte = new Date(endDate);
            }
            const data = await Ticket_1.Ticket.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$priority',
                        count: { $sum: 1 },
                    },
                },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getTicketsByCategory(req, res, next) {
        try {
            const data = await Ticket_1.Ticket.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getTicketsByDepartment(req, res, next) {
        try {
            const data = await Ticket_1.Ticket.aggregate([
                {
                    $group: {
                        _id: '$department',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getTicketsByTechnician(req, res, next) {
        try {
            const data = await Ticket_1.Ticket.aggregate([
                {
                    $group: {
                        _id: '$assignedTechnician',
                        count: { $sum: 1 },
                    },
                },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'tech' } },
                { $sort: { count: -1 } },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getResolutionTime(req, res, next) {
        try {
            const data = await Ticket_1.Ticket.aggregate([
                { $match: { resolvedAt: { $exists: true } } },
                {
                    $project: {
                        resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        average: { $avg: '$resolutionTime' },
                        min: { $min: '$resolutionTime' },
                        max: { $max: '$resolutionTime' },
                    },
                },
            ]);
            res.status(200).json({
                success: true,
                data: data[0] || { average: 0, min: 0, max: 0 },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getTicketVolumeTrend(req, res, next) {
        try {
            const data = await Ticket_1.Ticket.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getSLACompliance(req, res, next) {
        try {
            const total = await Ticket_1.Ticket.countDocuments({ slaPolicy: { $exists: true } });
            const breached = await Ticket_1.Ticket.countDocuments({ slaStatus: 'breached' });
            const compliance = total > 0 ? ((total - breached) / total) * 100 : 100;
            res.status(200).json({
                success: true,
                data: { total, breached, compliance: compliance.toFixed(2) },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getSLABreaches(req, res, next) {
        try {
            const data = await Ticket_1.Ticket.find({ slaStatus: 'breached' })
                .populate('requester assignedTechnician slaPolicy')
                .limit(50);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAssetDistribution(req, res, next) {
        try {
            const data = await Asset_1.Asset.aggregate([
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAssetStatus(req, res, next) {
        try {
            const data = await Asset_1.Asset.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getWarrantyStatus(req, res, next) {
        try {
            const now = new Date();
            const expiringCount = await Asset_1.Asset.countDocuments({
                warrantyExpiration: {
                    $gte: now,
                    $lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
                },
            });
            const expiredCount = await Asset_1.Asset.countDocuments({
                warrantyExpiration: { $lt: now },
            });
            res.status(200).json({
                success: true,
                data: { expiring: expiringCount, expired: expiredCount },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getTechnicianWorkload(req, res, next) {
        try {
            const data = await Ticket_1.Ticket.aggregate([
                {
                    $match: {
                        assignedTechnician: { $exists: true },
                        status: { $in: ['open', 'assigned', 'in_progress'] },
                    },
                },
                {
                    $group: {
                        _id: '$assignedTechnician',
                        ticketCount: { $sum: 1 },
                        highPriority: {
                            $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] },
                        },
                    },
                },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'tech' } },
                { $sort: { ticketCount: -1 } },
            ]);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async generateCustomReport(req, res, next) {
        try {
            // TODO: Implement custom report builder
            res.status(200).json({
                success: true,
                message: 'Custom report generation coming soon',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async exportReport(req, res, next) {
        try {
            const type = req.query.type || req.body?.type || 'tickets';
            if (type === 'assets') {
                const assets = await Asset_1.Asset.find().populate('assignedUser department');
                const headers = ['Asset ID', 'Name', 'Type', 'Serial Number', 'Manufacturer', 'Model', 'Status', 'Assigned User', 'Warranty Expiration'];
                const rows = assets.map(a => [
                    `"${a.assetId}"`,
                    `"${a.name.replace(/"/g, '""')}"`,
                    `"${a.type}"`,
                    `"${a.serialNumber}"`,
                    `"${a.manufacturer}"`,
                    `"${a.model}"`,
                    `"${a.status}"`,
                    `"${a.assignedUser?.name || 'Unassigned'}"`,
                    `"${a.warrantyExpiration ? new Date(a.warrantyExpiration).toISOString().split('T')[0] : ''}"`
                ]);
                const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=assets_report_${Date.now()}.csv`);
                res.status(200).send(csv);
                return;
            }
            // Default: Tickets export
            let query = {};
            if (req.user?.role === 'employee') {
                query.requester = req.user._id;
            }
            const tickets = await Ticket_1.Ticket.find(query).populate('requester assignedTechnician department slaPolicy');
            const headers = ['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'SLA Status', 'Requester', 'Assignee', 'Created At', 'Resolved At'];
            const rows = tickets.map(t => [
                `"${t.ticketId}"`,
                `"${t.title.replace(/"/g, '""')}"`,
                `"${t.category}"`,
                `"${t.priority}"`,
                `"${t.status}"`,
                `"${t.slaStatus}"`,
                `"${t.requester?.name || ''}"`,
                `"${t.assignedTechnician?.name || 'Unassigned'}"`,
                `"${new Date(t.createdAt).toISOString()}"`,
                `"${t.resolvedAt ? new Date(t.resolvedAt).toISOString() : ''}"`
            ]);
            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=tickets_report_${Date.now()}.csv`);
            res.status(200).send(csv);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportController = ReportController;
