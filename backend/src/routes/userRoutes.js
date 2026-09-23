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
// List users (System Admin, IT Manager)
router.get('/', (0, rbac_1.authorize)(['system_admin', 'admin', 'it_manager']), userController_1.UserController.getUsers);
// Create user (System Admin only)
router.post('/', (0, rbac_1.authorize)(['system_admin', 'admin']), (0, validate_1.validate)(userValidator_1.userValidator.createUser), userController_1.UserController.createUser);
// Get user details
router.get('/:id', userController_1.UserController.getUserById);
// Update user fields
router.patch('/:id', (0, validate_1.validate)(userValidator_1.userValidator.updateUser), userController_1.UserController.updateUser);
// Assign user role (System Admin only)
router.patch('/:id/role', (0, rbac_1.authorize)(['system_admin', 'admin']), (0, validate_1.validate)(userValidator_1.userValidator.updateRole), userController_1.UserController.updateRole);
// Activate/Deactivate user (System Admin only)
router.patch('/:id/status', (0, rbac_1.authorize)(['system_admin', 'admin']), (0, validate_1.validate)(userValidator_1.userValidator.updateStatus), userController_1.UserController.toggleStatus);
// Delete user (System Admin only)
router.delete('/:id', (0, rbac_1.authorize)(['system_admin', 'admin']), userController_1.UserController.deleteUser);
exports.default = router;
