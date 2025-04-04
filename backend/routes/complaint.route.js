"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaint_controller_1 = require("../controllers/complaint.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all complaints (filtered by user role)
router.get("/", auth_middleware_1.protect, complaint_controller_1.getComplaints);
// Get complaint categories
router.get("/categories", complaint_controller_1.getComplaintCategories);
// Get complaint statistics (staff only)
router.get("/stats", auth_middleware_1.protect, auth_middleware_1.staffOnly, complaint_controller_1.getStats);
// Get user complaints (student only)
router.get("/user", auth_middleware_1.protect, complaint_controller_1.getUserComplaints);
// Get complaint by ID
router.get("/:id", auth_middleware_1.protect, complaint_controller_1.getComplaintById);
// Create new complaint
router.post("/", auth_middleware_1.protect, complaint_controller_1.createComplaint);
// Update complaint
router.put("/:id", auth_middleware_1.protect, complaint_controller_1.updateComplaint);
// Delete complaint (staff only)
router.delete("/:id", auth_middleware_1.protect, auth_middleware_1.staffOnly, complaint_controller_1.deleteComplaint);
// Add comment to complaint
router.post("/:id/comments", auth_middleware_1.protect, complaint_controller_1.addComment);
// Get comments for a complaint
router.get("/:id/comments", auth_middleware_1.protect, complaint_controller_1.getComments);
// Update complaint status (staff only)
router.put("/:id/status", auth_middleware_1.protect, auth_middleware_1.staffOnly, complaint_controller_1.updateStatus);
exports.default = router;
