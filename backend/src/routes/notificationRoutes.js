"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Get user's notifications
router.get('/', notificationController_1.NotificationController.getNotifications);
// Mark notification as read
router.patch('/:id/read', notificationController_1.NotificationController.markAsRead);
// Mark all as read
router.post('/mark-all/read', notificationController_1.NotificationController.markAllAsRead);
// Delete notification
router.delete('/:id', notificationController_1.NotificationController.deleteNotification);
// Delete all notifications
router.delete('/', notificationController_1.NotificationController.deleteAllNotifications);
// Get notification preferences
router.get('/preferences', notificationController_1.NotificationController.getPreferences);
// Update notification preferences
router.patch('/preferences', notificationController_1.NotificationController.updatePreferences);
exports.default = router;
