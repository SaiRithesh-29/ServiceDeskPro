"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSLAJob = void 0;
const slaEngine_js_1 = require("../services/slaEngine.js");
const logger_js_1 = require("../utils/logger.js");
const runSLAJob = async () => {
    try {
        await slaEngine_js_1.SLAEngine.checkAllActiveTickets();
    }
    catch (error) {
        logger_js_1.logger.error('Error running SLA background job:', error.message);
    }
};
exports.runSLAJob = runSLAJob;
