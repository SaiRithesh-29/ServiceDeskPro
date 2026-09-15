"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kbValidator = exports.voteKBSchema = exports.createKBSchema = void 0;
const zod_1 = require("zod");
exports.createKBSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
        category: zod_1.z.string().min(2, 'Category is required'),
        problem: zod_1.z.string().min(10, 'Problem description is required'),
        symptoms: zod_1.z.string().optional().default(''),
        solution: zod_1.z.string().min(10, 'Solution is required'),
        tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
        status: zod_1.z.enum(['draft', 'published']).optional().default('published'),
    }),
});
exports.voteKBSchema = zod_1.z.object({
    body: zod_1.z.object({
        voteType: zod_1.z.enum(['helpful', 'unhelpful']),
    }),
});
exports.kbValidator = {
    createArticle: exports.createKBSchema,
    updateArticle: zod_1.z.object({ body: exports.createKBSchema.shape.body.partial() }),
    voteArticle: exports.voteKBSchema,
    updateStatus: zod_1.z.object({ body: zod_1.z.object({ status: zod_1.z.enum(['draft', 'published']) }) }),
};
