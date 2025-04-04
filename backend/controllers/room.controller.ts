import { Request, Response } from "express";
import mongoose from "mongoose";
import Room from "../models/room.model";
import Bed from "../models/bed.model";
import User from "../models/user.model";
import Allocation from "../models/allocation.model";
import MaintenanceRequest from "../models/maintenance-request.model"; // Import MaintenanceRequest model
import { AuthRequest } from "../middleware/auth.middleware";

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error: any) {
    console.error("Get rooms error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Public
export const getRoomById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    res.json(room);
  } catch (error: any) {
    console.error("Get room by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private/Staff
export const createRoom = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      roomNumber,
      floor,
      building,
      capacity,
      type,
      amenities,
      price,
      status,
    } = req.body;

    // Create room
    const room = await Room.create({
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
      const bed = await Bed.create({
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
  } catch (error: any) {
    console.error("Create room error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Staff
export const updateRoom = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      roomNumber,
      floor,
      building,
      capacity,
      type,
      amenities,
      price,
      status,
    } = req.body;

    let room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    // Check if capacity is being reduced
    if (capacity && capacity < room.capacity) {
      // Check if there are allocations for beds that would be removed
      const bedCount = await Bed.countDocuments({
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
    room = await Room.findByIdAndUpdate(
      req.params.id,
      {
        roomNumber,
        floor,
        building,
        capacity,
        type,
        amenities,
        price,
        status,
      },
      { new: true }
    );

    // If capacity increased, add new beds
    if (capacity && room && capacity > room.capacity) {
      const currentBedCount = await Bed.countDocuments({
        "roomId.id": room._id,
      });
      for (let i = currentBedCount + 1; i <= capacity; i++) {
        await Bed.create({
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
  } catch (error: any) {
    console.error("Update room error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Staff
export const deleteRoom = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    // Check if room has any occupied beds
    const occupiedBeds = await Bed.countDocuments({
      "roomId.id": room._id,
      status: "occupied",
    });

    if (occupiedBeds > 0) {
      res.status(400).json({
        message:
          "Cannot delete room with active occupants. Please relocate students first.",
      });
      return;
    }

    // Delete all beds associated with the room
    await Bed.deleteMany({ "roomId.id": room._id });

    // Delete the room
    await Room.findByIdAndDelete(req.params.id);

    res.json({ message: "Room removed" });
  } catch (error: any) {
    console.error("Delete room error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get beds in a room
// @route   GET /api/rooms/:id/beds
// @access  Public
export const getRoomBeds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const roomId = req.params.id;

    // Check if room exists
    const roomExists = await Room.findById(roomId);
    if (!roomExists) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    // Get all beds for the room
    const beds = await Bed.find({ "roomId.id": roomId });

    res.json(beds);
  } catch (error: any) {
    console.error("Get room beds error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Public
export const getAvailableRooms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Find rooms with available status or with available beds
    const rooms = await Room.find({ status: "available" });

    // For each room, check how many beds are available
    const roomsWithAvailability = await Promise.all(
      rooms.map(async (room) => {
        const availableBeds = await Bed.countDocuments({
          "roomId.id": room._id,
          status: "available",
        });

        return {
          ...room.toObject(),
          availableBeds,
        };
      })
    );

    // Filter out rooms with no available beds
    const availableRooms = roomsWithAvailability.filter(
      (room) => room.availableBeds > 0
    );

    res.json(availableRooms);
  } catch (error: any) {
    console.error("Get available rooms error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Allocate room to student
// @route   POST /api/rooms/allocate
// @access  Private/Staff
export const allocateRoom = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId, roomId, bedId, startDate, endDate, paymentStatus } =
      req.body;

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    // Check if bed exists and is available
    const bed = await Bed.findById(bedId);
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
    const allocation = await Allocation.create({
      student: studentId,
      room: roomId,
      bed: bedId,
      startDate: startDate || new Date(),
      endDate,
      paymentStatus: paymentStatus || "pending",
    });

    // Update bed status
    await Bed.findByIdAndUpdate(bedId, { status: "occupied" });

    // Update student's room number
    await User.findByIdAndUpdate(studentId, { roomNumber: room.roomNumber });

    // Check if all beds in the room are now occupied
    const availableBeds = await Bed.countDocuments({
      "roomId.id": roomId,
      status: "available",
    });

    if (availableBeds === 0) {
      await Room.findByIdAndUpdate(roomId, { status: "occupied" });
    }

    console.log("Room allocation successful");

    res.status(201).json(allocation);
  } catch (error: any) {
    console.error("Allocate room error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Update room allocation
// @route   PUT /api/rooms/allocate/:id
// @access  Private/Staff
export const updateAllocation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { endDate, paymentStatus } = req.body;

    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
      res.status(404).json({ message: "Allocation not found" });
      return;
    }

    // Update allocation
    const updatedAllocation = await Allocation.findByIdAndUpdate(
      req.params.id,
      {
        endDate,
        paymentStatus,
      },
      { new: true }
    );

    res.json(updatedAllocation);
  } catch (error: any) {
    console.error("Update allocation error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    End room allocation
// @route   DELETE /api/rooms/allocate/:id
// @access  Private/Staff
export const endAllocation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
      res.status(404).json({ message: "Allocation not found" });
      return;
    }

    // Update bed status
    await Bed.findByIdAndUpdate(allocation.bed, { status: "available" });

    // Update room status if it was fully occupied
    const room = await Room.findById(allocation.room);
    if (room && room.status === "occupied") {
      await Room.findByIdAndUpdate(allocation.room, { status: "available" });
    }

    // Remove room number from student
    await User.findByIdAndUpdate(allocation.student, { roomNumber: null });

    // Set end date to now if not provided
    if (!allocation.endDate) {
      allocation.endDate = new Date();
      await allocation.save();
    }

    // Mark allocation as inactive instead of deleting
    await Allocation.findByIdAndUpdate(req.params.id, {
      active: false,
      endDate: allocation.endDate,
    });

    res.json({ message: "Allocation ended successfully" });
  } catch (error: any) {
    console.error("End allocation error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get student's room allocation
// @route   GET /api/students/:id/allocation
// @access  Private
export const getStudentAllocation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.params.id;

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Get active allocation
    const allocation = await Allocation.findOne({
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
  } catch (error: any) {
    console.error("Get student allocation error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get recent room allocations
// @route   GET /api/rooms/allocations/recent
// @access  Private/Staff
export const getRecentAllocations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get limit from query params or default to 5
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    // Find recent allocations
    const allocations = await Allocation.find()
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
      const student = allocation.student as any;
      const room = allocation.room as any;

      return {
        id: allocation._id,
        roomNumber: room?.roomNumber || "Unknown",
        type: room?.type || "Unknown",
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
  } catch (error: any) {
    console.error("Get recent allocations error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get pending maintenance requests
// @route   GET /api/rooms/maintenance/pending
// @access  Private/Staff
export const getPendingMaintenanceRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get limit from query params or default to 5
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    // Find pending maintenance requests
    const requests = await MaintenanceRequest.find({
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
      const room = request.room as any;

      return {
        id: request._id,
        roomNumber: room?.roomNumber || "Unknown",
        issue: request.issue,
        status: request.status === "pending" ? "Pending" : "In Progress",
        reportedOn: new Date(request.createdAt).toLocaleDateString(),
      };
    });

    res.json(formattedRequests);
  } catch (error: any) {
    console.error("Get pending maintenance requests error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Create a maintenance request
// @route   POST /api/rooms/maintenance
// @access  Private
export const createMaintenanceRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomId, issueType, description, priority, estimatedCompletionDate, notes } = req.body;

    // Validate request
    if (!roomId || !description) {
      res.status(400).json({ message: 'Room ID and description are required' });
      return;
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    // Create maintenance request
    const maintenanceRequest = new MaintenanceRequest({
      room: roomId,
      issue: issueType,
      description,
      status: 'pending',
      priority: priority || 'medium',
      estimatedCompletionDate,
      notes,
      reportedBy: req.user._id
    });

    await maintenanceRequest.save();

    res.status(201).json(maintenanceRequest);
  } catch (error: any) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
