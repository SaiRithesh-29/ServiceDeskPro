"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidator = exports.createSLAPolicySchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name is required'),
        email: zod_1.z.string().email('Valid email is required'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        role: zod_1.z.enum(['admin', 'it_manager', 'technician', 'employee', 'asset_manager']),
        department: zod_1.z.string().optional(),
        team: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional().default(true),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        role: zod_1.z.enum(['admin', 'it_manager', 'technician', 'employee', 'asset_manager']).optional(),
        department: zod_1.z.string().nullable().optional(),
        team: zod_1.z.string().nullable().optional(),
        phone: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.createSLAPolicySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Policy name is required'),
        description: zod_1.z.string().optional().default(''),
        priority: zod_1.z.enum(['critical', 'high', 'medium', 'low']),
        responseTimeMinutes: zod_1.z.number().min(5, 'Response time must be at least 5 minutes'),
        resolutionTimeMinutes: zod_1.z.number().min(10, 'Resolution time must be at least 10 minutes'),
        operatingHours: zod_1.z.enum(['business_hours', '24_7']).default('business_hours'),
        isDefault: zod_1.z.boolean().optional().default(false),
        isActive: zod_1.z.boolean().optional().default(true),
    }),
});
exports.userValidator = {
    createUser: exports.createUserSchema,
    updateUser: exports.updateUserSchema,
    updateStatus: zod_1.z.object({ body: zod_1.z.object({ isActive: zod_1.z.boolean().optional() }) }),
    updateRole: zod_1.z.object({ body: zod_1.z.object({ role: zod_1.z.enum(['admin', 'it_manager', 'technician', 'employee', 'asset_manager']) }) }),
    bulkDeactivate: zod_1.z.object({ body: zod_1.z.object({ userIds: zod_1.z.array(zod_1.z.string()).min(1) }) }),
    bulkAssignTeam: zod_1.z.object({ body: zod_1.z.object({ userIds: zod_1.z.array(zod_1.z.string()).min(1), teamId: zod_1.z.string() }) }),
    createSLA: exports.createSLAPolicySchema,
    updateSLA: zod_1.z.object({ body: exports.createSLAPolicySchema.shape.body.partial() }),
};
