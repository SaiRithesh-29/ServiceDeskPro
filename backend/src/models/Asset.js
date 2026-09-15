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
exports.Asset = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AssetSchema = new mongoose_1.Schema({
    assetId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Asset name is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: [
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
        ],
        required: true,
        index: true,
    },
    serialNumber: {
        type: String,
        required: [true, 'Serial number is required'],
        unique: true,
        trim: true,
        index: true,
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true,
    },
    model: {
        type: String,
        required: true,
        trim: true,
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
    purchaseCost: {
        type: Number,
        default: 0,
    },
    warrantyExpiration: {
        type: Date,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['available', 'assigned', 'under_repair', 'lost', 'retired'],
        default: 'available',
        index: true,
    },
    assignedUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    department: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department',
        index: true,
    },
    location: {
        type: String,
        default: 'Main Office',
    },
    vendor: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    specifications: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});
exports.Asset = mongoose_1.default.model('Asset', AssetSchema);
