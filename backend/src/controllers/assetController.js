"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const assetService_js_1 = require("../services/assetService.js");
const Asset_js_1 = require("../models/Asset.js");
const AppError_js_1 = require("../utils/AppError.js");
const mongoose_1 = __importDefault(require("mongoose"));
class AssetController {
    static async getAssets(req, res, next) {
        try {
            const { type, status, department, assignedUser, search, expiringSoon, page = '1', limit = '15', sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
            const filter = {};
            if (type)
                filter.type = type;
            if (status)
                filter.status = status;
            if (department)
                filter.department = department;
            if (assignedUser)
                filter.assignedUser = assignedUser;
            if (expiringSoon === 'true') {
                filter.warrantyExpiration = {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Next 60 days
                };
            }
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                filter.$or = [
                    { assetId: searchRegex },
                    { name: searchRegex },
                    { serialNumber: searchRegex },
                    { manufacturer: searchRegex },
                    { model: searchRegex },
                ];
            }
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 15;
            const skip = (pageNum - 1) * limitNum;
            const sortDirection = sortOrder === 'asc' ? 1 : -1;
            const [assets, total] = await Promise.all([
                Asset_js_1.Asset.find(filter)
                    .populate('assignedUser department')
                    .sort({ [sortBy]: sortDirection })
                    .skip(skip)
                    .limit(limitNum),
                Asset_js_1.Asset.countDocuments(filter),
            ]);
            res.status(200).json({
                success: true,
                data: assets,
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
    static async createAsset(req, res, next) {
        try {
            const asset = await assetService_js_1.AssetService.createAsset(req.body, req.user, { req });
            res.status(201).json({
                success: true,
                data: asset,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAssetById(req, res, next) {
        try {
            const { id } = req.params;
            const data = await assetService_js_1.AssetService.getAssetWithDetails(id);
            res.status(200).json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAsset(req, res, next) {
        try {
            const { id } = req.params;
            const isObjectId = mongoose_1.default.isValidObjectId(id);
            const asset = await Asset_js_1.Asset.findOneAndUpdate({ $or: [{ _id: isObjectId ? id : null }, { assetId: id }] }, req.body, { new: true, runValidators: true }).populate('assignedUser department');
            if (!asset)
                throw new AppError_js_1.AppError('Asset not found', 404);
            res.status(200).json({
                success: true,
                data: asset,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async assignAsset(req, res, next) {
        try {
            const { id } = req.params;
            const { userId } = req.body;
            const asset = await assetService_js_1.AssetService.assignAsset(id, userId, req.user, { req });
            res.status(200).json({
                success: true,
                data: asset,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async unassignAsset(req, res, next) {
        try {
            const { id } = req.params;
            const asset = await assetService_js_1.AssetService.unassignAsset(id, req.user, { req });
            res.status(200).json({
                success: true,
                data: asset,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, details } = req.body;
            const asset = await assetService_js_1.AssetService.updateStatus(id, status, details, req.user, { req });
            res.status(200).json({
                success: true,
                data: asset,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAsset(req, res, next) {
        try {
            const { id } = req.params;
            const asset = await Asset_js_1.Asset.findOneAndDelete({
                $or: [{ _id: mongoose_1.default.isValidObjectId(id) ? id : null }, { assetId: id }],
            });
            if (!asset)
                throw new AppError_js_1.AppError('Asset not found', 404);
            res.status(200).json({
                success: true,
                message: `Asset ${asset.assetId} deleted successfully`,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AssetController = AssetController;
