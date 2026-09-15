"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const Ticket_1 = require("../models/Ticket");
const Asset_1 = require("../models/Asset");
const KnowledgeArticle_1 = require("../models/KnowledgeArticle");
const User_1 = require("../models/User");
class SearchController {
    static async globalSearch(req, res, next) {
        try {
            const q = (req.query.q || '').trim();
            if (!q || q.length < 2) {
                res.status(200).json({
                    success: true,
                    data: {
                        tickets: [],
                        assets: [],
                        articles: [],
                        users: [],
                    },
                });
                return;
            }
            const user = req.user;
            const regex = new RegExp(q, 'i');
            // 1. Search Tickets
            const ticketQuery = {
                $or: [
                    { ticketId: { $regex: regex } },
                    { title: { $regex: regex } },
                    { description: { $regex: regex } },
                    { category: { $regex: regex } },
                ],
            };
            if (user.role === 'employee') {
                ticketQuery.requester = user._id;
            }
            const ticketsPromise = Ticket_1.Ticket.find(ticketQuery)
                .select('ticketId title category priority status createdAt')
                .limit(6);
            // 2. Search Articles (published for employees, all for admins/techs)
            const articleQuery = {
                $or: [
                    { title: { $regex: regex } },
                    { problem: { $regex: regex } },
                    { tags: { $regex: regex } },
                    { category: { $regex: regex } },
                ],
            };
            if (user.role === 'employee') {
                articleQuery.status = 'published';
            }
            const articlesPromise = KnowledgeArticle_1.KnowledgeArticle.find(articleQuery)
                .select('articleId title category status views helpfulVotes')
                .limit(6);
            // 3. Search Assets (employees only see assigned assets, technicians/managers/admins see all)
            let assetQuery = {
                $or: [
                    { assetId: { $regex: regex } },
                    { name: { $regex: regex } },
                    { serialNumber: { $regex: regex } },
                    { model: { $regex: regex } },
                    { type: { $regex: regex } },
                ],
            };
            if (user.role === 'employee') {
                assetQuery.assignedUser = user._id;
            }
            const assetsPromise = Asset_1.Asset.find(assetQuery)
                .select('assetId name type status serialNumber model')
                .limit(6);
            // 4. Search Users (only for admin, manager, technician, asset_manager)
            let usersPromise = Promise.resolve([]);
            if (user.role !== 'employee') {
                usersPromise = User_1.User.find({
                    $or: [
                        { name: { $regex: regex } },
                        { email: { $regex: regex } },
                        { role: { $regex: regex } },
                    ],
                })
                    .select('name email role isActive avatarUrl')
                    .limit(6);
            }
            const [tickets, articles, assets, users] = await Promise.all([
                ticketsPromise,
                articlesPromise,
                assetsPromise,
                usersPromise,
            ]);
            res.status(200).json({
                success: true,
                data: {
                    tickets,
                    articles,
                    assets,
                    users,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SearchController = SearchController;
