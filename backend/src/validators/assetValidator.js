"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetValidator = exports.updateAssetStatusSchema = exports.assignAssetSchema = exports.createAssetSchema = void 0;
const zod_1 = require("zod");
exports.createAssetSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Asset name is required'),
        type: zod_1.z.enum([
            'Laptop',
            'Desktop',
            'Monitor',
            'Keyboard',
            'Mouse',
            'Printer',
            'Router',
            'Server',
            'Mobile',
            'Software License',
            'Other',
        ]),
        serialNumber: zod_1.z.string().min(2, 'Serial number is required'),
        manufacturer: zod_1.z.string().min(1, 'Manufacturer is required'),
        model: zod_1.z.string().min(1, 'Model is required'),
        purchaseDate: zod_1.z.string(),
        purchaseCost: zod_1.z.number().optional().default(0),
        warrantyExpiration: zod_1.z.string(),
        assignedUser: zod_1.z.string().nullable().optional(),
        department: zod_1.z.string().nullable().optional(),
        location: zod_1.z.string().optional(),
        vendor: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        specifications: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
exports.assignAssetSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().min(1, 'Target user ID is required'),
    }),
});
exports.updateAssetStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['available', 'assigned', 'under_repair', 'lost', 'retired']),
        details: zod_1.z.string().optional().default(''),
    }),
});
exports.assetValidator = {
    createAsset: exports.createAssetSchema,
    updateAsset: zod_1.z.object({ body: exports.createAssetSchema.shape.body.partial() }),
    assignAsset: exports.assignAssetSchema,
    updateStatus: exports.updateAssetStatusSchema,
};
