"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidator = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
        email: zod_1.z.string().email('Please provide a valid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        departmentName: zod_1.z.string().min(2, 'Department must be at least 2 characters').max(100),
        jobFunction: zod_1.z.string().min(2, 'Job function must be at least 2 characters').max(100),
        jobLevel: zod_1.z.enum([
            'entry_level',
            'individual_contributor',
            'senior_lead',
            'manager',
            'senior_manager',
            'director',
            'senior_director',
            'vp_svp',
            'c_level',
        ], { required_error: 'Job level is required' }),
        phone: zod_1.z.string().optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Please provide a valid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100).optional(),
        phone: zod_1.z.string().optional(),
        avatarUrl: zod_1.z.string().optional(),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({ body: zod_1.z.object({ email: zod_1.z.string().email() }) });
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({ token: zod_1.z.string().min(1), newPassword: zod_1.z.string().min(6) }),
});
exports.authValidator = {
    register: exports.registerSchema,
    login: exports.loginSchema,
    updateProfile: exports.updateProfileSchema,
    changePassword: exports.changePasswordSchema,
    forgotPassword: exports.forgotPasswordSchema,
    resetPassword: exports.resetPasswordSchema,
};
