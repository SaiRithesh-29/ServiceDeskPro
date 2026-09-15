"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const Ticket_js_1 = require("../models/Ticket.js");
const Asset_js_1 = require("../models/Asset.js");
const User_js_1 = require("../models/User.js");
class ReportService {
    static async getOverviewMetrics(startDate, endDate) {
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate)
                dateFilter.createdAt.$gte = startDate;
            if (endDate)
                dateFilter.createdAt.$lte = endDate;
        }
        const [totalTickets, openTickets, resolvedTickets, escalatedTickets, totalAssets, assignedAssets, totalUsers,] = await Promise.all([
            Ticket_js_1.Ticket.countDocuments(dateFilter),
            Ticket_js_1.Ticket.countDocuments({ ...dateFilter, status: { $in: ['open', 'assigned', 'in_progress', 'pending'] } }),
            Ticket_js_1.Ticket.countDocuments({ ...dateFilter, status: { $in: ['resolved', 'closed'] } }),
            Ticket_js_1.Ticket.countDocuments({ ...dateFilter, status: 'escalated' }),
            Asset_js_1.Asset.countDocuments(),
            Asset_js_1.Asset.countDocuments({ status: 'assigned' }),
            User_js_1.User.countDocuments({ isActive: true }),
        ]);
        // SLA Compliance rate
        const breachedTickets = await Ticket_js_1.Ticket.countDocuments({ ...dateFilter, slaStatus: 'breached' });
        const slaComplianceRate = totalTickets > 0
            ? Math.round(((totalTickets - breachedTickets) / totalTickets) * 100)
            : 100;
        // Average resolution time (in hours)
        const resolvedList = await Ticket_js_1.Ticket.find({
            ...dateFilter,
            status: { $in: ['resolved', 'closed'] },
            resolvedAt: { $exists: true },
        }).select('createdAt resolvedAt');
        let totalResolutionHours = 0;
        resolvedList.forEach((t) => {
            if (t.resolvedAt) {
                const diffMs = t.resolvedAt.getTime() - t.createdAt.getTime();
                totalResolutionHours += diffMs / (1000 * 60 * 60);
            }
        });
        const averageResolutionTimeHours = resolvedList.length > 0
            ? Math.round((totalResolutionHours / resolvedList.length) * 10) / 10
            : 0;
        return {
            totalTickets,
            openTickets,
            resolvedTickets,
            escalatedTickets,
            breachedTickets,
            slaComplianceRate,
            averageResolutionTimeHours,
            totalAssets,
            assignedAssets,
            totalUsers,
        };
    }
    static async getTicketsByStatus(startDate, endDate) {
        const match = {};
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate)
                match.createdAt.$gte = startDate;
            if (endDate)
                match.createdAt.$lte = endDate;
        }
        const counts = await Ticket_js_1.Ticket.aggregate([
            { $match: match },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        return counts.map((c) => ({ status: c._id, count: c.count }));
    }
    static async getTicketsByPriority(startDate, endDate) {
        const match = {};
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate)
                match.createdAt.$gte = startDate;
            if (endDate)
                match.createdAt.$lte = endDate;
        }
        const counts = await Ticket_js_1.Ticket.aggregate([
            { $match: match },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);
        return counts.map((c) => ({ priority: c._id, count: c.count }));
    }
    static async getTicketsByCategory(startDate, endDate) {
        const match = {};
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate)
                match.createdAt.$gte = startDate;
            if (endDate)
                match.createdAt.$lte = endDate;
        }
        const counts = await Ticket_js_1.Ticket.aggregate([
            { $match: match },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        return counts.map((c) => ({ category: c._id, count: c.count }));
    }
    static async getTicketsByDepartment(startDate, endDate) {
        const match = {};
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate)
                match.createdAt.$gte = startDate;
            if (endDate)
                match.createdAt.$lte = endDate;
        }
        const data = await Ticket_js_1.Ticket.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'dept',
                },
            },
            { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$dept.name',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        return data.map((d) => ({ department: d._id || 'Unassigned', count: d.count }));
    }
    static async getTechnicianPerformance() {
        const technicians = await User_js_1.User.find({ role: { $in: ['technician', 'it_manager'] }, isActive: true });
        const results = await Promise.all(technicians.map(async (tech) => {
            const assigned = await Ticket_js_1.Ticket.countDocuments({ assignedTechnician: tech._id });
            const resolved = await Ticket_js_1.Ticket.countDocuments({
                assignedTechnician: tech._id,
                status: { $in: ['resolved', 'closed'] },
            });
            const breached = await Ticket_js_1.Ticket.countDocuments({
                assignedTechnician: tech._id,
                slaStatus: 'breached',
            });
            const compliance = assigned > 0
                ? Math.round(((assigned - breached) / assigned) * 100)
                : 100;
            return {
                id: tech._id,
                name: tech.name,
                email: tech.email,
                avatarUrl: tech.avatarUrl,
                assignedTickets: assigned,
                resolvedTickets: resolved,
                breachedTickets: breached,
                complianceRate: compliance,
            };
        }));
        return results.sort((a, b) => b.resolvedTickets - a.resolvedTickets);
    }
    static async getVolumeOverTime(days = 30) {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        const data = await Ticket_js_1.Ticket.aggregate([
            { $match: { createdAt: { $gte: sinceDate } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    created: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        return data.map((d) => ({
            date: d._id,
            created: d.created,
            resolved: d.resolved,
        }));
    }
    static async getAssetMetrics() {
        const [byStatus, byType, expiringCount] = await Promise.all([
            Asset_js_1.Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Asset_js_1.Asset.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
            Asset_js_1.Asset.countDocuments({
                warrantyExpiration: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Next 60 days
                },
            }),
        ]);
        return {
            byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
            byType: byType.map((t) => ({ type: t._id, count: t.count })),
            expiringWarrantiesNext60Days: expiringCount,
        };
    }
    static async generateTicketsCSV() {
        const tickets = await Ticket_js_1.Ticket.find()
            .populate('requester department assignedTechnician')
            .sort({ createdAt: -1 });
        const headers = [
            'Ticket ID',
            'Title',
            'Category',
            'Priority',
            'Status',
            'SLA Status',
            'Requester',
            'Department',
            'Assignee',
            'Created At',
            'Resolved At',
        ];
        const rows = tickets.map((t) => [
            t.ticketId,
            `"${(t.title || '').replace(/"/g, '""')}"`,
            t.category,
            t.priority,
            t.status,
            t.slaStatus,
            `"${t.requester?.name || 'Unknown'}"`,
            `"${t.department?.name || 'N/A'}"`,
            `"${t.assignedTechnician?.name || 'Unassigned'}"`,
            t.createdAt ? t.createdAt.toISOString() : '',
            t.resolvedAt ? t.resolvedAt.toISOString() : '',
        ]);
        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }
}
exports.ReportService = ReportService;
