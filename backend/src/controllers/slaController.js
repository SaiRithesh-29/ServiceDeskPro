"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLAController = void 0;
const SLAPolicy_1 = require("../models/SLAPolicy");
const AppError_1 = require("../utils/AppError");
class SLAController {
    static async getSLAPolicies(req, res, next) {
        try {
            const { priority, isDefault, page = '1', limit = '20' } = req.query;
            const filter = {};
            if (priority)
                filter.priority = priority;
            if (isDefault !== undefined)
                filter.isDefault = isDefault === 'true';
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 20;
            const skip = (pageNum - 1) * limitNum;
            const [policies, total] = await Promise.all([
                SLAPolicy_1.SLAPolicy.find(filter)
                    .sort({ priority: 1 })
                    .skip(skip)
                    .limit(limitNum),
                SLAPolicy_1.SLAPolicy.countDocuments(filter),
            ]);
            res.status(200).json({
                success: true,
                data: policies,
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
    static async createSLA(req, res, next) {
        try {
            const { name, priority, responseTimeMinutes, resolutionTimeMinutes, operatingHours } = req.body;
            const policy = new SLAPolicy_1.SLAPolicy({
                name,
                priority,
                responseTimeMinutes,
                resolutionTimeMinutes,
                operatingHours,
            });
            await policy.save();
            res.status(201).json({
                success: true,
                data: policy,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getSLAById(req, res, next) {
        try {
            const { id } = req.params;
            const policy = await SLAPolicy_1.SLAPolicy.findById(id);
            if (!policy) {
                throw new AppError_1.AppError('SLA policy not found', 404);
            }
            res.status(200).json({
                success: true,
                data: policy,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateSLA(req, res, next) {
        try {
            const { id } = req.params;
            const { name, priority, responseTimeMinutes, resolutionTimeMinutes, operatingHours } = req.body;
            const policy = await SLAPolicy_1.SLAPolicy.findByIdAndUpdate(id, {
                name,
                priority,
                responseTimeMinutes,
                resolutionTimeMinutes,
                operatingHours,
            }, { new: true, runValidators: true });
            if (!policy) {
                throw new AppError_1.AppError('SLA policy not found', 404);
            }
            res.status(200).json({
                success: true,
                data: policy,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteSLA(req, res, next) {
        try {
            const { id } = req.params;
            const policy = await SLAPolicy_1.SLAPolicy.findByIdAndDelete(id);
            if (!policy) {
                throw new AppError_1.AppError('SLA policy not found', 404);
            }
            res.status(200).json({
                success: true,
                message: 'SLA policy deleted',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async setDefault(req, res, next) {
        try {
            const { id } = req.params;
            // Unset all other defaults
            await SLAPolicy_1.SLAPolicy.updateMany({ isDefault: true }, { isDefault: false });
            // Set this one as default
            const policy = await SLAPolicy_1.SLAPolicy.findByIdAndUpdate(id, { isDefault: true }, { new: true });
            if (!policy) {
                throw new AppError_1.AppError('SLA policy not found', 404);
            }
            res.status(200).json({
                success: true,
                data: policy,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SLAController = SLAController;
