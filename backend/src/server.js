"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = require("./utils/logger");
// Import route handlers
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const assetRoutes_1 = __importDefault(require("./routes/assetRoutes"));
const kbRoutes_1 = __importDefault(require("./routes/kbRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const slaRoutes_1 = __importDefault(require("./routes/slaRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
// Import background jobs
const scheduler_1 = require("./jobs/scheduler");
const app = (0, express_1.default)();
// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use((0, cookie_parser_1.default)());
// Logging middleware
app.use((0, morgan_1.default)('dev'));
// Static uploads serving
app.use('/uploads', express_1.default.static(env_1.env.UPLOAD_DIR));
// Rate limiting on API
app.use('/api', rateLimiter_1.apiLimiter);
// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
// ============================================
// API ROUTES
// ============================================
const apiBase = '/api';
app.use(`${apiBase}/auth`, rateLimiter_1.authLimiter, authRoutes_1.default);
app.use(`${apiBase}/tickets`, ticketRoutes_1.default);
app.use(`${apiBase}/assets`, assetRoutes_1.default);
app.use(`${apiBase}/knowledge-base`, kbRoutes_1.default);
app.use(`${apiBase}/users`, userRoutes_1.default);
app.use(`${apiBase}/teams`, teamRoutes_1.default);
app.use(`${apiBase}/sla`, slaRoutes_1.default);
app.use(`${apiBase}/notifications`, notificationRoutes_1.default);
app.use(`${apiBase}/audit-logs`, auditRoutes_1.default);
app.use(`${apiBase}/reports`, reportRoutes_1.default);
app.use(`${apiBase}/settings`, settingRoutes_1.default);
app.use(`${apiBase}/ai`, aiRoutes_1.default);
app.use(`${apiBase}/search`, searchRoutes_1.default);
app.use(`${apiBase}/uploads`, uploadRoutes_1.default);
// ============================================
// SERVE FRONTEND (PRODUCTION)
// ============================================
const path = require('path');
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express_1.default.static(frontendDist));

// ============================================
// 404 HANDLER (API) & SPA FALLBACK
// ============================================
app.use((_req, res, next) => {
    if (_req.path.startsWith('/api')) {
        res.status(404).json({
            status: 'error',
            message: 'Route not found',
            path: _req.path,
        });
    } else {
        // Fallback to React index.html for non-API routes (SPA routing)
        res.sendFile(path.join(frontendDist, 'index.html'));
    }
});
// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use(errorHandler_1.errorHandler);
// ============================================
// SERVER INITIALIZATION
// ============================================
async function startServer() {
    try {
        // Connect to MongoDB
        logger_1.logger.info('Connecting to MongoDB...');
        await (0, db_1.connectDB)();
        logger_1.logger.info('✓ MongoDB connected');
        // Start background jobs
        logger_1.logger.info('Initializing background jobs...');
        (0, scheduler_1.startBackgroundJobs)();
        logger_1.logger.info('✓ Background jobs initialized');
        // Start HTTP server
        const PORT = env_1.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            logger_1.logger.info(`✓ Server running on http://localhost:${PORT}`);
            logger_1.logger.info(`✓ Environment: ${env_1.env.NODE_ENV}`);
            logger_1.logger.info(`✓ Client URL: ${env_1.env.CLIENT_URL}`);
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger_1.logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger_1.logger.info('Server closed');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            logger_1.logger.info('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                logger_1.logger.info('Server closed');
                process.exit(0);
            });
        });
        return server;
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
exports.default = app;
