"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const env_js_1 = require("../config/env.js");
class StorageService {
    static formatFile(file) {
        let storageUrl = `/uploads/${file.filename}`;
        // If Cloudinary or S3 provider is configured, the adapter would generate remote URL
        if (env_js_1.env.FILE_STORAGE_PROVIDER === 'cloudinary') {
            // Cloudinary URL structure
            storageUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${file.filename}`;
        }
        return {
            fileName: file.filename,
            originalName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            storageUrl,
        };
    }
}
exports.StorageService = StorageService;
