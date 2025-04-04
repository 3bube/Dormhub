import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Inventory from '../models/inventory.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get student's room inventory
// @route   GET /api/students/:id/inventory
// @access  Private
export const getStudentInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.id;
    
    // Check if user is authorized to view this inventory
    if (req.user?.role !== 'staff' && studentId !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this inventory' });
      return;
    }
    
    const inventory = await Inventory.find({ 'studentId.id': studentId })
      .populate('roomId.id', 'roomNumber building floor')
      .sort({ dateProvided: -1 });
    
    res.json(inventory);
  } catch (error: any) {
    console.error('Get student inventory error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Staff only)
export const getAllInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, status, condition } = req.query;
    let query: any = {};
    
    if (roomId) query['roomId.id'] = roomId;
    if (status) query.status = status;
    if (condition) query.condition = condition;
    
    const inventory = await Inventory.find(query)
      .populate('roomId.id', 'roomNumber building floor')
      .populate('studentId.id', 'name email studentId')
      .sort({ updatedAt: -1 });
    
    res.json(inventory);
  } catch (error: any) {
    console.error('Get all inventory error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get low stock inventory items
// @route   GET /api/inventory/low-stock
// @access  Private (Staff only)
export const getLowStockInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Group inventory items by item name and count them
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: '$item',
          totalCount: { $sum: 1 },
          availableCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
            }
          },
          maintenanceCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          item: '$_id',
          totalCount: 1,
          availableCount: 1,
          maintenanceCount: 1,
          occupiedCount: {
            $subtract: ['$totalCount', { $add: ['$availableCount', '$maintenanceCount'] }]
          },
          availabilityPercentage: {
            $multiply: [
              { $divide: ['$availableCount', '$totalCount'] },
              100
            ]
          }
        }
      },
      {
        $match: {
          availabilityPercentage: { $lt: 20 } // Items with less than 20% availability
        }
      },
      {
        $sort: { availabilityPercentage: 1 }
      }
    ]);
    
    res.json(inventoryStats);
  } catch (error: any) {
    console.error('Get low stock inventory error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (Staff only)
export const addInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId, studentId, item, condition, notes } = req.body;
    
    // Validate required fields
    if (!roomId || !studentId || !item || !condition) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }
    
    const newInventoryItem = new Inventory({
      roomId: { id: roomId },
      studentId: { id: studentId },
      item,
      condition,
      notes,
      dateProvided: new Date(),
      lastInspected: new Date(),
      status: 'occupied' // Since it's being assigned to a student
    });
    
    const savedInventoryItem = await newInventoryItem.save();
    
    // Populate the response with room and student details
    const populatedItem = await Inventory.findById(savedInventoryItem._id)
      .populate('roomId.id', 'roomNumber building floor')
      .populate('studentId.id', 'name email studentId');
    
    res.status(201).json(populatedItem);
  } catch (error: any) {
    console.error('Add inventory item error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Staff only)
export const updateInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { condition, status, notes } = req.body;
    
    // Find inventory item
    const inventoryItem = await Inventory.findById(req.params.id);
    
    if (!inventoryItem) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }
    
    // Update fields
    if (condition) inventoryItem.condition = condition;
    if (status) inventoryItem.status = status;
    if (notes) inventoryItem.notes = notes;
    
    // Update inspection date
    inventoryItem.lastInspected = new Date();
    inventoryItem.updatedAt = new Date();
    
    const updatedInventoryItem = await inventoryItem.save();
    
    // Populate the response with room and student details
    const populatedItem = await Inventory.findById(updatedInventoryItem._id)
      .populate('roomId.id', 'roomNumber building floor')
      .populate('studentId.id', 'name email studentId');
    
    res.json(populatedItem);
  } catch (error: any) {
    console.error('Update inventory item error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
