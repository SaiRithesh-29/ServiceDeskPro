"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_js_1 = require("../services/authService.js");
const User_js_1 = require("../models/User.js");
const AppError_js_1 = require("../utils/AppError.js");
const jwt_js_1 = require("../utils/jwt.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await authService_js_1.AuthService.register(req.body);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(201).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService_js_1.AuthService.login(email, password);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const token = req.cookies.refreshToken || req.body.refreshToken;
            if (!token) {
                throw new AppError_js_1.AppError('No refresh token provided', 401);
            }
            const payload = (0, jwt_js_1.verifyRefreshToken)(token);
            const user = await User_js_1.User.findById(payload.id).populate('department team');
            if (!user || !user.isActive) {
                throw new AppError_js_1.AppError('Invalid token or deactivated user', 401);
            }
            const tokens = authService_js_1.AuthService.generateTokens(user);
            res.status(200).json({
                success: true,
                data: tokens,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(_req, res, next) {
        try {
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            const user = await User_js_1.User.findById(req.user._id).populate('department team');
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const { name, phone, avatarUrl } = req.body;
            const user = await User_js_1.User.findById(req.user._id);
            if (!user)
                throw new AppError_js_1.AppError('User not found', 404);
            if (name)
                user.name = name;
            if (phone !== undefined)
                user.phone = phone;
            if (avatarUrl !== undefined)
                user.avatarUrl = avatarUrl;
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
    static async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await User_js_1.User.findById(req.user._id).select('+passwordHash');
            if (!user)
                throw new AppError_js_1.AppError('User not found', 404);
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                throw new AppError_js_1.AppError('Current password does not match', 400);
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            user.passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
            await user.save();
            res.status(200).json({
                success: true,
                message: 'Password changed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const user = await User_js_1.User.findOne({ email: email.toLowerCase() });
            if (!user) {
                throw new AppError_js_1.AppError('User not found', 404);
            }
            // Generate reset token
            const resetToken = require('crypto').randomBytes(32).toString('hex');
            const hashedToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            await user.save();
            // TODO: Send email with reset link
            // const resetLink = `${env.CLIENT_URL}/reset-password/${resetToken}`;
            res.status(200).json({
                success: true,
                message: 'Password reset email sent. Check your inbox for the reset link.',
                // For development only - remove in production
                resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { resetToken, newPassword } = req.body;
            const hashedToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');
            const user = await User_js_1.User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpire: { $gt: Date.now() },
            });
            if (!user) {
                throw new AppError_js_1.AppError('Invalid or expired reset token', 400);
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            user.passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(200).json({
                success: true,
                message: 'Password reset successfully. You can now log in with your new password.',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
