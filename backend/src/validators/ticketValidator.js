"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketValidator = exports.createWorkLogSchema = exports.createCommentSchema = exports.assignTicketSchema = exports.updateTicketStatusSchema = exports.createTicketSchema = void 0;
const zod_1 = require("zod");
exports.createTicketSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5, 'Title must be at least 5 characters').max(200),
        description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
        category: zod_1.z
            .enum([
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
        ])
            .optional(),
        subcategory: zod_1.z.string().optional(),
        priority: zod_1.z.enum(['critical', 'high', 'medium', 'low']).optional(),
        department: zod_1.z.string().optional(),
        assignedTechnician: zod_1.z.string().optional(),
        assignedTeam: zod_1.z.string().optional(),
        asset: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        dueDate: zod_1.z.string().datetime().optional(),
    }),
});
exports.updateTicketStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum([
            'open',
            'assigned',
            'in_progress',
            'pending',
            'resolved',
            'closed',
            'reopened',
            'escalated',
        ]),
        resolutionNotes: zod_1.z.string().optional(),
    }),
});
exports.assignTicketSchema = zod_1.z.object({
    body: zod_1.z.object({
        technicianId: zod_1.z.string().nullable().optional(),
        teamId: zod_1.z.string().nullable().optional(),
    }),
});
exports.createCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Comment content is required'),
        isInternal: zod_1.z.boolean().optional().default(false),
        attachments: zod_1.z
            .array(zod_1.z.object({
            fileName: zod_1.z.string(),
            fileUrl: zod_1.z.string(),
            fileSize: zod_1.z.number().optional(),
            mimeType: zod_1.z.string().optional(),
        }))
            .optional(),
    }),
});
exports.createWorkLogSchema = zod_1.z.object({
    body: zod_1.z.object({
        timeSpentMinutes: zod_1.z.number().min(1, 'Must log at least 1 minute'),
        description: zod_1.z.string().min(3, 'Work description is required'),
    }),
});
exports.ticketValidator = {
    createTicket: exports.createTicketSchema,
    updateTicket: zod_1.z.object({ body: exports.createTicketSchema.shape.body.partial() }),
    updateStatus: exports.updateTicketStatusSchema,
    assignTicket: exports.assignTicketSchema,
    createComment: exports.createCommentSchema,
    createWorkLog: exports.createWorkLogSchema,
};
