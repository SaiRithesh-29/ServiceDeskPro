"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_js_1 = require("../models/User.js");
const Department_js_1 = require("../models/Department.js");
const jwt_js_1 = require("../utils/jwt.js");
const AppError_js_1 = require("../utils/AppError.js");
const auditService_js_1 = require("./auditService.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const emailService_js_1 = require("../utils/emailService.js");
class AuthService {
    static generateTokens(user) {
        const payload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const accessToken = (0, jwt_js_1.signAccessToken)(payload);
        const refreshToken = (0, jwt_js_1.signRefreshToken)(payload);
        return { accessToken, refreshToken, user: payload };
    }
    static async register(data) {
        const existing = await User_js_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw new AppError_js_1.AppError('An account with this email already exists', 400);
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(data.password, salt);
        
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const emailVerificationToken = crypto_1.default.createHash('sha256').update(verificationToken).digest('hex');
        const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        const user = await User_js_1.User.create({
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash,
            role: 'employee',
            departmentName: data.departmentName || '',
            jobFunction: data.jobFunction || '',
            jobLevel: data.jobLevel || '',
            phone: data.phone || '',
            isActive: true,
            isEmailVerified: true,
            lastLoginAt: new Date(),
        });
        
        await auditService_js_1.AuditService.log({
            user,
            action: 'USER_REGISTERED',
            entityType: 'auth',
            entityId: user._id.toString(),
            entityDisplay: user.email,
        });
        return {
            message: 'Registration successful. You can now log in.',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    static async login(email, password) {
        const user = await User_js_1.User.findOne({ email: email.toLowerCase() })
            .select('+passwordHash')
            .populate('department team');
        if (!user) {
            throw new AppError_js_1.AppError('Invalid email or password', 401);
        }
        if (!user.isActive) {
            throw new AppError_js_1.AppError('Your account is inactive. Please contact your administrator.', 403);
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError_js_1.AppError('Invalid email or password', 401);
        }
        
        if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.isEmailVerified) {
            throw new AppError_js_1.AppError('Please verify your email address before logging in.', 403);
        }
        
        user.lastLoginAt = new Date();
        const tokens = this.generateTokens(user);
        
        // Save refresh token hash
        user.refreshTokenHash = crypto_1.default.createHash('sha256').update(tokens.refreshToken).digest('hex');
        user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        await user.save({ validateBeforeSave: false });
        
        await auditService_js_1.AuditService.log({
            user,
            action: 'USER_LOGIN',
            entityType: 'auth',
            entityId: user._id.toString(),
            entityDisplay: user.email,
        });
        return {
            ...tokens,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                team: user.team,
                phone: user.phone,
                avatarUrl: user.avatarUrl,
            },
        };
    }
}
exports.AuthService = AuthService;
