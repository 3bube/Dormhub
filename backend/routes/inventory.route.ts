import express from 'express';
import { protect, staffOnly } from '../middleware/auth.middleware';
import {
  getStudentInventory,
  getAllInventory,
  getLowStockInventory,
  addInventoryItem,
  updateInventoryItem
} from '../controllers/inventory.controller';

const router = express.Router();

// @route   GET /api/students/:id/inventory
// @desc    Get student's room inventory
// @access  Private
router.get('/students/:id/inventory', protect, getStudentInventory);

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private (Staff only)
router.get('/', protect, staffOnly, getAllInventory);

// @route   GET /api/inventory/low-stock
// @desc    Get low stock inventory items
// @access  Private (Staff only)
router.get('/low-stock', protect, staffOnly, getLowStockInventory);

// @route   POST /api/inventory
// @desc    Add new inventory item
// @access  Private (Staff only)
router.post('/', protect, staffOnly, addInventoryItem);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Staff only)
router.put('/:id', protect, staffOnly, updateInventoryItem);

export default router;
