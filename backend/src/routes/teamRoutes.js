"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teamController_1 = require("../controllers/teamController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// List teams
router.get('/', teamController_1.TeamController.getTeams);
// Create team (Admin, IT Manager)
router.post('/', (0, rbac_1.authorize)(['admin', 'it_manager']), teamController_1.TeamController.createTeam);
// Get team details
// Update team (Admin, IT Manager)
router.patch('/:id', (0, rbac_1.authorize)(['admin', 'it_manager']), teamController_1.TeamController.updateTeam);
// Delete team (Admin only)
exports.default = router;
