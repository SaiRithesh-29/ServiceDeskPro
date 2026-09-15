"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const User_js_1 = require("../models/User.js");
const Ticket_js_1 = require("../models/Ticket.js");
const Asset_js_1 = require("../models/Asset.js");
const AppError_js_1 = require("../utils/AppError.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    static async getUsers(req, res, next) {
        try {
            const { role, department, team, isActive, search, page = '1', limit = '20' } = req.query;
            const filter = {};
            if (role)
                filter.role = role;
            if (department)
                filter.department = department;
            if (team)
                filter.team = team;
            if (isActive !== undefined)
                filter.isActive = isActive === 'true';
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
            }
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 20;
            const skip = (pageNum - 1) * limitNum;
            const [users, total] = await Promise.all([
                User_js_1.User.find(filter)
                    .populate('department team')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                User_js_1.User.countDocuments(filter),
            ]);
            res.status(200).json({
                success: true,
                data: users,
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
    static async createUser(req, res, next) {
        try {
            const { name, email, password, role, department, team, phone } = req.body;
            const existing = await User_js_1.User.findOne({ email: email.toLowerCase() });
            if (existing)
                throw new AppError_js_1.AppError('Email already in use', 400);
            const salt = await bcryptjs_1.default.genSalt(10);
            const passwordHash = await bcryptjs_1.default.hash(password, salt);
            const user = await User_js_1.User.create({
                name,
                email: email.toLowerCase(),
                passwordHash,
                role,
                department: department || undefined,
                team: team || undefined,
                phone: phone || '',
                isActive: true,
            });
            res.status(201).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User_js_1.User.findById(id).populate('department team');
            if (!user)
                throw new AppError_js_1.AppError('User not found', 404);
            const [assignedAssets, submittedTickets] = await Promise.all([
                Asset_js_1.Asset.find({ assignedUser: user._id }),
                Ticket_js_1.Ticket.find({ requester: user._id }).sort({ createdAt: -1 }).limit(10),
            ]);
            res.status(200).json({
                success: true,
                data: {
                    user,
                    assignedAssets,
                    submittedTickets,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User_js_1.User.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            }).populate('department team');
            if (!user)
                throw new AppError_js_1.AppError('User not found', 404);
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User_js_1.User.findById(id);
            if (!user)
                throw new AppError_js_1.AppError('User not found', 404);
            user.isActive = !user.isActive;
            await user.save();
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
