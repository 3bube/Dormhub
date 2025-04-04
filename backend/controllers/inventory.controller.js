"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventoryItem = exports.addInventoryItem = exports.getLowStockInventory = exports.getAllInventory = exports.getStudentInventory = void 0;
const inventory_model_1 = __importDefault(require("../models/inventory.model"));
// @desc    Get student's room inventory
// @route   GET /api/students/:id/inventory
// @access  Private
const getStudentInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const studentId = req.params.id;
        // Check if user is authorized to view this inventory
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'staff' && studentId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
            res.status(403).json({ message: 'Not authorized to view this inventory' });
            return;
        }
        const inventory = yield inventory_model_1.default.find({ 'studentId.id': studentId })
            .populate('roomId.id', 'roomNumber building floor')
            .sort({ dateProvided: -1 });
        res.json(inventory);
    }
    catch (error) {
        console.error('Get student inventory error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getStudentInventory = getStudentInventory;
// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Staff only)
const getAllInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, status, condition } = req.query;
        let query = {};
        if (roomId)
            query['roomId.id'] = roomId;
        if (status)
            query.status = status;
        if (condition)
            query.condition = condition;
        const inventory = yield inventory_model_1.default.find(query)
            .populate('roomId.id', 'roomNumber building floor')
            .populate('studentId.id', 'name email studentId')
            .sort({ updatedAt: -1 });
        res.json(inventory);
    }
    catch (error) {
        console.error('Get all inventory error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getAllInventory = getAllInventory;
// @desc    Get low stock inventory items
// @route   GET /api/inventory/low-stock
// @access  Private (Staff only)
const getLowStockInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Group inventory items by item name and count them
        const inventoryStats = yield inventory_model_1.default.aggregate([
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
    }
    catch (error) {
        console.error('Get low stock inventory error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getLowStockInventory = getLowStockInventory;
// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (Staff only)
const addInventoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, studentId, item, condition, notes } = req.body;
        // Validate required fields
        if (!roomId || !studentId || !item || !condition) {
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }
        const newInventoryItem = new inventory_model_1.default({
            roomId: { id: roomId },
            studentId: { id: studentId },
            item,
            condition,
            notes,
            dateProvided: new Date(),
            lastInspected: new Date(),
            status: 'occupied' // Since it's being assigned to a student
        });
        const savedInventoryItem = yield newInventoryItem.save();
        // Populate the response with room and student details
        const populatedItem = yield inventory_model_1.default.findById(savedInventoryItem._id)
            .populate('roomId.id', 'roomNumber building floor')
            .populate('studentId.id', 'name email studentId');
        res.status(201).json(populatedItem);
    }
    catch (error) {
        console.error('Add inventory item error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.addInventoryItem = addInventoryItem;
// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Staff only)
const updateInventoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { condition, status, notes } = req.body;
        // Find inventory item
        const inventoryItem = yield inventory_model_1.default.findById(req.params.id);
        if (!inventoryItem) {
            res.status(404).json({ message: 'Inventory item not found' });
            return;
        }
        // Update fields
        if (condition)
            inventoryItem.condition = condition;
        if (status)
            inventoryItem.status = status;
        if (notes)
            inventoryItem.notes = notes;
        // Update inspection date
        inventoryItem.lastInspected = new Date();
        inventoryItem.updatedAt = new Date();
        const updatedInventoryItem = yield inventoryItem.save();
        // Populate the response with room and student details
        const populatedItem = yield inventory_model_1.default.findById(updatedInventoryItem._id)
            .populate('roomId.id', 'roomNumber building floor')
            .populate('studentId.id', 'name email studentId');
        res.json(populatedItem);
    }
    catch (error) {
        console.error('Update inventory item error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Inventory item not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.updateInventoryItem = updateInventoryItem;
