"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const Notification_1 = require("../models/Notification");
const AppError_1 = require("../utils/AppError");
class NotificationController {
    static async getNotifications(req, res, next) {
        try {
            const { isRead, page = '1', limit = '20' } = req.query;
            const filter = { recipient: req.user?._id };
            if (isRead !== undefined) {
                filter.isRead = isRead === 'true';
            }
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 20;
            const skip = (pageNum - 1) * limitNum;
            const [notifications, total, unreadCount] = await Promise.all([
                Notification_1.Notification.find(filter)
                    .populate('sender', 'name email avatarUrl')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                Notification_1.Notification.countDocuments(filter),
                Notification_1.Notification.countDocuments({ recipient: req.user?._id, isRead: false }),
            ]);
            res.status(200).json({
                success: true,
                data: notifications,
                unreadCount,
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
    static async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const notification = await Notification_1.Notification.findById(id);
            if (!notification) {
                throw new AppError_1.AppError('Notification not found', 404);
            }
            if (notification.recipient.toString() !== req.user?._id.toString()) {
                throw new AppError_1.AppError('Unauthorized', 403);
            }
            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();
            res.status(200).json({
                success: true,
                data: notification,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            await Notification_1.Notification.updateMany({ recipient: req.user?._id, isRead: false }, { isRead: true, readAt: new Date() });
            res.status(200).json({
                success: true,
                message: 'All notifications marked as read',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteNotification(req, res, next) {
        try {
            const { id } = req.params;
            const notification = await Notification_1.Notification.findById(id);
            if (!notification) {
                throw new AppError_1.AppError('Notification not found', 404);
            }
            if (notification.recipient.toString() !== req.user?._id.toString()) {
                throw new AppError_1.AppError('Unauthorized', 403);
            }
            await Notification_1.Notification.findByIdAndDelete(id);
            res.status(200).json({
                success: true,
                message: 'Notification deleted',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAllNotifications(req, res, next) {
        try {
            await Notification_1.Notification.deleteMany({ recipient: req.user?._id });
            res.status(200).json({
                success: true,
                message: 'All notifications deleted',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPreferences(req, res, next) {
        try {
            // TODO: Implement notification preferences storage in User model or separate model
            res.status(200).json({
                success: true,
                data: {
                    emailNotifications: true,
                    inAppNotifications: true,
                    ticketNotifications: true,
                    assetNotifications: true,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePreferences(req, res, next) {
        try {
            // TODO: Implement notification preferences update
            res.status(200).json({
                success: true,
                message: 'Preferences updated',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
