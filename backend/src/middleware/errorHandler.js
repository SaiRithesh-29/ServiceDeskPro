"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_js_1 = require("../utils/AppError.js");
const logger_js_1 = require("../utils/logger.js");
const env_js_1 = require("../config/env.js");
const errorHandler = (err, _req, res, _next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error';
    // Handle Mongoose Bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with invalid id of ${err.value}`;
        error = new AppError_js_1.AppError(message, 404);
    }
    // Handle Mongoose Duplicate Key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        const value = err.keyValue ? err.keyValue[field] : 'value';
        const message = `Duplicate value '${value}' entered for field '${field}'. Please use another value.`;
        error = new AppError_js_1.AppError(message, 400);
    }
    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
        error = new AppError_js_1.AppError(message, 400);
    }
    // Log error
    if (error.statusCode >= 500) {
        logger_js_1.logger.error(`[Server Error] ${err.message}`, { stack: err.stack });
    }
    else {
        logger_js_1.logger.warn(`[Client Error] ${error.statusCode} - ${err.message}`);
    }
    res.status(error.statusCode).json({
        success: false,
        status: error.status,
        message: error.message || 'Internal Server Error',
        errors: err.errors || undefined,
        ...(env_js_1.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
