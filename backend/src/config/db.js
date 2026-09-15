"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
const logger_js_1 = require("../utils/logger.js");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_js_1.env.MONGODB_URI);
        logger_js_1.logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    }
    catch (error) {
        logger_js_1.logger.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
