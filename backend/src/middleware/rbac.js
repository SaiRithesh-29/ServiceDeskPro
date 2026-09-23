"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authorizeRoles = void 0;
const AppError_js_1 = require("../utils/AppError.js");
/**
 * Restricts access to specified roles.
 */
const authorizeRoles = (...roles) => {
    const rawRoles = roles.flat();
    const normalizedRoles = [...rawRoles];
    if (normalizedRoles.includes('system_admin') && !normalizedRoles.includes('admin')) {
        normalizedRoles.push('admin');
    }
    if (normalizedRoles.includes('admin') && !normalizedRoles.includes('system_admin')) {
        normalizedRoles.push('system_admin');
    }
    return (req, _res, next) => {
        if (!req.user) {
            return next(new AppError_js_1.AppError('You are not authenticated', 401));
        }
        if (!normalizedRoles.includes(req.user.role)) {
            return next(new AppError_js_1.AppError(`Permission denied: Role '${req.user.role}' is not authorized to perform this action`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Backwards-compatible route helper. New routes may use either calling style.
const authorize = (roles) => (0, exports.authorizeRoles)(Array.isArray(roles) ? roles : [roles]);
exports.authorize = authorize;
