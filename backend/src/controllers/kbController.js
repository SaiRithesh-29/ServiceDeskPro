"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KBController = void 0;
const kbService_js_1 = require("../services/kbService.js");
const KnowledgeArticle_js_1 = require("../models/KnowledgeArticle.js");
const AppError_js_1 = require("../utils/AppError.js");
const mongoose_1 = __importDefault(require("mongoose"));
class KBController {
    static async getArticles(req, res, next) {
        try {
            const { category, search, status = 'published', page = '1', limit = '12' } = req.query;
            const filter = {};
            if (status)
                filter.status = status;
            if (category)
                filter.category = category;
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                filter.$or = [
                    { title: searchRegex },
                    { problem: searchRegex },
                    { solution: searchRegex },
                    { tags: searchRegex },
                ];
            }
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 12;
            const skip = (pageNum - 1) * limitNum;
            const [articles, total] = await Promise.all([
                KnowledgeArticle_js_1.KnowledgeArticle.find(filter)
                    .populate('author', 'name email avatarUrl role')
                    .sort({ helpfulVotes: -1, views: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                KnowledgeArticle_js_1.KnowledgeArticle.countDocuments(filter),
            ]);
            res.status(200).json({
                success: true,
                data: articles,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getCategories(_req, res, next) {
        try {
            const categories = await KnowledgeArticle_js_1.KnowledgeArticle.aggregate([
                { $match: { status: 'published' } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]);
            res.status(200).json({
                success: true,
                data: categories.map((c) => ({ name: c._id, count: c.count })),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createArticle(req, res, next) {
        try {
            const article = await kbService_js_1.KBService.createArticle(req.body, req.user, { req });
            res.status(201).json({
                success: true,
                data: article,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getArticle(req, res, next) {
        try {
            const { id } = req.params;
            const article = await kbService_js_1.KBService.getArticleBySlugOrId(id);
            res.status(200).json({
                success: true,
                data: article,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateArticle(req, res, next) {
        try {
            const { id } = req.params;
            const isObjectId = mongoose_1.default.isValidObjectId(id);
            const article = await KnowledgeArticle_js_1.KnowledgeArticle.findOneAndUpdate({ $or: [{ _id: isObjectId ? id : null }, { articleId: id }, { slug: id }] }, req.body, { new: true, runValidators: true }).populate('author', 'name email avatarUrl');
            if (!article)
                throw new AppError_js_1.AppError('Article not found', 404);
            res.status(200).json({
                success: true,
                data: article,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async voteArticle(req, res, next) {
        try {
            const { id } = req.params;
            const { voteType } = req.body;
            const article = await kbService_js_1.KBService.voteArticle(id, voteType);
            res.status(200).json({
                success: true,
                data: article,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteArticle(_req, res, next) {
        try {
            const { id } = _req.params;
            const isObjectId = mongoose_1.default.isValidObjectId(id);
            const article = await KnowledgeArticle_js_1.KnowledgeArticle.findOneAndDelete({
                $or: [{ _id: isObjectId ? id : null }, { articleId: id }, { slug: id }],
            });
            if (!article)
                throw new AppError_js_1.AppError('Article not found', 404);
            res.status(200).json({
                success: true,
                message: 'Article deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.KBController = KBController;
