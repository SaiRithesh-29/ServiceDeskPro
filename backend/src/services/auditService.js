"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const AuditLog_js_1 = require("../models/AuditLog.js");
const logger_js_1 = require("../utils/logger.js");
class AuditService {
    static async log(params) {
        try {
            const userId = params.user?._id || params.req?.user?._id;
            const ipAddress = params.req?.ip ||
                params.req?.headers['x-forwarded-for'] ||
                params.req?.socket?.remoteAddress ||
                '';
            const userAgent = params.req?.headers['user-agent'] || '';
            await AuditLog_js_1.AuditLog.create({
                user: userId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                entityDisplay: params.entityDisplay,
                changes: params.changes,
                ipAddress,
                userAgent,
            });
        }
        catch (error) {
            logger_js_1.logger.error('Failed to write audit log:', error.message);
        }
    }
}
exports.AuditService = AuditService;
