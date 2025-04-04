import express, { Router } from "express";
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintCategories,
  addComment,
  getComments,
  updateStatus,
  getStats,
  getUserComplaints,
} from "../controllers/complaint.controller";
import { protect, staffOnly } from "../middleware/auth.middleware";

const router = Router();

// Get all complaints (filtered by user role)
router.get("/", protect, getComplaints as express.RequestHandler);

// Get complaint categories
router.get("/categories", getComplaintCategories as express.RequestHandler);

// Get complaint statistics (staff only)
router.get("/stats", protect, staffOnly, getStats as express.RequestHandler);

// Get user complaints (student only)
router.get("/user", protect, getUserComplaints as express.RequestHandler);

// Get complaint by ID
router.get("/:id", protect, getComplaintById as express.RequestHandler);

// Create new complaint
router.post("/", protect, createComplaint as express.RequestHandler);

// Update complaint
router.put("/:id", protect, updateComplaint as express.RequestHandler);

// Delete complaint (staff only)
router.delete(
  "/:id",
  protect,
  staffOnly,
  deleteComplaint as express.RequestHandler
);

// Add comment to complaint
router.post("/:id/comments", protect, addComment as express.RequestHandler);

// Get comments for a complaint
router.get("/:id/comments", protect, getComments as express.RequestHandler);

// Update complaint status (staff only)
router.put(
  "/:id/status",
  protect,
  staffOnly,
  updateStatus as express.RequestHandler
);

export default router;
