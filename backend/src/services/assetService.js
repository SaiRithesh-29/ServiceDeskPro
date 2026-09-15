"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const Asset_js_1 = require("../models/Asset.js");
const AssetHistory_js_1 = require("../models/AssetHistory.js");
const User_js_1 = require("../models/User.js");
const Ticket_js_1 = require("../models/Ticket.js");
const notificationService_js_1 = require("./notificationService.js");
const auditService_js_1 = require("./auditService.js");
const AppError_js_1 = require("../utils/AppError.js");
const mongoose_1 = __importDefault(require("mongoose"));
class AssetService {
    /**
     * Generates next sequential Asset ID (e.g. AST-1001).
     */
    static async getNextAssetId() {
        const latest = await Asset_js_1.Asset.findOne({}, { assetId: 1 }).sort({ createdAt: -1 });
        if (!latest || !latest.assetId)
            return 'AST-1001';
        const match = latest.assetId.match(/AST-(\d+)/);
        if (!match)
            return 'AST-1001';
        const nextNum = parseInt(match[1], 10) + 1;
        return `AST-${nextNum}`;
    }
    /**
     * Creates a new Asset and records procurement in history.
     */
    static async createAsset(data, user, reqMeta) {
        const assetId = await this.getNextAssetId();
        const asset = await Asset_js_1.Asset.create({
            ...data,
            assetId,
            status: data.assignedUser ? 'assigned' : 'available',
        });
        // Record procurement in history
        await AssetHistory_js_1.AssetHistory.create({
            asset: asset._id,
            action: 'procured',
            performedBy: user._id,
            details: `Asset ${asset.name} (${asset.assetId}) procured and registered in system.`,
            date: new Date(),
        });
        if (data.assignedUser) {
            await AssetHistory_js_1.AssetHistory.create({
                asset: asset._id,
                action: 'assigned',
                performedBy: user._id,
                assignedTo: data.assignedUser,
                details: `Assigned initially upon procurement to user.`,
                date: new Date(),
            });
            await notificationService_js_1.NotificationService.send({
                recipient: data.assignedUser,
                type: 'asset_assigned',
                title: `Asset Assigned: ${asset.name}`,
                message: `Asset ${asset.assetId} (${asset.manufacturer} ${asset.model}) has been assigned to you.`,
                link: `/assets/${asset.assetId}`,
            });
        }
        await auditService_js_1.AuditService.log({
            req: reqMeta?.req,
            user,
            action: 'CREATE_ASSET',
            entityType: 'asset',
            entityId: asset.assetId,
            entityDisplay: asset.name,
        });
        return asset;
    }
    /**
     * Assigns an asset to a user.
     */
    static async assignAsset(assetId, targetUserId, user, reqMeta) {
        const asset = await Asset_js_1.Asset.findOne({
            $or: [{ _id: mongoose_1.default.isValidObjectId(assetId) ? assetId : null }, { assetId }],
        });
        if (!asset)
            throw new AppError_js_1.AppError('Asset not found', 404);
        const targetUser = await User_js_1.User.findById(targetUserId);
        if (!targetUser)
            throw new AppError_js_1.AppError('Target user not found', 404);
        const prevUser = asset.assignedUser;
        asset.assignedUser = targetUser._id;
        asset.department = targetUser.department;
        asset.status = 'assigned';
        await asset.save();
        await AssetHistory_js_1.AssetHistory.create({
            asset: asset._id,
            action: 'assigned',
            performedBy: user._id,
            assignedTo: targetUser._id,
            details: `Asset assigned to ${targetUser.name} (${targetUser.email}).`,
            date: new Date(),
        });
        await notificationService_js_1.NotificationService.send({
            recipient: targetUser._id,
            sender: user._id,
            type: 'asset_assigned',
            title: `Asset Assigned: ${asset.name}`,
            message: `Asset ${asset.assetId} (${asset.model}) has been assigned to your account.`,
            link: `/assets/${asset.assetId}`,
        });
        await auditService_js_1.AuditService.log({
            req: reqMeta?.req,
            user,
            action: 'ASSIGN_ASSET',
            entityType: 'asset',
            entityId: asset.assetId,
            entityDisplay: asset.name,
            changes: { previous: prevUser, current: targetUser._id },
        });
        return asset;
    }
    /**
     * Unassigns an asset (makes it available).
     */
    static async unassignAsset(assetId, user, reqMeta) {
        const asset = await Asset_js_1.Asset.findOne({
            $or: [{ _id: mongoose_1.default.isValidObjectId(assetId) ? assetId : null }, { assetId }],
        });
        if (!asset)
            throw new AppError_js_1.AppError('Asset not found', 404);
        const prevUser = asset.assignedUser;
        asset.assignedUser = undefined;
        asset.status = 'available';
        await asset.save();
        await AssetHistory_js_1.AssetHistory.create({
            asset: asset._id,
            action: 'unassigned',
            performedBy: user._id,
            details: `Asset returned and checked in to inventory.`,
            date: new Date(),
        });
        await auditService_js_1.AuditService.log({
            req: reqMeta?.req,
            user,
            action: 'UNASSIGN_ASSET',
            entityType: 'asset',
            entityId: asset.assetId,
            entityDisplay: asset.name,
            changes: { previous: prevUser, current: null },
        });
        return asset;
    }
    /**
     * Updates asset status (e.g. under_repair, retired).
     */
    static async updateStatus(assetId, status, details, user, reqMeta) {
        const asset = await Asset_js_1.Asset.findOne({
            $or: [{ _id: mongoose_1.default.isValidObjectId(assetId) ? assetId : null }, { assetId }],
        });
        if (!asset)
            throw new AppError_js_1.AppError('Asset not found', 404);
        const prevStatus = asset.status;
        asset.status = status;
        if (status === 'retired' || status === 'lost') {
            asset.assignedUser = undefined;
        }
        await asset.save();
        let action = 'status_changed';
        if (status === 'under_repair')
            action = 'sent_to_repair';
        if (status === 'available' && prevStatus === 'under_repair')
            action = 'repaired';
        if (status === 'retired')
            action = 'retired';
        await AssetHistory_js_1.AssetHistory.create({
            asset: asset._id,
            action,
            performedBy: user._id,
            details: details || `Status changed from ${prevStatus} to ${status}.`,
            date: new Date(),
        });
        await auditService_js_1.AuditService.log({
            req: reqMeta?.req,
            user,
            action: 'UPDATE_ASSET_STATUS',
            entityType: 'asset',
            entityId: asset.assetId,
            entityDisplay: asset.name,
            changes: { previous: prevStatus, current: status },
        });
        return asset;
    }
    /**
     * Gets full asset details with history and linked tickets.
     */
    static async getAssetWithDetails(assetId) {
        const asset = await Asset_js_1.Asset.findOne({
            $or: [{ _id: mongoose_1.default.isValidObjectId(assetId) ? assetId : null }, { assetId }],
        }).populate('assignedUser department');
        if (!asset)
            throw new AppError_js_1.AppError('Asset not found', 404);
        const history = await AssetHistory_js_1.AssetHistory.find({ asset: asset._id })
            .populate('performedBy assignedTo', 'name email avatarUrl')
            .sort({ date: -1 });
        const relatedTickets = await Ticket_js_1.Ticket.find({ asset: asset._id })
            .populate('requester assignedTechnician', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);
        return {
            asset,
            history,
            relatedTickets,
        };
    }
}
exports.AssetService = AssetService;
