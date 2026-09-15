"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Notification_js_1 = require("../models/Notification.js");
const logger_js_1 = require("../utils/logger.js");
class NotificationService {
    static async send(params) {
        try {
            await Notification_js_1.Notification.create({
                recipient: params.recipient,
                sender: params.sender,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link || '',
                metadata: params.metadata || {},
            });
            logger_js_1.logger.info(`Notification sent to ${params.recipient}: ${params.title}`);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to create notification:', error.message);
        }
    }
    static async sendToMany(recipients, params) {
        try {
            const docs = recipients.map((r) => ({
                recipient: r,
                sender: params.sender,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link || '',
                metadata: params.metadata || {},
            }));
            if (docs.length > 0) {
                await Notification_js_1.Notification.insertMany(docs);
            }
        }
        catch (error) {
            logger_js_1.logger.error('Failed to create bulk notifications:', error.message);
        }
    }
}
exports.NotificationService = NotificationService;
