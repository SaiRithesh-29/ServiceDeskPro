"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assetController_1 = require("../controllers/assetController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const validate_1 = require("../middleware/validate");
const assetValidator_1 = require("../validators/assetValidator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// List and search assets
router.get('/', assetController_1.AssetController.getAssets);
// Create new asset (Asset Manager, Admin)
router.post('/', (0, rbac_1.authorize)(['asset_manager', 'admin']), (0, validate_1.validate)(assetValidator_1.assetValidator.createAsset), assetController_1.AssetController.createAsset);
// Get asset details
router.get('/:id', assetController_1.AssetController.getAssetById);
// Update asset
router.patch('/:id', (0, rbac_1.authorize)(['asset_manager', 'admin']), (0, validate_1.validate)(assetValidator_1.assetValidator.updateAsset), assetController_1.AssetController.updateAsset);
// Delete asset (Admin only)
router.delete('/:id', (0, rbac_1.authorize)(['admin']), assetController_1.AssetController.deleteAsset);
// Asset assignment and lifecycle
router.post('/:id/assign', (0, rbac_1.authorize)(['asset_manager', 'admin']), (0, validate_1.validate)(assetValidator_1.assetValidator.assignAsset), assetController_1.AssetController.assignAsset);
router.post('/:id/unassign', (0, rbac_1.authorize)(['asset_manager', 'admin']), assetController_1.AssetController.unassignAsset);
router.post('/:id/status', (0, rbac_1.authorize)(['asset_manager', 'admin']), (0, validate_1.validate)(assetValidator_1.assetValidator.updateStatus), assetController_1.AssetController.updateStatus);
exports.default = router;
