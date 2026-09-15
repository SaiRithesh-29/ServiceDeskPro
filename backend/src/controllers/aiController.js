"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const aiService_1 = require("../services/aiService");
const AppError_1 = require("../utils/AppError");
class AIController {
    static async classifyTicket(req, res, next) {
        try {
            const { title, description } = req.body;
            if (!title || !description) {
                throw new AppError_1.AppError('Title and description are required for classification', 400);
            }
            const classification = await aiService_1.AIService.classifyTicket(title, description);
            const suggestions = await aiService_1.AIService.suggestKBArticles(title, description, classification.category);
            res.status(200).json({
                success: true,
                data: {
                    classification,
                    suggestedArticles: suggestions,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async suggestKB(req, res, next) {
        try {
            const { title, description, category } = req.body;
            if (!title && !description) {
                throw new AppError_1.AppError('Title or description is required for KB suggestions', 400);
            }
            const suggestions = await aiService_1.AIService.suggestKBArticles(title || '', description || '', category);
            res.status(200).json({
                success: true,
                data: suggestions,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AIController = AIController;
