"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const AppError_1 = require("../utils/AppError");
const TicketAttachment_1 = require("../models/TicketAttachment");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
class UploadController {
    static async uploadFile(req, res, next) {
        try {
            if (!req.file) {
                throw new AppError_1.AppError('No file uploaded', 400);
            }
            const file = req.file;
            const fileUrl = `/api/uploads/${file.filename}`;
            // If attached to a ticket
            let attachmentRecord = null;
            if (req.body.ticketId) {
                attachmentRecord = await TicketAttachment_1.TicketAttachment.create({
                    ticket: req.body.ticketId,
                    fileName: file.filename,
                    originalName: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    storageUrl: fileUrl,
                    uploadedBy: req.user._id,
                });
            }
            res.status(201).json({
                success: true,
                data: {
                    fileName: file.filename,
                    originalName: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    url: fileUrl,
                    attachmentId: attachmentRecord?._id,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getFile(req, res, next) {
        try {
            const filename = path_1.default.basename(req.params.filename);
            const filePath = path_1.default.join(env_1.env.UPLOAD_DIR, filename);
            if (!fs_1.default.existsSync(filePath)) {
                throw new AppError_1.AppError('File not found', 404);
            }
            res.sendFile(filePath);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UploadController = UploadController;
