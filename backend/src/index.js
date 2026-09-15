"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const logger_1 = require("./utils/logger");
// Start the server
(0, server_1.startServer)().catch((error) => {
    logger_1.logger.error('Fatal error starting server:', error);
    process.exit(1);
});
