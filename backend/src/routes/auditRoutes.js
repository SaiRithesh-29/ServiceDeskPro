"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditController_1 = require("../controllers/auditController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// List audit logs (Admin only)
router.get('/', (0, rbac_1.authorize)(['admin']), auditController_1.AuditController.getAuditLogs);
// Get audit log details
router.get('/:id', (0, rbac_1.authorize)(['admin']), auditController_1.AuditController.getAuditLogById);
// Export audit logs (Admin)
router.post('/export', (0, rbac_1.authorize)(['admin']), auditController_1.AuditController.exportAuditLogs);
exports.default = router;
