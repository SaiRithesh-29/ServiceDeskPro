"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const db_1 = require("../config/db");
const User_1 = require("../models/User");
const Ticket_1 = require("../models/Ticket");
const TicketComment_1 = require("../models/TicketComment");
const TicketWorkLog_1 = require("../models/TicketWorkLog");
const logger_1 = require("../utils/logger");

async function cleanProduction() {
    try {
        await (0, db_1.connectDB)();
        logger_1.logger.info('Connected to MongoDB. Starting production cleanup...');

        const demoEmails = [
            'admin@servicedesk.pro',
            'manager@servicedesk.pro',
            'tech1@servicedesk.pro',
            'tech2@servicedesk.pro',
            'tech3@servicedesk.pro',
            'assetmgr@servicedesk.pro',
            'employee1@servicedesk.pro',
            'employee2@servicedesk.pro'
        ];

        // 1. Delete tickets associated with demo users
        const demoUsers = await User_1.User.find({ email: { $in: demoEmails } });
        const demoUserIds = demoUsers.map(u => u._id);

        if (demoUserIds.length > 0) {
            const ticketRes = await Ticket_1.Ticket.deleteMany({
                $or: [
                    { requester: { $in: demoUserIds } },
                    { assignee: { $in: demoUserIds } }
                ]
            });
            logger_1.logger.info(`✓ Deleted ${ticketRes.deletedCount} demo tickets`);

            // Also clean up related comments and worklogs for those tickets/users
            await TicketComment_1.TicketComment.deleteMany({ author: { $in: demoUserIds } });
            await TicketWorkLog_1.TicketWorkLog.deleteMany({ user: { $in: demoUserIds } });
        }

        // 2. Delete demo users
        const userRes = await User_1.User.deleteMany({ email: { $in: demoEmails } });
        logger_1.logger.info(`✓ Deleted ${userRes.deletedCount} demo users`);

        logger_1.logger.info('Production cleanup completed successfully!');
        process.exit(0);
    } catch (error) {
        logger_1.logger.error('Error during cleanup:', error);
        process.exit(1);
    }
}

cleanProduction();
