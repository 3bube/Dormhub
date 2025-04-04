"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const inventory_controller_1 = require("../controllers/inventory.controller");
const router = express_1.default.Router();
// @route   GET /api/students/:id/inventory
// @desc    Get student's room inventory
// @access  Private
router.get('/students/:id/inventory', auth_middleware_1.protect, inventory_controller_1.getStudentInventory);
// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private (Staff only)
router.get('/', auth_middleware_1.protect, auth_middleware_1.staffOnly, inventory_controller_1.getAllInventory);
// @route   GET /api/inventory/low-stock
// @desc    Get low stock inventory items
// @access  Private (Staff only)
router.get('/low-stock', auth_middleware_1.protect, auth_middleware_1.staffOnly, inventory_controller_1.getLowStockInventory);
// @route   POST /api/inventory
// @desc    Add new inventory item
// @access  Private (Staff only)
router.post('/', auth_middleware_1.protect, auth_middleware_1.staffOnly, inventory_controller_1.addInventoryItem);
// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Staff only)
router.put('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, inventory_controller_1.updateInventoryItem);
exports.default = router;
