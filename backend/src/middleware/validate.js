"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateRequest = void 0;
const zod_1 = require("zod");
const AppError_js_1 = require("../utils/AppError.js");
const validateRequest = (schema) => {
    return async (req, _res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                return next(new AppError_js_1.AppError('Validation failed', 400, formattedErrors));
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
// Alias for convenience
exports.validate = exports.validateRequest;
