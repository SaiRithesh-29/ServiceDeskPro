"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBackupJob = void 0;
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_1 = require("fs");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");

const runBackupJob = () => {
    logger_1.logger.info('Starting scheduled MongoDB backup...');
    
    // Only run if mongodump is available locally. For Atlas, this might just be a stub if relied on Atlas backups.
    const backupDir = path_1.join(process.cwd(), 'backups');
    if (!fs_1.existsSync(backupDir)) {
        fs_1.mkdirSync(backupDir, { recursive: true });
    }
    
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = path_1.join(backupDir, `backup-${date}.gzip`);
    
    // Check if the URI is for a local DB or Atlas. We can just execute mongodump if installed.
    // If mongodump is not installed, this will log an error, which is expected on systems without it.
    const command = `mongodump --uri="${env_1.env.MONGODB_URI}" --archive="${archivePath}" --gzip`;
    
    child_process_1.exec(command, (error, stdout, stderr) => {
        if (error) {
            logger_1.logger.warn(`Database backup failed (mongodump might not be installed): ${error.message}`);
            return;
        }
        logger_1.logger.info(`Database backup completed successfully: ${archivePath}`);
    });
};
exports.runBackupJob = runBackupJob;
