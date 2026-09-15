"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingController = void 0;
const SystemSetting_1 = require("../models/SystemSetting");
const Department_1 = require("../models/Department");
const AppError_1 = require("../utils/AppError");
class SettingController {
    static async getSettings(req, res, next) {
        try {
            const settings = await SystemSetting_1.SystemSetting.find();
            const settingsMap = {};
            settings.forEach((setting) => {
                settingsMap[setting.key] = setting.value;
            });
            res.status(200).json({
                success: true,
                data: settingsMap,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getSetting(req, res, next) {
        try {
            const { key } = req.params;
            const setting = await SystemSetting_1.SystemSetting.findOne({ key });
            if (!setting) {
                throw new AppError_1.AppError('Setting not found', 404);
            }
            res.status(200).json({
                success: true,
                data: { key: setting.key, value: setting.value },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateSetting(req, res, next) {
        try {
            const { key } = req.params;
            const { value } = req.body;
            let setting = await SystemSetting_1.SystemSetting.findOne({ key });
            if (setting) {
                setting.value = value;
                await setting.save();
            }
            else {
                setting = new SystemSetting_1.SystemSetting({ key, value });
                await setting.save();
            }
            res.status(200).json({
                success: true,
                data: { key: setting.key, value: setting.value },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getBusinessHours(req, res, next) {
        try {
            const settings = await SystemSetting_1.SystemSetting.find({
                key: { $in: ['businessHours', 'businessDays', 'timezone'] },
            });
            const data = {};
            settings.forEach((s) => {
                data[s.key] = s.value;
            });
            res.status(200).json({
                success: true,
                data: {
                    businessHours: data.businessHours || { start: '09:00', end: '18:00' },
                    businessDays: data.businessDays || [1, 2, 3, 4, 5], // Mon-Fri
                    timezone: data.timezone || 'UTC',
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateBusinessHours(req, res, next) {
        try {
            const { businessHours, businessDays, timezone } = req.body;
            if (businessHours) {
                await SystemSetting_1.SystemSetting.updateOne({ key: 'businessHours' }, { key: 'businessHours', value: businessHours }, { upsert: true });
            }
            if (businessDays) {
                await SystemSetting_1.SystemSetting.updateOne({ key: 'businessDays' }, { key: 'businessDays', value: businessDays }, { upsert: true });
            }
            if (timezone) {
                await SystemSetting_1.SystemSetting.updateOne({ key: 'timezone' }, { key: 'timezone', value: timezone }, { upsert: true });
            }
            res.status(200).json({
                success: true,
                message: 'Business hours updated',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getCategories(req, res, next) {
        try {
            const setting = await SystemSetting_1.SystemSetting.findOne({ key: 'ticketCategories' });
            res.status(200).json({
                success: true,
                data: setting?.value || [
                    'Hardware',
                    'Software',
                    'Network',
                    'Account & Access',
                    'Email',
                    'Security',
                    'Printer',
                    'VPN',
                    'Application',
                    'Other',
                ],
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createCategory(req, res, next) {
        try {
            const { category } = req.body;
            let setting = await SystemSetting_1.SystemSetting.findOne({ key: 'ticketCategories' });
            const categories = setting?.value || [];
            if (!categories.includes(category)) {
                categories.push(category);
                if (setting) {
                    setting.value = categories;
                    await setting.save();
                }
                else {
                    setting = new SystemSetting_1.SystemSetting({ key: 'ticketCategories', value: categories });
                    await setting.save();
                }
            }
            res.status(201).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const { category } = req.body;
            let setting = await SystemSetting_1.SystemSetting.findOne({ key: 'ticketCategories' });
            const categories = setting?.value || [];
            const index = parseInt(id, 10);
            if (index >= 0 && index < categories.length) {
                categories[index] = category;
                if (setting) {
                    setting.value = categories;
                    await setting.save();
                }
            }
            res.status(200).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            let setting = await SystemSetting_1.SystemSetting.findOne({ key: 'ticketCategories' });
            let categories = setting?.value || [];
            const index = parseInt(id, 10);
            if (index >= 0 && index < categories.length) {
                categories = categories.filter((_, i) => i !== index);
                if (setting) {
                    setting.value = categories;
                    await setting.save();
                }
            }
            res.status(200).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPriorities(req, res, next) {
        try {
            res.status(200).json({
                success: true,
                data: ['low', 'medium', 'high', 'critical'],
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getDepartments(req, res, next) {
        try {
            const departments = await Department_1.Department.find({ isActive: true });
            res.status(200).json({
                success: true,
                data: departments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createDepartment(req, res, next) {
        try {
            const { name, code, description, manager } = req.body;
            const department = new Department_1.Department({
                name,
                code,
                description,
                manager,
            });
            await department.save();
            res.status(201).json({
                success: true,
                data: department,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateDepartment(req, res, next) {
        try {
            const { id } = req.params;
            const { name, code, description, manager, isActive } = req.body;
            const department = await Department_1.Department.findByIdAndUpdate(id, { name, code, description, manager, isActive }, { new: true, runValidators: true });
            if (!department) {
                throw new AppError_1.AppError('Department not found', 404);
            }
            res.status(200).json({
                success: true,
                data: department,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteDepartment(req, res, next) {
        try {
            const { id } = req.params;
            const department = await Department_1.Department.findByIdAndDelete(id);
            if (!department) {
                throw new AppError_1.AppError('Department not found', 404);
            }
            res.status(200).json({
                success: true,
                message: 'Department deleted',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SettingController = SettingController;
