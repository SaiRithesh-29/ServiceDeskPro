"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TicketSchema = new mongoose_1.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Ticket title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Ticket description is required'],
    },
    category: {
        type: String,
        enum: [
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
        default: 'Other',
        index: true,
    },
    subcategory: {
        type: String,
        default: '',
    },
    priority: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        default: 'medium',
        index: true,
    },
    status: {
        type: String,
        enum: [
            'open',
            'assigned',
            'in_progress',
            'pending',
            'resolved',
            'closed',
            'reopened',
            'escalated',
        ],
        default: 'open',
        index: true,
    },
    requester: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    department: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department',
        index: true,
    },
    assignedTechnician: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    assignedTeam: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        index: true,
    },
    asset: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Asset',
    },
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    dueDate: Date,
    slaPolicy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SLAPolicy',
    },
    slaDeadline: {
        type: Date,
        required: true,
        index: true,
    },
    slaResponseDeadline: Date,
    slaStatus: {
        type: String,
        enum: ['on_track', 'at_risk', 'breached'],
        default: 'on_track',
        index: true,
    },
    firstResponseAt: Date,
    resolvedAt: Date,
    closedAt: Date,
    resolutionNotes: {
        type: String,
        default: '',
    },
    reopenCount: {
        type: Number,
        default: 0,
    },
    escalationReason: {
        type: String,
        default: '',
    },
    aiSuggestions: {
        category: String,
        priority: String,
        confidence: Number,
        suggestedSteps: [String],
        classifiedAt: Date,
    },
}, {
    timestamps: true,
});
TicketSchema.index({ title: 'text', description: 'text', ticketId: 'text' });
exports.Ticket = mongoose_1.default.model('Ticket', TicketSchema);
