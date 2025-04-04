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
exports.getUserComplaints = exports.getStats = exports.updateStatus = exports.getComments = exports.addComment = exports.getComplaintCategories = exports.deleteComplaint = exports.updateComplaint = exports.createComplaint = exports.getComplaintById = exports.getComplaints = void 0;
const complaint_model_1 = __importDefault(require("../models/complaint.model"));
const complaintComment_model_1 = __importDefault(require("../models/complaintComment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// @desc    Get all complaints (filtered by user role)
// @route   GET /api/complaints
// @access  Private
const getComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let complaints;
        // If user is staff, get all complaints
        // If user is student, get only their complaints
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "staff") {
            // Staff can filter by status, category, priority
            const { status, category, priority } = req.query;
            let query = {};
            if (status)
                query.status = status;
            if (category)
                query.category = category;
            if (priority)
                query.priority = priority;
            complaints = yield complaint_model_1.default.find(query)
                .populate("studentId.id", "name email studentId")
                .populate("assignedTo", "name email staffId")
                .sort({ createdAt: -1 });
        }
        else {
            // Student can only see their own complaints
            complaints = yield complaint_model_1.default.find({
                "studentId.id": (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            }).sort({ createdAt: -1 });
        }
        res.json(complaints);
    }
    catch (error) {
        console.error("Get complaints error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getComplaints = getComplaints;
// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const complaint = yield complaint_model_1.default.findById(req.params.id)
            .populate("studentId.id", "name email studentId")
            .populate("assignedTo", "name email staffId");
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found" });
            return;
        }
        // Check if user is authorized to view this complaint
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff" &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()) !== complaint.studentId.id.toString()) {
            res
                .status(403)
                .json({ message: "Not authorized to view this complaint" });
            return;
        }
        res.json(complaint);
    }
    catch (error) {
        console.error("Get complaint by ID error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getComplaintById = getComplaintById;
// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, category, priority, location, attachments } = req.body;
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        // Create complaint
        const complaint = yield complaint_model_1.default.create({
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
    }
    catch (error) {
        console.error("Create complaint error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.createComplaint = createComplaint;
// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { title, description, category, priority, location, attachments } = req.body;
        const complaint = yield complaint_model_1.default.findById(req.params.id);
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found" });
            return;
        }
        // Check if user is authorized to update this complaint
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff" &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()) !== complaint.studentId.id.toString()) {
            res
                .status(403)
                .json({ message: "Not authorized to update this complaint" });
            return;
        }
        // Students can only update if complaint is pending
        if (((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "staff" && complaint.status !== "pending") {
            res
                .status(400)
                .json({
                message: "Cannot update complaint that is already being processed",
            });
            return;
        }
        // Update complaint
        const updatedComplaint = yield complaint_model_1.default.findByIdAndUpdate(req.params.id, {
            title,
            description,
            category,
            priority,
            location,
            attachments,
            updatedAt: new Date(),
        }, { new: true });
        res.json(updatedComplaint);
    }
    catch (error) {
        console.error("Update complaint error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.updateComplaint = updateComplaint;
// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Staff
const deleteComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const complaint = yield complaint_model_1.default.findById(req.params.id);
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found" });
            return;
        }
        // Only staff can delete complaints
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff") {
            res.status(403).json({ message: "Not authorized to delete complaints" });
            return;
        }
        // Delete all comments associated with the complaint
        yield complaintComment_model_1.default.deleteMany({ "complaintId.id": req.params.id });
        // Delete the complaint
        yield complaint_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Complaint removed" });
    }
    catch (error) {
        console.error("Delete complaint error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.deleteComplaint = deleteComplaint;
// @desc    Get complaint categories
// @route   GET /api/complaints/categories
// @access  Public
const getComplaintCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // These categories should match the enum in the complaint model
        const categories = ["room", "meal", "facility", "staff", "other"];
        res.json(categories);
    }
    catch (error) {
        console.error("Get complaint categories error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getComplaintCategories = getComplaintCategories;
// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { comment } = req.body;
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        const complaint = yield complaint_model_1.default.findById(req.params.id);
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found" });
            return;
        }
        // Check if user is authorized to comment on this complaint
        if (req.user.role !== "staff" &&
            req.user._id.toString() !== complaint.studentId.id.toString()) {
            res
                .status(403)
                .json({ message: "Not authorized to comment on this complaint" });
            return;
        }
        // Create comment
        const newComment = yield complaintComment_model_1.default.create({
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
        yield complaint_model_1.default.findByIdAndUpdate(req.params.id, { updatedAt: new Date() });
        res.status(201).json(newComment);
    }
    catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.addComment = addComment;
// @desc    Get comments for a complaint
// @route   GET /api/complaints/:id/comments
// @access  Private
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const complaint = yield complaint_model_1.default.findById(req.params.id);
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found" });
            return;
        }
        // Check if user is authorized to view comments on this complaint
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff" &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()) !== complaint.studentId.id.toString()) {
            res
                .status(403)
                .json({ message: "Not authorized to view comments on this complaint" });
            return;
        }
        // Get comments
        const comments = yield complaintComment_model_1.default.find({
            "complaintId.id": req.params.id,
        })
            .populate("userId.id", "name email role")
            .sort({ createdAt: 1 });
        res.json(comments);
    }
    catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getComments = getComments;
// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private/Staff
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { status, assignedTo, resolution } = req.body;
        const complaint = yield complaint_model_1.default.findById(req.params.id);
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found" });
            return;
        }
        // Only staff can update status
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff") {
            res
                .status(403)
                .json({ message: "Not authorized to update complaint status" });
            return;
        }
        // Update fields
        const updateData = { status, updatedAt: new Date() };
        // If status is resolved or closed, add resolvedAt date
        if (status === "resolved" || status === "closed") {
            updateData.resolvedAt = new Date();
        }
        // If assignedTo is provided, update it
        if (assignedTo) {
            // Check if the assigned staff exists
            const staffExists = yield user_model_1.default.findOne({
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
        const updatedComplaint = yield complaint_model_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
        // Add a system comment about the status change
        yield complaintComment_model_1.default.create({
            complaintId: {
                id: req.params.id,
                ref: "Complaint",
            },
            userId: {
                id: req.user._id,
                ref: "User",
            },
            comment: `Status updated to ${status}${resolution ? ` with resolution: ${resolution}` : ""}`,
        });
        res.json(updatedComplaint);
    }
    catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.updateStatus = updateStatus;
// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private/Staff
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Only staff can view stats
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff") {
            res
                .status(403)
                .json({ message: "Not authorized to view complaint statistics" });
            return;
        }
        // Get counts by status
        const statusCounts = yield complaint_model_1.default.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        // Get counts by category
        const categoryCounts = yield complaint_model_1.default.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
        ]);
        // Get counts by priority
        const priorityCounts = yield complaint_model_1.default.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);
        // Get average resolution time (for resolved complaints)
        const resolvedComplaints = yield complaint_model_1.default.find({
            status: { $in: ["resolved", "closed"] },
            resolvedAt: { $exists: true },
        });
        let totalResolutionTime = 0;
        let resolvedCount = 0;
        resolvedComplaints.forEach((complaint) => {
            if (complaint.resolvedAt && complaint.createdAt) {
                const resolutionTime = complaint.resolvedAt.getTime() - complaint.createdAt.getTime();
                totalResolutionTime += resolutionTime;
                resolvedCount++;
            }
        });
        const averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;
        // Convert to days
        const averageResolutionDays = averageResolutionTime / (1000 * 60 * 60 * 24);
        // Get complaints created in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentComplaints = yield complaint_model_1.default.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
        });
        res.json({
            statusCounts: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            categoryCounts: categoryCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            priorityCounts: priorityCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            averageResolutionDays,
            recentComplaints,
            totalComplaints: yield complaint_model_1.default.countDocuments(),
        });
    }
    catch (error) {
        console.error("Get stats error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getStats = getStats;
// get user complaints
const getUserComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        // Query complaints where the studentId.id matches the user's ID
        const complaints = yield complaint_model_1.default.find({
            "studentId.id": userId
        }).sort({ createdAt: -1 });
        res.json(complaints);
    }
    catch (error) {
        console.error("Get user complaints error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getUserComplaints = getUserComplaints;
