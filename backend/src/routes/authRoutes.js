"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const authValidator_1 = require("../validators/authValidator");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validate_1.validate)(authValidator_1.registerSchema), authController_1.AuthController.register);
router.get('/verify-email/:token', authController_1.AuthController.verifyEmail);
router.post('/login', (0, validate_1.validate)(authValidator_1.loginSchema), authController_1.AuthController.login);
// Protected routes
router.post('/refresh', authController_1.AuthController.refresh);
router.post('/logout', auth_1.authenticate, authController_1.AuthController.logout);
router.get('/me', auth_1.authenticate, authController_1.AuthController.getMe);
router.put('/profile', auth_1.authenticate, (0, validate_1.validate)(authValidator_1.updateProfileSchema), authController_1.AuthController.updateProfile);
router.put('/password', auth_1.authenticate, (0, validate_1.validate)(authValidator_1.changePasswordSchema), authController_1.AuthController.changePassword);
// Password reset flows
router.post('/forgot-password', authController_1.AuthController.forgotPassword);
router.post('/reset-password', authController_1.AuthController.resetPassword);
exports.default = router;
