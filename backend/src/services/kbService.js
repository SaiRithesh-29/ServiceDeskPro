"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KBService = void 0;
const KnowledgeArticle_js_1 = require("../models/KnowledgeArticle.js");
const auditService_js_1 = require("./auditService.js");
const AppError_js_1 = require("../utils/AppError.js");
const mongoose_1 = __importDefault(require("mongoose"));
class KBService {
    /**
     * Generates next Article ID (e.g. KB-101).
     */
    static async getNextArticleId() {
        const latest = await KnowledgeArticle_js_1.KnowledgeArticle.findOne({}, { articleId: 1 }).sort({ createdAt: -1 });
        if (!latest || !latest.articleId)
            return 'KB-101';
        const match = latest.articleId.match(/KB-(\d+)/);
        if (!match)
            return 'KB-101';
        const nextNum = parseInt(match[1], 10) + 1;
        return `KB-${nextNum}`;
    }
    static createSlug(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    static async createArticle(data, user, reqMeta) {
        const articleId = await this.getNextArticleId();
        let slug = this.createSlug(data.title);
        // Check slug uniqueness
        const existing = await KnowledgeArticle_js_1.KnowledgeArticle.findOne({ slug });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        const article = await KnowledgeArticle_js_1.KnowledgeArticle.create({
            ...data,
            articleId,
            slug,
            author: user._id,
        });
        await auditService_js_1.AuditService.log({
            req: reqMeta?.req,
            user,
            action: 'CREATE_KB_ARTICLE',
            entityType: 'kb',
            entityId: article.articleId,
            entityDisplay: article.title,
        });
        return article;
    }
    static async getArticleBySlugOrId(idOrSlug, incrementView = true) {
        const query = mongoose_1.default.isValidObjectId(idOrSlug)
            ? { $or: [{ _id: idOrSlug }, { articleId: idOrSlug }, { slug: idOrSlug }] }
            : { $or: [{ articleId: idOrSlug }, { slug: idOrSlug }] };
        const article = await KnowledgeArticle_js_1.KnowledgeArticle.findOne(query).populate('author', 'name email avatarUrl');
        if (!article)
            throw new AppError_js_1.AppError('Knowledge article not found', 404);
        if (incrementView) {
            article.views = (article.views || 0) + 1;
            await article.save();
        }
        return article;
    }
    static async voteArticle(idOrSlug, voteType) {
        const article = await this.getArticleBySlugOrId(idOrSlug, false);
        if (voteType === 'helpful') {
            article.helpfulVotes = (article.helpfulVotes || 0) + 1;
        }
        else {
            article.unhelpfulVotes = (article.unhelpfulVotes || 0) + 1;
        }
        await article.save();
        return article;
    }
}
exports.KBService = KBService;
