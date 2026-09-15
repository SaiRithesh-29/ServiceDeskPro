"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slaController_1 = require("../controllers/slaController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const validate_1 = require("../middleware/validate");
const userValidator_1 = require("../validators/userValidator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// List SLA policies
router.get('/', slaController_1.SLAController.getSLAPolicies);
// Create SLA (Admin, IT Manager)
router.post('/', (0, rbac_1.authorize)(['admin', 'it_manager']), (0, validate_1.validate)(userValidator_1.userValidator.createSLA), slaController_1.SLAController.createSLA);
// Get SLA details
router.get('/:id', slaController_1.SLAController.getSLAById);
// Update SLA (Admin, IT Manager)
router.patch('/:id', (0, rbac_1.authorize)(['admin', 'it_manager']), (0, validate_1.validate)(userValidator_1.userValidator.updateSLA), slaController_1.SLAController.updateSLA);
// Delete SLA (Admin only)
router.delete('/:id', (0, rbac_1.authorize)(['admin']), slaController_1.SLAController.deleteSLA);
// Set default SLA
router.patch('/:id/default', (0, rbac_1.authorize)(['admin', 'it_manager']), slaController_1.SLAController.setDefault);
exports.default = router;
