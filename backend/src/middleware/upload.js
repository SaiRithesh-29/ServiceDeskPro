"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_js_1 = require("../config/env.js");
const AppError_js_1 = require("../utils/AppError.js");
// Ensure upload directory exists
if (!fs_1.default.existsSync(env_js_1.env.UPLOAD_DIR)) {
    fs_1.default.mkdirSync(env_js_1.env.UPLOAD_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, env_js_1.env.UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|log|csv|zip/;
    const ext = path_1.default.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowedExtensions.test(ext)) {
        cb(null, true);
    }
    else {
        cb(new AppError_js_1.AppError('Invalid file type. Only JPG, PNG, GIF, WEBP, PDF, DOC, DOCX, TXT, LOG, CSV, ZIP allowed.', 400));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: env_js_1.env.MAX_FILE_SIZE_MB * 1024 * 1024,
    },
    fileFilter,
});
