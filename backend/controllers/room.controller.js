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
exports.createMaintenanceRequest = exports.getPendingMaintenanceRequests = exports.getRecentAllocations = exports.getStudentAllocation = exports.endAllocation = exports.updateAllocation = exports.allocateRoom = exports.getAvailableRooms = exports.getRoomBeds = exports.deleteRoom = exports.updateRoom = exports.createRoom = exports.getRoomById = exports.getRooms = void 0;
const room_model_1 = __importDefault(require("../models/room.model"));
const bed_model_1 = __importDefault(require("../models/bed.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const allocation_model_1 = __importDefault(require("../models/allocation.model"));
const maintenance_request_model_1 = __importDefault(require("../models/maintenance-request.model")); // Import MaintenanceRequest model
// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
const getRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield room_model_1.default.find();
        res.json(rooms);
    }
    catch (error) {
        console.error("Get rooms error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getRooms = getRooms;
// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield room_model_1.default.findById(req.params.id);
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        res.json(room);
    }
    catch (error) {
        console.error("Get room by ID error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getRoomById = getRoomById;
// @desc    Create new room
// @route   POST /api/rooms
// @access  Private/Staff
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomNumber, floor, building, capacity, type, amenities, price, status, } = req.body;
        // Create room
        const room = yield room_model_1.default.create({
            roomNumber,
            floor,
            building,
            capacity,
            type,
            amenities,
            price,
            status: status || "available",
        });
        // Create beds for the room
        const beds = [];
        for (let i = 1; i <= capacity; i++) {
            const bed = yield bed_model_1.default.create({
                bedNumber: i,
                roomId: {
                    id: room._id,
                    reference: "Room",
                },
                status: "available",
            });
            beds.push(bed);
        }
        console.log("Room created successfully");
        res.status(201).json({ room, beds });
    }
    catch (error) {
        console.error("Create room error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.createRoom = createRoom;
// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Staff
const updateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomNumber, floor, building, capacity, type, amenities, price, status, } = req.body;
        let room = yield room_model_1.default.findById(req.params.id);
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        // Check if capacity is being reduced
        if (capacity && capacity < room.capacity) {
            // Check if there are allocations for beds that would be removed
            const bedCount = yield bed_model_1.default.countDocuments({
                "roomId.id": room._id,
                status: "occupied",
            });
            if (bedCount > capacity) {
                res.status(400).json({
                    message: `Cannot reduce capacity below current occupancy. There are ${bedCount} beds occupied.`,
                });
                return;
            }
        }
        // Update room
        room = yield room_model_1.default.findByIdAndUpdate(req.params.id, {
            roomNumber,
            floor,
            building,
            capacity,
            type,
            amenities,
            price,
            status,
        }, { new: true });
        // If capacity increased, add new beds
        if (capacity && room && capacity > room.capacity) {
            const currentBedCount = yield bed_model_1.default.countDocuments({
                "roomId.id": room._id,
            });
            for (let i = currentBedCount + 1; i <= capacity; i++) {
                yield bed_model_1.default.create({
                    bedNumber: i,
                    roomId: {
                        id: room._id,
                        reference: "Room",
                    },
                    status: "available",
                });
            }
        }
        res.json(room);
    }
    catch (error) {
        console.error("Update room error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.updateRoom = updateRoom;
// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Staff
const deleteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield room_model_1.default.findById(req.params.id);
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        // Check if room has any occupied beds
        const occupiedBeds = yield bed_model_1.default.countDocuments({
            "roomId.id": room._id,
            status: "occupied",
        });
        if (occupiedBeds > 0) {
            res.status(400).json({
                message: "Cannot delete room with active occupants. Please relocate students first.",
            });
            return;
        }
        // Delete all beds associated with the room
        yield bed_model_1.default.deleteMany({ "roomId.id": room._id });
        // Delete the room
        yield room_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Room removed" });
    }
    catch (error) {
        console.error("Delete room error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.deleteRoom = deleteRoom;
// @desc    Get beds in a room
// @route   GET /api/rooms/:id/beds
// @access  Public
const getRoomBeds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = req.params.id;
        // Check if room exists
        const roomExists = yield room_model_1.default.findById(roomId);
        if (!roomExists) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        // Get all beds for the room
        const beds = yield bed_model_1.default.find({ "roomId.id": roomId });
        res.json(beds);
    }
    catch (error) {
        console.error("Get room beds error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getRoomBeds = getRoomBeds;
// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Public
const getAvailableRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find rooms with available status or with available beds
        const rooms = yield room_model_1.default.find({ status: "available" });
        // For each room, check how many beds are available
        const roomsWithAvailability = yield Promise.all(rooms.map((room) => __awaiter(void 0, void 0, void 0, function* () {
            const availableBeds = yield bed_model_1.default.countDocuments({
                "roomId.id": room._id,
                status: "available",
            });
            return Object.assign(Object.assign({}, room.toObject()), { availableBeds });
        })));
        // Filter out rooms with no available beds
        const availableRooms = roomsWithAvailability.filter((room) => room.availableBeds > 0);
        res.json(availableRooms);
    }
    catch (error) {
        console.error("Get available rooms error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getAvailableRooms = getAvailableRooms;
// @desc    Allocate room to student
// @route   POST /api/rooms/allocate
// @access  Private/Staff
const allocateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, roomId, bedId, startDate, endDate, paymentStatus } = req.body;
        // Check if student exists
        const student = yield user_model_1.default.findOne({ _id: studentId, role: "student" });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        // Check if room exists
        const room = yield room_model_1.default.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        console.log("room", room);
        // Check if room is already fully occupied
        if (room.occupied >= room.capacity || room.status === "occupied") {
            res.status(400).json({ message: "Room is already fully occupied" });
            console.log("Room is already fully occupied");
            return;
        }
        // Check if bed exists and is available
        const bed = yield bed_model_1.default.findById(bedId);
        if (!bed) {
            res.status(404).json({ message: "Bed not found" });
            return;
        }
        if (bed.status !== "available") {
            res.status(400).json({ message: "Bed is not available" });
            return;
        }
        // Check if bed belongs to the specified room
        if (bed.roomId.id.toString() !== roomId) {
            res
                .status(400)
                .json({ message: "Bed does not belong to the specified room" });
            return;
        }
        // Create allocation
        const allocation = yield allocation_model_1.default.create({
            student: studentId,
            room: roomId,
            bed: bedId,
            startDate: startDate || new Date(),
            endDate,
            paymentStatus: paymentStatus || "pending",
        });
        // Update bed status
        yield bed_model_1.default.findByIdAndUpdate(bedId, { status: "occupied" });
        // Update student's room number
        yield user_model_1.default.findByIdAndUpdate(studentId, { roomNumber: room.roomNumber });
        // Increment the occupied property of the room
        yield room_model_1.default.findByIdAndUpdate(roomId, { $inc: { occupied: 1 } });
        // Check if all beds in the room are now occupied
        const availableBeds = yield bed_model_1.default.countDocuments({
            "roomId.id": roomId,
            status: "available",
        });
        if (availableBeds === 0) {
            yield room_model_1.default.findByIdAndUpdate(roomId, { status: "occupied" });
        }
        console.log("Room allocation successful");
        res.status(201).json(allocation);
    }
    catch (error) {
        console.error("Allocate room error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.allocateRoom = allocateRoom;
// @desc    Update room allocation
// @route   PUT /api/rooms/allocate/:id
// @access  Private/Staff
const updateAllocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { endDate, paymentStatus } = req.body;
        const allocation = yield allocation_model_1.default.findById(req.params.id);
        if (!allocation) {
            res.status(404).json({ message: "Allocation not found" });
            return;
        }
        // Update allocation
        const updatedAllocation = yield allocation_model_1.default.findByIdAndUpdate(req.params.id, {
            endDate,
            paymentStatus,
        }, { new: true });
        res.json(updatedAllocation);
    }
    catch (error) {
        console.error("Update allocation error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.updateAllocation = updateAllocation;
// @desc    End room allocation
// @route   DELETE /api/rooms/allocate/:id
// @access  Private/Staff
const endAllocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allocation = yield allocation_model_1.default.findById(req.params.id);
        if (!allocation) {
            res.status(404).json({ message: "Allocation not found" });
            return;
        }
        // Update bed status
        yield bed_model_1.default.findByIdAndUpdate(allocation.bed, { status: "available" });
        // Update room status if it was fully occupied
        const room = yield room_model_1.default.findById(allocation.room);
        if (room && room.status === "occupied") {
            yield room_model_1.default.findByIdAndUpdate(allocation.room, { status: "available" });
        }
        // Remove room number from student
        yield user_model_1.default.findByIdAndUpdate(allocation.student, { roomNumber: null });
        // Set end date to now if not provided
        if (!allocation.endDate) {
            allocation.endDate = new Date();
            yield allocation.save();
        }
        // Mark allocation as inactive instead of deleting
        yield allocation_model_1.default.findByIdAndUpdate(req.params.id, {
            active: false,
            endDate: allocation.endDate,
        });
        res.json({ message: "Allocation ended successfully" });
    }
    catch (error) {
        console.error("End allocation error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.endAllocation = endAllocation;
// @desc    Get student's room allocation
// @route   GET /api/students/:id/allocation
// @access  Private
const getStudentAllocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = req.params.id;
        // Check if student exists
        const student = yield user_model_1.default.findOne({ _id: studentId, role: "student" });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        // Get active allocation
        const allocation = yield allocation_model_1.default.findOne({
            student: studentId,
            active: true,
        })
            .populate("room")
            .populate("bed");
        if (!allocation) {
            res
                .status(404)
                .json({ message: "No active allocation found for this student" });
            return;
        }
        res.json(allocation);
    }
    catch (error) {
        console.error("Get student allocation error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getStudentAllocation = getStudentAllocation;
// @desc    Get recent room allocations
// @route   GET /api/rooms/allocations/recent
// @access  Private/Staff
const getRecentAllocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get limit from query params or default to 5
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        // Find recent allocations
        const allocations = yield allocation_model_1.default.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({
            path: "student",
            select: "name email roomNumber",
        })
            .populate({
            path: "room",
            select: "roomNumber type",
        });
        // Format the response
        const formattedAllocations = allocations.map((allocation) => {
            const student = allocation.student;
            const room = allocation.room;
            return {
                id: allocation._id,
                roomNumber: (room === null || room === void 0 ? void 0 : room.roomNumber) || "Unknown",
                type: (room === null || room === void 0 ? void 0 : room.type) || "Unknown",
                studentName: student ? `${student.name}` : "Unknown",
                date: new Date(allocation.createdAt).toLocaleDateString(),
                startDate: new Date(allocation.startDate).toLocaleDateString(),
                endDate: allocation.endDate
                    ? new Date(allocation.endDate).toLocaleDateString()
                    : "Active",
                status: allocation.active ? "Active" : "Ended",
            };
        });
        res.json(formattedAllocations);
    }
    catch (error) {
        console.error("Get recent allocations error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getRecentAllocations = getRecentAllocations;
// @desc    Get pending maintenance requests
// @route   GET /api/rooms/maintenance/pending
// @access  Private/Staff
const getPendingMaintenanceRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get limit from query params or default to 5
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        // Find pending maintenance requests
        const requests = yield maintenance_request_model_1.default.find({
            status: { $in: ["pending", "in-progress"] },
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({
            path: "room",
            select: "roomNumber",
        });
        // Format the response
        const formattedRequests = requests.map((request) => {
            const room = request.room;
            return {
                id: request._id,
                roomNumber: (room === null || room === void 0 ? void 0 : room.roomNumber) || "Unknown",
                issue: request.issue,
                status: request.status === "pending" ? "Pending" : "In Progress",
                reportedOn: new Date(request.createdAt).toLocaleDateString(),
            };
        });
        res.json(formattedRequests);
    }
    catch (error) {
        console.error("Get pending maintenance requests error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getPendingMaintenanceRequests = getPendingMaintenanceRequests;
// @desc    Create a maintenance request
// @route   POST /api/rooms/maintenance
// @access  Private
const createMaintenanceRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, issueType, description, priority, estimatedCompletionDate, notes } = req.body;
        // Validate request
        if (!roomId || !description) {
            res.status(400).json({ message: 'Room ID and description are required' });
            return;
        }
        // Check if room exists
        const room = yield room_model_1.default.findById(roomId);
        if (!room) {
            res.status(404).json({ message: 'Room not found' });
            return;
        }
        // Create maintenance request
        const maintenanceRequest = new maintenance_request_model_1.default({
            room: roomId,
            issue: issueType,
            description,
            status: 'pending',
            priority: priority || 'medium',
            estimatedCompletionDate,
            notes,
            reportedBy: req.user._id
        });
        yield maintenanceRequest.save();
        res.status(201).json(maintenanceRequest);
    }
    catch (error) {
        console.error('Create maintenance request error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.createMaintenanceRequest = createMaintenanceRequest;
