"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopBackgroundJobs = exports.startBackgroundJobs = void 0;
const slaJob_js_1 = require("./slaJob.js");
const warrantyJob_js_1 = require("./warrantyJob.js");
const backupJob_js_1 = require("./backupJob.js");
const logger_js_1 = require("../utils/logger.js");
let slaIntervalId = null;
let warrantyIntervalId = null;
let backupIntervalId = null;
const startBackgroundJobs = () => {
    logger_js_1.logger.info('Initializing ServiceDesk Pro background jobs...');
    // Run immediately on boot
    (0, slaJob_js_1.runSLAJob)();
    (0, warrantyJob_js_1.runWarrantyJob)();
    // Run SLA check every 60 seconds
    slaIntervalId = setInterval(slaJob_js_1.runSLAJob, 60 * 1000);
    // Run Warranty check once every 6 hours
    warrantyIntervalId = setInterval(warrantyJob_js_1.runWarrantyJob, 6 * 60 * 60 * 1000);
    // Run DB Backup once a day
    backupIntervalId = setInterval(backupJob_js_1.runBackupJob, 24 * 60 * 60 * 1000);
    logger_js_1.logger.info('Background SLA, Warranty, and Backup monitoring jobs started successfully.');
};
exports.startBackgroundJobs = startBackgroundJobs;
const stopBackgroundJobs = () => {
    if (slaIntervalId)
        clearInterval(slaIntervalId);
    if (warrantyIntervalId)
        clearInterval(warrantyIntervalId);
    if (backupIntervalId)
        clearInterval(backupIntervalId);
    logger_js_1.logger.info('Background jobs stopped.');
};
exports.stopBackgroundJobs = stopBackgroundJobs;
