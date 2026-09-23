"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapAdmin = bootstrapAdmin;

const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");

async function bootstrapAdmin() {
    try {
        await (0, db_1.connectDB)();
        
        const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@servicedesk.pro').toLowerCase().trim();
        const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123456';
        const adminName = process.env.INITIAL_ADMIN_NAME || 'System Administrator';

        let admin = await User_1.User.findOne({ email: adminEmail }).select('+passwordHash');

        if (admin) {
            let updated = false;
            if (admin.role !== 'system_admin') {
                admin.role = 'system_admin';
                updated = true;
            }
            if (!admin.isActive) {
                admin.isActive = true;
                updated = true;
            }
            if (!admin.isEmailVerified) {
                admin.isEmailVerified = true;
                updated = true;
            }
            if (updated) {
                await admin.save({ validateBeforeSave: false });
                logger_1.logger.info(`✓ Existing administrator updated to canonical role 'system_admin': ${admin.email}`);
            } else {
                logger_1.logger.info(`✓ System administrator already exists and is configured: ${admin.email}`);
            }
            return admin;
        }

        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(adminPassword, salt);

        admin = await User_1.User.create({
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: 'system_admin',
            isActive: true,
            isEmailVerified: true,
            lastLoginAt: new Date(),
        });

        logger_1.logger.info(`✓ Initial System Administrator created successfully: ${admin.email}`);
        return admin;
    } catch (error) {
        logger_1.logger.error('Error during admin bootstrap:', error);
        throw error;
    }
}

if (require.main === module) {
    bootstrapAdmin()
        .then(() => {
            logger_1.logger.info('Admin bootstrap process completed.');
            process.exit(0);
        })
        .catch((err) => {
            logger_1.logger.error('Fatal error during admin bootstrap:', err);
            process.exit(1);
        });
}
