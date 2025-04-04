import { Request, Response } from "express";
import mongoose from "mongoose";
import Payment from "../models/payment.model";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";

// @desc    Get all payments (filtered by user role)
// @route   GET /api/payments
// @access  Private
export const getPayments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    let payments;

    // If user is staff, get all payments with optional filters
    // If user is student, get only their payments
    if (req.user?.role === "staff") {
      // Staff can filter by status, date range, etc.
      const { status, startDate, endDate } = req.query;
      let query: any = {};

      if (status) query.status = status;

      // Date range filter
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      payments = await Payment.find(query)
        .populate("studentId", "name email studentId")
        .sort({ createdAt: -1 });
    } else {
      // Student can only see their own payments
      payments = await Payment.find({
        studentId: req.user?._id,
      }).sort({ createdAt: -1 });
    }

    res.json(payments);
  } catch (error: any) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      "studentId",
      "name email studentId"
    );

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    // Check if user is authorized to view this payment
    if (
      req.user?.role !== "staff" &&
      req.user?._id.toString() !== payment.studentId.toString()
    ) {
      res.status(403).json({ message: "Not authorized to view this payment" });
      return;
    }

    res.json(payment);
  } catch (error: any) {
    console.error("Get payment by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
export const createPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId, amount, description, paymentMethod, dueDate } = req.body;

    // Validate input
    if (!studentId || !amount || !description || !paymentMethod) {
      res.status(400).json({ message: "Please provide all required fields" });
      return;
    }

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Only staff can create payments for any student
    // Students can only create payments for themselves
    if (req.user?.role !== "staff" && req.user?._id.toString() !== studentId) {
      res
        .status(403)
        .json({ message: "Not authorized to create payment for this student" });
      return;
    }

    // Create payment
    const payment = await Payment.create({
      studentId,
      amount,
      description,
      paymentMethod,
      status: "pending",
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date: 7 days from now
      remindersSent: 0,
    });

    res.status(201).json(payment);
  } catch (error: any) {
    console.error("Create payment error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get student's payments
// @route   GET /api/students/:id/payments
// @access  Private
export const getStudentPayments = async (
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

    // Only staff can view any student's payments
    // Students can only view their own payments
    if (req.user?.role !== "staff" && req.user?._id.toString() !== studentId) {
      res
        .status(403)
        .json({ message: "Not authorized to view this student's payments" });
      return;
    }

    // Get payments
    const payments = await Payment.find({ studentId }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error: any) {
    console.error("Get student payments error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get pending payments
// @route   GET /api/payments/pending
// @access  Private/Staff
export const getPendingPayments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Only staff can view pending payments
    if (req.user?.role !== "staff") {
      res
        .status(403)
        .json({ message: "Not authorized to view pending payments" });
      return;
    }

    // Get pending payments
    const pendingPayments = await Payment.find({ status: "pending" })
      .populate("studentId", "name email studentId")
      .sort({ dueDate: 1 }); // Sort by due date (earliest first)

    res.json(pendingPayments);
  } catch (error: any) {
    console.error("Get pending payments error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Record payment
// @route   POST /api/payments/record
// @access  Private/Staff
export const recordPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { paymentId, status, paymentMethod, receiptNumber, transactionId } =
      req.body;

    // Only staff can record payments
    if (req.user?.role !== "staff") {
      res.status(403).json({ message: "Not authorized to record payments" });
      return;
    }

    // Validate input
    if (!paymentId || !status) {
      res.status(400).json({ message: "Please provide payment ID and status" });
      return;
    }

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    // Update payment
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // If status is 'paid', add paidDate
    if (status === "paid") {
      updateData.paidDate = new Date();
    }

    // Add optional fields if provided
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (receiptNumber) updateData.receiptNumber = receiptNumber;
    if (transactionId) updateData.transactionId = transactionId;

    // Update payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    ).populate("studentId", "name email studentId");

    res.json(updatedPayment);
  } catch (error: any) {
    console.error("Record payment error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Staff
export const getPaymentStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Only staff can view payment statistics
    if (req.user?.role !== "staff") {
      res
        .status(403)
        .json({ message: "Not authorized to view payment statistics" });
      return;
    }

    // Get total payments
    const totalPayments = await Payment.countDocuments();

    // Get counts by status
    const statusCounts = await Payment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get sum by status
    const statusSums = await Payment.aggregate([
      { $group: { _id: "$status", total: { $sum: "$amount" } } },
    ]);

    // Get payments for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthPayments = await Payment.find({
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
    const overduePayments = await Payment.countDocuments({
      status: "pending",
      dueDate: { $lt: new Date() },
    });

    res.json({
      totalPayments,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      statusSums: statusSums.reduce((acc, curr) => {
        acc[curr._id] = curr.total;
        return acc;
      }, {} as Record<string, number>),
      currentMonth: {
        total: currentMonthTotal,
        paid: currentMonthPaid,
        pending: currentMonthTotal - currentMonthPaid,
        collectionRate:
          currentMonthTotal > 0
            ? (currentMonthPaid / currentMonthTotal) * 100
            : 0,
      },
      overduePayments,
    });
  } catch (error: any) {
    console.error("Get payment stats error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Send payment reminders
// @route   POST /api/payments/send-reminders
// @access  Private/Staff
export const sendPaymentReminders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Only staff can send payment reminders
    if (req.user?.role !== "staff") {
      res
        .status(403)
        .json({ message: "Not authorized to send payment reminders" });
      return;
    }

    // Find pending payments that are due soon or overdue
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const pendingPayments = await Payment.find({
      status: "pending",
      dueDate: { $lte: threeDaysFromNow },
    }).populate("studentId", "name email");

    // Mock email sending (in a real application, you would use a proper email service)
    // For this example, we'll just update the remindersSent count

    let remindersSent = 0;

    for (const payment of pendingPayments) {
      // Update remindersSent count
      await Payment.findByIdAndUpdate(payment._id, {
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
  } catch (error: any) {
    console.error("Send payment reminders error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get fee structure
// @route   GET /api/payments/fee-structure
// @access  Public
export const getFeeStructure = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error: any) {
    console.error("Get fee structure error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
