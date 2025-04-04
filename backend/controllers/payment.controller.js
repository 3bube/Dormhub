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
exports.getFeeStructure = exports.sendPaymentReminders = exports.getPaymentStats = exports.recordPayment = exports.getPendingPayments = exports.getStudentPayments = exports.createPayment = exports.getPaymentById = exports.getPayments = void 0;
const payment_model_1 = __importDefault(require("../models/payment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// @desc    Get all payments (filtered by user role)
// @route   GET /api/payments
// @access  Private
const getPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let payments;
        // If user is staff, get all payments with optional filters
        // If user is student, get only their payments
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "staff") {
            // Staff can filter by status, date range, etc.
            const { status, startDate, endDate } = req.query;
            let query = {};
            if (status)
                query.status = status;
            // Date range filter
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate)
                    query.createdAt.$gte = new Date(startDate);
                if (endDate)
                    query.createdAt.$lte = new Date(endDate);
            }
            payments = yield payment_model_1.default.find(query)
                .populate("studentId", "name email studentId")
                .sort({ createdAt: -1 });
        }
        else {
            // Student can only see their own payments
            payments = yield payment_model_1.default.find({
                studentId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            }).sort({ createdAt: -1 });
        }
        res.json(payments);
    }
    catch (error) {
        console.error("Get payments error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getPayments = getPayments;
// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payment = yield payment_model_1.default.findById(req.params.id).populate("studentId", "name email studentId");
        if (!payment) {
            res.status(404).json({ message: "Payment not found" });
            return;
        }
        // Check if user is authorized to view this payment
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff" &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()) !== payment.studentId.toString()) {
            res.status(403).json({ message: "Not authorized to view this payment" });
            return;
        }
        res.json(payment);
    }
    catch (error) {
        console.error("Get payment by ID error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getPaymentById = getPaymentById;
// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { studentId, amount, description, paymentMethod, dueDate } = req.body;
        // Validate input
        if (!studentId || !amount || !description || !paymentMethod) {
            res.status(400).json({ message: "Please provide all required fields" });
            return;
        }
        // Check if student exists
        const student = yield user_model_1.default.findOne({ _id: studentId, role: "student" });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        // Only staff can create payments for any student
        // Students can only create payments for themselves
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()) !== studentId) {
            res
                .status(403)
                .json({ message: "Not authorized to create payment for this student" });
            return;
        }
        // Create payment
        const payment = yield payment_model_1.default.create({
            studentId,
            amount,
            description,
            paymentMethod,
            status: "pending",
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date: 7 days from now
            remindersSent: 0,
        });
        res.status(201).json(payment);
    }
    catch (error) {
        console.error("Create payment error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.createPayment = createPayment;
// @desc    Get student's payments
// @route   GET /api/students/:id/payments
// @access  Private
const getStudentPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const studentId = req.params.id;
        // Check if student exists
        const student = yield user_model_1.default.findOne({ _id: studentId, role: "student" });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        // Only staff can view any student's payments
        // Students can only view their own payments
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()) !== studentId) {
            res
                .status(403)
                .json({ message: "Not authorized to view this student's payments" });
            return;
        }
        // Get payments
        const payments = yield payment_model_1.default.find({ studentId }).sort({ createdAt: -1 });
        res.json(payments);
    }
    catch (error) {
        console.error("Get student payments error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getStudentPayments = getStudentPayments;
// @desc    Get pending payments
// @route   GET /api/payments/pending
// @access  Private/Staff
const getPendingPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Only staff can view pending payments
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff") {
            res
                .status(403)
                .json({ message: "Not authorized to view pending payments" });
            return;
        }
        // Get pending payments
        const pendingPayments = yield payment_model_1.default.find({ status: "pending" })
            .populate("studentId", "name email studentId")
            .sort({ dueDate: 1 }); // Sort by due date (earliest first)
        res.json(pendingPayments);
    }
    catch (error) {
        console.error("Get pending payments error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getPendingPayments = getPendingPayments;
// @desc    Record payment
// @route   POST /api/payments/record
// @access  Private/Staff
const recordPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { paymentId, status, paymentMethod, receiptNumber, transactionId } = req.body;
        // Only staff can record payments
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff") {
            res.status(403).json({ message: "Not authorized to record payments" });
            return;
        }
        // Validate input
        if (!paymentId || !status) {
            res.status(400).json({ message: "Please provide payment ID and status" });
            return;
        }
        // Find payment
        const payment = yield payment_model_1.default.findById(paymentId);
        if (!payment) {
            res.status(404).json({ message: "Payment not found" });
            return;
        }
        // Update payment
        const updateData = {
            status,
            updatedAt: new Date(),
        };
        // If status is 'paid', add paidDate
        if (status === "paid") {
            updateData.paidDate = new Date();
        }
        // Add optional fields if provided
        if (paymentMethod)
            updateData.paymentMethod = paymentMethod;
        if (receiptNumber)
            updateData.receiptNumber = receiptNumber;
        if (transactionId)
            updateData.transactionId = transactionId;
        // Update payment
        const updatedPayment = yield payment_model_1.default.findByIdAndUpdate(paymentId, updateData, { new: true }).populate("studentId", "name email studentId");
        res.json(updatedPayment);
    }
    catch (error) {
        console.error("Record payment error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.recordPayment = recordPayment;
// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Staff
const getPaymentStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Only staff can view payment statistics
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff") {
            res
                .status(403)
                .json({ message: "Not authorized to view payment statistics" });
            return;
        }
        // Get total payments
        const totalPayments = yield payment_model_1.default.countDocuments();
        // Get counts by status
        const statusCounts = yield payment_model_1.default.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        // Get sum by status
        const statusSums = yield payment_model_1.default.aggregate([
            { $group: { _id: "$status", total: { $sum: "$amount" } } },
        ]);
        // Get payments for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const currentMonthPayments = yield payment_model_1.default.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });
        // Calculate total and paid amount for current month
        let currentMonthTotal = 0;
        let currentMonthPaid = 0;
        currentMonthPayments.forEach((payment) => {
            currentMonthTotal += payment.amount;
            if (payment.status === "paid") {
                currentMonthPaid += payment.amount;
            }
        });
        // Get overdue payments
        const overduePayments = yield payment_model_1.default.countDocuments({
            status: "pending",
            dueDate: { $lt: new Date() },
        });
        res.json({
            totalPayments,
            statusCounts: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            statusSums: statusSums.reduce((acc, curr) => {
                acc[curr._id] = curr.total;
                return acc;
            }, {}),
            currentMonth: {
                total: currentMonthTotal,
                paid: currentMonthPaid,
                pending: currentMonthTotal - currentMonthPaid,
                collectionRate: currentMonthTotal > 0
                    ? (currentMonthPaid / currentMonthTotal) * 100
                    : 0,
            },
            overduePayments,
        });
    }
    catch (error) {
        console.error("Get payment stats error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getPaymentStats = getPaymentStats;
// @desc    Send payment reminders
// @route   POST /api/payments/send-reminders
// @access  Private/Staff
const sendPaymentReminders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Only staff can send payment reminders
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff") {
            res
                .status(403)
                .json({ message: "Not authorized to send payment reminders" });
            return;
        }
        // Find pending payments that are due soon or overdue
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const pendingPayments = yield payment_model_1.default.find({
            status: "pending",
            dueDate: { $lte: threeDaysFromNow },
        }).populate("studentId", "name email");
        // Mock email sending (in a real application, you would use a proper email service)
        // For this example, we'll just update the remindersSent count
        let remindersSent = 0;
        for (const payment of pendingPayments) {
            // Update remindersSent count
            yield payment_model_1.default.findByIdAndUpdate(payment._id, {
                $inc: { remindersSent: 1 },
                updatedAt: new Date(),
            });
            remindersSent++;
        }
        res.json({
            success: true,
            remindersSent,
            message: `${remindersSent} payment reminders have been sent.`,
        });
    }
    catch (error) {
        console.error("Send payment reminders error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.sendPaymentReminders = sendPaymentReminders;
// @desc    Get fee structure
// @route   GET /api/payments/fee-structure
// @access  Public
const getFeeStructure = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Since there's no fee structure model, we'll return a static fee structure
        // In a real application, you would fetch this from the database
        const feeStructure = {
            accommodationFees: [
                {
                    type: "Single Room",
                    semesterFee: 2500,
                    yearlyFee: 4500,
                    description: "Private room with attached bathroom",
                },
                {
                    type: "Double Room",
                    semesterFee: 1800,
                    yearlyFee: 3200,
                    description: "Shared room with attached bathroom",
                },
                {
                    type: "Triple Room",
                    semesterFee: 1500,
                    yearlyFee: 2700,
                    description: "Shared room with common bathroom",
                },
            ],
            mealPlanFees: [
                {
                    type: "Full Board",
                    semesterFee: 1200,
                    yearlyFee: 2200,
                    description: "Breakfast, lunch, and dinner",
                },
                {
                    type: "Half Board",
                    semesterFee: 800,
                    yearlyFee: 1500,
                    description: "Breakfast and dinner",
                },
                {
                    type: "Breakfast Only",
                    semesterFee: 400,
                    yearlyFee: 750,
                    description: "Breakfast only",
                },
            ],
            otherFees: [
                {
                    type: "Security Deposit",
                    amount: 300,
                    description: "Refundable at the end of stay if no damages",
                },
                {
                    type: "Registration Fee",
                    amount: 100,
                    description: "One-time fee for new students",
                },
                {
                    type: "Laundry Service",
                    amount: 150,
                    description: "Per semester",
                },
            ],
            paymentMethods: [
                {
                    method: "online",
                    description: "Credit/Debit card or PayPal",
                },
                {
                    method: "bank_transfer",
                    description: "Direct bank transfer",
                },
                {
                    method: "cash",
                    description: "Cash payment at the administration office",
                },
            ],
            paymentSchedule: {
                fallSemester: {
                    dueDate: "August 15",
                    lateFeeDate: "August 30",
                    lateFeeAmount: 50,
                },
                springSemester: {
                    dueDate: "January 15",
                    lateFeeDate: "January 30",
                    lateFeeAmount: 50,
                },
            },
            discounts: [
                {
                    type: "Early Payment",
                    amount: "5%",
                    description: "For payments made 30 days before due date",
                },
                {
                    type: "Full Year Payment",
                    amount: "10%",
                    description: "For full year payment in advance",
                },
            ],
        };
        res.json(feeStructure);
    }
    catch (error) {
        console.error("Get fee structure error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getFeeStructure = getFeeStructure;
