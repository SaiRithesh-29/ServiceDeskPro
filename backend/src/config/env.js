"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servicedesk_pro',
    JWT_SECRET: process.env.JWT_SECRET || 'servicedesk_pro_super_secret_jwt_access_key_2026_x89q',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'servicedesk_pro_super_secret_jwt_refresh_key_2026_m21k',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
    AI_API_KEY: process.env.AI_API_KEY || '',
    AI_MODEL: process.env.AI_MODEL || 'gemini-1.5-flash',
    FILE_STORAGE_PROVIDER: process.env.FILE_STORAGE_PROVIDER || 'local',
    MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    UPLOAD_DIR: path_1.default.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
    DEFAULT_BUSINESS_START_HOUR: parseInt(process.env.DEFAULT_BUSINESS_START_HOUR || '9', 10),
    DEFAULT_BUSINESS_END_HOUR: parseInt(process.env.DEFAULT_BUSINESS_END_HOUR || '18', 10),
    DEFAULT_BUSINESS_TIMEZONE: process.env.DEFAULT_BUSINESS_TIMEZONE || 'Asia/Kolkata',
};
