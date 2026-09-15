"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Dashboard metrics (role-specific)
router.get('/dashboard', reportController_1.ReportController.getDashboardMetrics);
// Ticket reports
router.get('/tickets/by-status', reportController_1.ReportController.getTicketsByStatus);
router.get('/tickets/by-priority', reportController_1.ReportController.getTicketsByPriority);
router.get('/tickets/by-category', reportController_1.ReportController.getTicketsByCategory);
router.get('/tickets/by-department', reportController_1.ReportController.getTicketsByDepartment);
router.get('/tickets/by-technician', reportController_1.ReportController.getTicketsByTechnician);
router.get('/tickets/resolution-time', reportController_1.ReportController.getResolutionTime);
router.get('/tickets/volume-trend', reportController_1.ReportController.getTicketVolumeTrend);
// SLA reports
router.get('/sla/compliance', reportController_1.ReportController.getSLACompliance);
router.get('/sla/breaches', reportController_1.ReportController.getSLABreaches);
// Asset reports
router.get('/assets/distribution', reportController_1.ReportController.getAssetDistribution);
router.get('/assets/status', reportController_1.ReportController.getAssetStatus);
router.get('/assets/warranty', reportController_1.ReportController.getWarrantyStatus);
// Technician workload
router.get('/technician-workload', reportController_1.ReportController.getTechnicianWorkload);
// Custom report builder
router.post('/custom', (0, rbac_1.authorize)(['admin', 'it_manager']), reportController_1.ReportController.generateCustomReport);
// Export reports
router.get('/export', reportController_1.ReportController.exportReport);
router.post('/export', reportController_1.ReportController.exportReport);
exports.default = router;
