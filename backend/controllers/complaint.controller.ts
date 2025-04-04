import { Request, Response } from "express";
import mongoose from "mongoose";
import Complaint from "../models/complaint.model";
import ComplaintComment from "../models/complaintComment.model";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";

// @desc    Get all complaints (filtered by user role)
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    let complaints;

    // If user is staff, get all complaints
    // If user is student, get only their complaints
    if (req.user?.role === "staff") {
      // Staff can filter by status, category, priority
      const { status, category, priority } = req.query;
      let query: any = {};

      if (status) query.status = status;
      if (category) query.category = category;
      if (priority) query.priority = priority;

      complaints = await Complaint.find(query)
        .populate("studentId.id", "name email studentId")
        .populate("assignedTo", "name email staffId")
        .sort({ createdAt: -1 });
    } else {
      // Student can only see their own complaints
      complaints = await Complaint.find({
        "studentId.id": req.user?._id,
      }).sort({ createdAt: -1 });
    }

    res.json(complaints);
  } catch (error: any) {
    console.error("Get complaints error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("studentId.id", "name email studentId")
      .populate("assignedTo", "name email staffId");

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Check if user is authorized to view this complaint
    if (
      req.user?.role !== "staff" &&
      req.user?._id.toString() !== complaint.studentId.id.toString()
    ) {
      res
        .status(403)
        .json({ message: "Not authorized to view this complaint" });
      return;
    }

    res.json(complaint);
  } catch (error: any) {
    console.error("Get complaint by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
export const createComplaint = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, priority, location, attachments } =
      req.body;

    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Create complaint
    const complaint = await Complaint.create({
      studentId: {
        id: req.user._id,
        ref: "User",
      },
      title,
      description,
      category,
      priority: priority || "medium",
      status: "pending",
      location,
      attachments: attachments || [],
    });

    res.status(201).json(complaint);
  } catch (error: any) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
export const updateComplaint = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, priority, location, attachments } =
      req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Check if user is authorized to update this complaint
    if (
      req.user?.role !== "staff" &&
      req.user?._id.toString() !== complaint.studentId.id.toString()
    ) {
      res
        .status(403)
        .json({ message: "Not authorized to update this complaint" });
      return;
    }

    // Students can only update if complaint is pending
    if (req.user?.role !== "staff" && complaint.status !== "pending") {
      res
        .status(400)
        .json({
          message: "Cannot update complaint that is already being processed",
        });
      return;
    }

    // Update complaint
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        priority,
        location,
        attachments,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json(updatedComplaint);
  } catch (error: any) {
    console.error("Update complaint error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Staff
export const deleteComplaint = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Only staff can delete complaints
    if (req.user?.role !== "staff") {
      res.status(403).json({ message: "Not authorized to delete complaints" });
      return;
    }

    // Delete all comments associated with the complaint
    await ComplaintComment.deleteMany({ "complaintId.id": req.params.id });

    // Delete the complaint
    await Complaint.findByIdAndDelete(req.params.id);

    res.json({ message: "Complaint removed" });
  } catch (error: any) {
    console.error("Delete complaint error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get complaint categories
// @route   GET /api/complaints/categories
// @access  Public
export const getComplaintCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // These categories should match the enum in the complaint model
    const categories = ["room", "meal", "facility", "staff", "other"];
    res.json(categories);
  } catch (error: any) {
    console.error("Get complaint categories error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
export const addComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { comment } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Check if user is authorized to comment on this complaint
    if (
      req.user.role !== "staff" &&
      req.user._id.toString() !== complaint.studentId.id.toString()
    ) {
      res
        .status(403)
        .json({ message: "Not authorized to comment on this complaint" });
      return;
    }

    // Create comment
    const newComment = await ComplaintComment.create({
      complaintId: {
        id: req.params.id,
        ref: "Complaint",
      },
      userId: {
        id: req.user._id,
        ref: "User",
      },
      comment,
    });

    // Update the complaint's updatedAt field
    await Complaint.findByIdAndUpdate(req.params.id, { updatedAt: new Date() });

    res.status(201).json(newComment);
  } catch (error: any) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get comments for a complaint
// @route   GET /api/complaints/:id/comments
// @access  Private
export const getComments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Check if user is authorized to view comments on this complaint
    if (
      req.user?.role !== "staff" &&
      req.user?._id.toString() !== complaint.studentId.id.toString()
    ) {
      res
        .status(403)
        .json({ message: "Not authorized to view comments on this complaint" });
      return;
    }

    // Get comments
    const comments = await ComplaintComment.find({
      "complaintId.id": req.params.id,
    })
      .populate("userId.id", "name email role")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error: any) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private/Staff
export const updateStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, assignedTo, resolution } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Only staff can update status
    if (req.user?.role !== "staff") {
      res
        .status(403)
        .json({ message: "Not authorized to update complaint status" });
      return;
    }

    // Update fields
    const updateData: any = { status, updatedAt: new Date() };

    // If status is resolved or closed, add resolvedAt date
    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date();
    }

    // If assignedTo is provided, update it
    if (assignedTo) {
      // Check if the assigned staff exists
      const staffExists = await User.findOne({
        _id: assignedTo,
        role: "staff",
      });
      if (!staffExists) {
        res.status(400).json({ message: "Assigned staff not found" });
        return;
      }
      updateData.assignedTo = assignedTo;
    }

    // If resolution is provided, update it
    if (resolution) {
      updateData.resolution = resolution;
    }

    // Update complaint
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Add a system comment about the status change
    await ComplaintComment.create({
      complaintId: {
        id: req.params.id,
        ref: "Complaint",
      },
      userId: {
        id: req.user._id,
        ref: "User",
      },
      comment: `Status updated to ${status}${
        resolution ? ` with resolution: ${resolution}` : ""
      }`,
    });

    res.json(updatedComplaint);
  } catch (error: any) {
    console.error("Update status error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private/Staff
export const getStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Only staff can view stats
    if (req.user?.role !== "staff") {
      res
        .status(403)
        .json({ message: "Not authorized to view complaint statistics" });
      return;
    }

    // Get counts by status
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get counts by category
    const categoryCounts = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Get counts by priority
    const priorityCounts = await Complaint.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Get average resolution time (for resolved complaints)
    const resolvedComplaints = await Complaint.find({
      status: { $in: ["resolved", "closed"] },
      resolvedAt: { $exists: true },
    });

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    resolvedComplaints.forEach((complaint) => {
      if (complaint.resolvedAt && complaint.createdAt) {
        const resolutionTime =
          complaint.resolvedAt.getTime() - complaint.createdAt.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    const averageResolutionTime =
      resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    // Convert to days
    const averageResolutionDays = averageResolutionTime / (1000 * 60 * 60 * 24);

    // Get complaints created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentComplaints = await Complaint.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      categoryCounts: categoryCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      priorityCounts: priorityCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      averageResolutionDays,
      recentComplaints,
      totalComplaints: await Complaint.countDocuments(),
    });
  } catch (error: any) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// get user complaints
export const getUserComplaints = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Query complaints where the studentId.id matches the user's ID
    const complaints = await Complaint.find({ 
      "studentId.id": userId 
    }).sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error: any) {
    console.error("Get user complaints error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
