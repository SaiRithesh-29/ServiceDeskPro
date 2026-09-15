"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const AuditLog_1 = require("../models/AuditLog");
const AppError_1 = require("../utils/AppError");
class AuditController {
    static async getAuditLogs(req, res, next) {
        try {
            const { action, entityType, user, startDate, endDate, search, page = '1', limit = '50', } = req.query;
            const filter = {};
            if (action) {
                if (Array.isArray(action))
                    filter.action = { $in: action };
                else if (action.includes(','))
                    filter.action = { $in: action.split(',') };
                else
                    filter.action = action;
            }
            if (entityType)
                filter.entityType = entityType;
            if (user)
                filter.user = user;
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate)
                    filter.createdAt.$gte = new Date(startDate);
                if (endDate)
                    filter.createdAt.$lte = new Date(endDate);
            }
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                filter.$or = [
                    { action: searchRegex },
                    { entityDisplay: searchRegex },
                    { 'changes.field': searchRegex },
                ];
            }
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 50;
            const skip = (pageNum - 1) * limitNum;
            const [logs, total] = await Promise.all([
                AuditLog_1.AuditLog.find(filter)
                    .populate('user', 'name email role')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                AuditLog_1.AuditLog.countDocuments(filter),
            ]);
            res.status(200).json({
                success: true,
                data: logs,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAuditLogById(req, res, next) {
        try {
            const { id } = req.params;
            const log = await AuditLog_1.AuditLog.findById(id).populate('user', 'name email role');
            if (!log) {
                throw new AppError_1.AppError('Audit log not found', 404);
            }
            res.status(200).json({
                success: true,
                data: log,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async exportAuditLogs(req, res, next) {
        try {
            const { startDate, endDate, format = 'csv' } = req.body;
            const filter = {};
            if (startDate)
                filter.createdAt = { $gte: new Date(startDate) };
            if (endDate) {
                if (!filter.createdAt)
                    filter.createdAt = {};
                filter.createdAt.$lte = new Date(endDate);
            }
            const logs = await AuditLog_1.AuditLog.find(filter).populate('user', 'name email role');
            if (format === 'csv') {
                let csv = 'Date,User,Action,Entity Type,Entity ID,Changes\n';
                logs.forEach((log) => {
                    csv += `"${log.createdAt}","${log.user?.name || 'N/A'}","${log.action}","${log.entityType}","${log.entityId}","${JSON.stringify(log.changes || []).replace(/"/g, '""')}"\n`;
                });
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
                res.send(csv);
            }
            else if (format === 'json') {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.json"');
                res.json(logs);
            }
            else {
                throw new AppError_1.AppError('Unsupported format', 400);
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuditController = AuditController;
