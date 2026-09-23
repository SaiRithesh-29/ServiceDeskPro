"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const validate_1 = require("../middleware/validate");
const ticketValidator_1 = require("../validators/ticketValidator");
const router = (0, express_1.Router)();
// All ticket routes require authentication
router.use(auth_1.authenticate);
// List tickets with advanced filtering
router.get('/', ticketController_1.TicketController.getTickets);
// Create a new ticket
router.post('/', (0, validate_1.validate)(ticketValidator_1.ticketValidator.createTicket), ticketController_1.TicketController.createTicket);
// Get ticket details
router.get('/:id', ticketController_1.TicketController.getTicketById);
// Update ticket (tech/manager/admin)
router.patch('/:id', (0, rbac_1.authorize)(['technician', 'it_manager', 'system_admin', 'admin']), (0, validate_1.validate)(ticketValidator_1.ticketValidator.updateTicket), ticketController_1.TicketController.updateTicket);
// Delete ticket (admin only)
router.delete('/:id', (0, rbac_1.authorize)(['system_admin', 'admin']), ticketController_1.TicketController.deleteTicket);
// Ticket status transitions
router.post('/:id/status', (0, rbac_1.authorize)(['technician', 'it_manager', 'system_admin', 'admin']), (0, validate_1.validate)(ticketValidator_1.ticketValidator.updateStatus), ticketController_1.TicketController.updateStatus);
router.post('/:id/assign', (0, rbac_1.authorize)(['it_manager', 'system_admin', 'admin']), (0, validate_1.validate)(ticketValidator_1.ticketValidator.assignTicket), ticketController_1.TicketController.assignTicket);
router.post('/:id/escalate', (0, rbac_1.authorize)(['technician', 'it_manager', 'admin']), ticketController_1.TicketController.escalateTicket);
router.post('/:id/resolve', (0, rbac_1.authorize)(['technician', 'it_manager', 'admin']), ticketController_1.TicketController.resolveTicket);
router.post('/:id/reopen', ticketController_1.TicketController.reopenTicket);
// Comments
router.post('/:id/comments', (0, validate_1.validate)(ticketValidator_1.ticketValidator.createComment), ticketController_1.TicketController.addComment);
// Work logs (time tracking)
router.post('/:id/work-logs', (0, rbac_1.authorize)(['technician', 'it_manager', 'admin']), (0, validate_1.validate)(ticketValidator_1.ticketValidator.createWorkLog), ticketController_1.TicketController.addWorkLog);
// Attachments
exports.default = router;
