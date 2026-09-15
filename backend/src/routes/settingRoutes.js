"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingController_1 = require("../controllers/settingController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// 1. Business hours configuration
router.get('/business-hours', settingController_1.SettingController.getBusinessHours);
router.patch('/business-hours', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.updateBusinessHours);
// 2. Ticket categories
router.get('/categories', settingController_1.SettingController.getCategories);
router.post('/categories', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.createCategory);
router.patch('/categories/:id', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.updateCategory);
router.delete('/categories/:id', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.deleteCategory);
// 3. Priority levels
router.get('/priorities', settingController_1.SettingController.getPriorities);
// 4. Departments
router.get('/departments', settingController_1.SettingController.getDepartments);
router.post('/departments', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.createDepartment);
router.patch('/departments/:id', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.updateDepartment);
router.delete('/departments/:id', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.deleteDepartment);
// 5. General Settings
router.get('/', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.getSettings);
router.get('/:key', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.getSetting);
router.patch('/:key', (0, rbac_1.authorize)(['admin']), settingController_1.SettingController.updateSetting);
exports.default = router;
