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
exports.getStaffDashboard = exports.getStudentDashboard = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const room_model_1 = __importDefault(require("../models/room.model"));
const complaint_model_1 = __importDefault(require("../models/complaint.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const allocation_model_1 = __importDefault(require("../models/allocation.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const studentMealPlan_model_1 = __importDefault(require("../models/studentMealPlan.model"));
// Helper function to format time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    if (diffSecs < 60) {
        return `${diffSecs} seconds ago`;
    }
    else if (diffMins < 60) {
        return `${diffMins} minutes ago`;
    }
    else if (diffHours < 24) {
        return `${diffHours} hours ago`;
    }
    else if (diffDays === 1) {
        return "Yesterday";
    }
    else if (diffDays < 7) {
        return `${diffDays} days ago`;
    }
    else {
        return new Date(date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }
}
// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private (Student only)
const getStudentDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        // Get student's room from allocations
        const allocation = yield allocation_model_1.default.findOne({
            student: req.user._id,
        }).populate("room");
        // get student's room
        const room = yield room_model_1.default.findById(allocation === null || allocation === void 0 ? void 0 : allocation.room);
        let roomInfo = {
            roomNumber: room === null || room === void 0 ? void 0 : room.roomNumber,
            floor: room === null || room === void 0 ? void 0 : room.floor,
            type: room === null || room === void 0 ? void 0 : room.type,
            amenities: room === null || room === void 0 ? void 0 : room.amenities,
            startDate: (allocation === null || allocation === void 0 ? void 0 : allocation.startDate) || new Date(),
            endDate: (allocation === null || allocation === void 0 ? void 0 : allocation.endDate) || new Date(),
            status: (room === null || room === void 0 ? void 0 : room.status) || "inactive",
        };
        // Get student's meal plan
        const studentMealPlan = (yield studentMealPlan_model_1.default.findOne({
            student: req.user._id,
            status: "active",
        }).populate("mealPlan"));
        let mealPlanInfo = {
            name: (_a = studentMealPlan === null || studentMealPlan === void 0 ? void 0 : studentMealPlan.mealPlan) === null || _a === void 0 ? void 0 : _a.name,
            description: (_b = studentMealPlan === null || studentMealPlan === void 0 ? void 0 : studentMealPlan.mealPlan) === null || _b === void 0 ? void 0 : _b.description,
            meals: (_c = studentMealPlan === null || studentMealPlan === void 0 ? void 0 : studentMealPlan.mealPlan) === null || _c === void 0 ? void 0 : _c.meals,
            startDate: studentMealPlan === null || studentMealPlan === void 0 ? void 0 : studentMealPlan.startDate,
            endDate: studentMealPlan === null || studentMealPlan === void 0 ? void 0 : studentMealPlan.endDate,
            status: studentMealPlan === null || studentMealPlan === void 0 ? void 0 : studentMealPlan.status,
        };
        // Get student's payment information
        const payments = (yield payment_model_1.default.find({
            student: req.user._id,
        })
            .sort({ createdAt: -1 })
            .limit(5));
        const paymentInfo = payments.map((payment) => ({
            id: payment._id,
            amount: `₹${payment.amount.toLocaleString()}`,
            description: payment.description,
            date: new Date(payment.createdAt).toLocaleDateString(),
            status: payment.status,
            dueDate: payment.dueDate
                ? new Date(payment.dueDate).toLocaleDateString()
                : null,
        }));
        // Get student's complaints
        const complaints = (yield complaint_model_1.default.find({
            student: req.user._id,
        })
            .sort({ createdAt: -1 })
            .limit(5));
        const complaintInfo = complaints.map((complaint) => ({
            id: complaint._id,
            title: complaint.title,
            category: complaint.category,
            priority: complaint.priority,
            status: complaint.status,
            date: new Date(complaint.createdAt).toLocaleDateString(),
        }));
        // Get notifications for the student
        const notifications = (yield notification_model_1.default.find({
            $or: [
                { recipients: req.user._id },
                { recipientRole: "all" },
                { recipientRole: "student" },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(5));
        const notificationInfo = notifications.map((notification) => ({
            id: notification._id,
            title: notification.title,
            message: notification.message,
            date: getTimeAgo(notification.createdAt),
            type: notification.type || "info",
        }));
        // Format the response data
        const dashboardData = {
            room: roomInfo,
            mealPlan: mealPlanInfo,
            payments: paymentInfo,
            complaints: complaintInfo,
            notifications: notificationInfo,
        };
        res.json(dashboardData);
    }
    catch (error) {
        console.error("Get student dashboard error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getStudentDashboard = getStudentDashboard;
// @desc    Get staff dashboard data
// @route   GET /api/dashboard/staff
// @access  Private (Staff only)
const getStaffDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        // Get total rooms and occupancy information
        const totalRooms = yield room_model_1.default.countDocuments();
        const occupiedRooms = yield room_model_1.default.countDocuments({
            allocations: { $elemMatch: { status: "active" } },
        });
        const maintenanceRooms = yield room_model_1.default.countDocuments({
            status: "maintenance",
        });
        const vacantRooms = totalRooms - occupiedRooms - maintenanceRooms;
        // Get student information
        const totalStudents = yield user_model_1.default.countDocuments({ role: "student" });
        const newAdmissions = yield user_model_1.default.countDocuments({
            role: "student",
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        });
        const checkouts = yield room_model_1.default.countDocuments({
            allocations: {
                $elemMatch: {
                    status: "active",
                    endDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Next 7 days
                },
            },
        });
        // Get complaint information
        const totalComplaints = yield complaint_model_1.default.countDocuments();
        const pendingComplaints = yield complaint_model_1.default.countDocuments({
            status: "pending",
        });
        const inProgressComplaints = yield complaint_model_1.default.countDocuments({
            status: "in-progress",
        });
        const resolvedComplaints = yield complaint_model_1.default.countDocuments({
            status: { $in: ["resolved", "closed"] },
        });
        // Get meal information
        // This would typically come from meal attendance records
        const breakfastAttendance = 120; // Example value
        const lunchAttendance = 135; // Example value
        const dinnerAttendance = 142; // Example value
        // Get payment information
        const payments = (yield payment_model_1.default.find({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        }));
        const collectedPayments = payments
            .filter((payment) => payment.status === "paid")
            .reduce((sum, payment) => sum + payment.amount, 0);
        const pendingPaymentsAmount = payments
            .filter((payment) => payment.status === "pending")
            .reduce((sum, payment) => sum + payment.amount, 0);
        const overduePaymentsAmount = payments
            .filter((payment) => payment.status === "pending" &&
            payment.dueDate &&
            new Date(payment.dueDate) < new Date())
            .reduce((sum, payment) => sum + payment.amount, 0);
        // Get notifications
        const notifications = (yield notification_model_1.default.find({
            $or: [
                { recipients: req.user._id },
                { recipientRole: "all" },
                { recipientRole: "staff" },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(5));
        // Get recent activities
        // In a real implementation, this would come from an activity log
        const recentActivities = [
            {
                id: 1,
                action: "New student registered",
                user: "John Doe",
                date: "2 hours ago",
            },
            {
                id: 2,
                action: "Room allocation updated",
                user: "Admin",
                date: "Yesterday",
            },
            {
                id: 3,
                action: "Payment received",
                user: "Jane Smith",
                date: "2 days ago",
            },
        ];
        // Format the response data
        const dashboardData = {
            occupancy: {
                total: totalRooms,
                occupied: occupiedRooms,
                vacant: vacantRooms,
                maintenance: maintenanceRooms,
            },
            students: {
                total: totalStudents,
                newAdmissions,
                checkouts,
            },
            complaints: {
                total: totalComplaints,
                pending: pendingComplaints,
                inProgress: inProgressComplaints,
                resolved: resolvedComplaints,
            },
            meals: {
                breakfast: breakfastAttendance,
                lunch: lunchAttendance,
                dinner: dinnerAttendance,
            },
            payments: {
                collected: `₹${collectedPayments.toLocaleString()}`,
                pending: `₹${pendingPaymentsAmount.toLocaleString()}`,
                overdue: `₹${overduePaymentsAmount.toLocaleString()}`,
            },
            notifications: notifications.map((notification) => ({
                id: notification._id,
                title: notification.title,
                message: notification.message,
                date: getTimeAgo(notification.createdAt),
                type: notification.type || "info",
            })),
            recentActivities,
        };
        res.json(dashboardData);
    }
    catch (error) {
        console.error("Get staff dashboard error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getStaffDashboard = getStaffDashboard;
