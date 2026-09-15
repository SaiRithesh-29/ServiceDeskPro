"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_js_1 = require("../utils/jwt.js");
const User_js_1 = require("../models/User.js");
const AppError_js_1 = require("../utils/AppError.js");
const authenticate = async (req, _res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            return next(new AppError_js_1.AppError('You are not logged in. Please log in to gain access.', 401));
        }
        const payload = (0, jwt_js_1.verifyAccessToken)(token);
        const currentUser = await User_js_1.User.findById(payload.id).populate('department team');
        if (!currentUser) {
            return next(new AppError_js_1.AppError('The user belonging to this token no longer exists.', 401));
        }
        if (!currentUser.isActive) {
            return next(new AppError_js_1.AppError('Your account has been deactivated. Please contact an administrator.', 403));
        }
        req.user = currentUser;
        req.tokenPayload = payload;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(new AppError_js_1.AppError('Invalid or expired authentication token. Please log in again.', 401));
        }
        next(error);
    }
};
exports.authenticate = authenticate;
