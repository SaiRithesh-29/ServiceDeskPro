"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const validate_1 = require("../middleware/validate");
const userValidator_1 = require("../validators/userValidator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// List users (Admin, Manager, IT Manager)
router.get('/', (0, rbac_1.authorize)(['admin', 'it_manager']), userController_1.UserController.getUsers);
// Create user (Admin, IT Manager)
router.post('/', (0, rbac_1.authorize)(['admin', 'it_manager']), (0, validate_1.validate)(userValidator_1.userValidator.createUser), userController_1.UserController.createUser);
// Get user details
router.get('/:id', userController_1.UserController.getUserById);
// Update user (Admin, IT Manager, or self for limited fields)
router.patch('/:id', (0, validate_1.validate)(userValidator_1.userValidator.updateUser), userController_1.UserController.updateUser);
// Activate/Deactivate user (Admin only)
router.patch('/:id/status', (0, rbac_1.authorize)(['admin']), (0, validate_1.validate)(userValidator_1.userValidator.updateStatus), userController_1.UserController.toggleStatus);
exports.default = router;
