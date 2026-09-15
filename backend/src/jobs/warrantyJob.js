"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWarrantyJob = void 0;
const Asset_js_1 = require("../models/Asset.js");
const User_js_1 = require("../models/User.js");
const notificationService_js_1 = require("../services/notificationService.js");
const logger_js_1 = require("../utils/logger.js");
const runWarrantyJob = async () => {
    try {
        const now = new Date();
        const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const expiringAssets = await Asset_js_1.Asset.find({
            status: { $in: ['available', 'assigned'] },
            warrantyExpiration: {
                $gte: now,
                $lte: thirtyDaysAhead,
            },
        });
        if (expiringAssets.length === 0)
            return;
        // Find Asset Managers and IT Managers to notify
        const managers = await User_js_1.User.find({
            role: { $in: ['asset_manager', 'it_manager', 'admin'] },
            isActive: true,
        });
        const managerIds = managers.map((m) => m._id);
        for (const asset of expiringAssets) {
            const daysLeft = Math.ceil((asset.warrantyExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            await notificationService_js_1.NotificationService.sendToMany(managerIds, {
                type: 'warranty_expiring',
                title: `Asset Warranty Expiring: ${asset.assetId}`,
                message: `Warranty for ${asset.name} (${asset.model}) expires in ${daysLeft} days.`,
                link: `/assets/${asset.assetId}`,
                metadata: { assetId: asset.assetId, daysLeft },
            });
        }
        logger_js_1.logger.info(`Warranty check completed: scanned ${expiringAssets.length} expiring assets`);
    }
    catch (error) {
        logger_js_1.logger.error('Error running Warranty background job:', error.message);
    }
};
exports.runWarrantyJob = runWarrantyJob;
