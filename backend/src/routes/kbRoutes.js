"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kbController_1 = require("../controllers/kbController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const validate_1 = require("../middleware/validate");
const kbValidator_1 = require("../validators/kbValidator");
const router = (0, express_1.Router)();
// Public read endpoints (no auth required for published articles)
router.get('/', kbController_1.KBController.getArticles);
router.get('/article/:id', kbController_1.KBController.getArticle);
router.get('/categories', kbController_1.KBController.getCategories);
// All write operations require authentication
router.use(auth_1.authenticate);
// Create article (Technician, Admin)
router.post('/', (0, rbac_1.authorize)(['technician', 'it_manager', 'admin']), (0, validate_1.validate)(kbValidator_1.kbValidator.createArticle), kbController_1.KBController.createArticle);
// Update article (Tech, Manager, Admin)
router.patch('/:id', (0, rbac_1.authorize)(['technician', 'it_manager', 'admin']), (0, validate_1.validate)(kbValidator_1.kbValidator.updateArticle), kbController_1.KBController.updateArticle);
// Delete article (Admin only)
router.delete('/:id', (0, rbac_1.authorize)(['admin']), kbController_1.KBController.deleteArticle);
// Article status (publish/draft)
// Helpful/Unhelpful voting
router.post('/:id/vote', (0, validate_1.validate)(kbValidator_1.kbValidator.voteArticle), kbController_1.KBController.voteArticle);
exports.default = router;
