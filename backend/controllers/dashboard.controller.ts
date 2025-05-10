import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import User from "../models/user.model";
import Room from "../models/room.model";
import Complaint from "../models/complaint.model";
import Payment from "../models/payment.model";
import Allocation from "../models/allocation.model";
import Meal from "../models/meal.model";
import Notification from "../models/notification.model";
import StudentMealPlan from "../models/studentMealPlan.model";

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSecs < 60) {
    return `${diffSecs} seconds ago`;
  } else if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
}

// Define interfaces for model properties to avoid type errors
interface IRoom {
  _id: string;
  roomNumber: string;
  type: string;
  floor: string;
  building?: string;
  status?: string;
  allocations: Array<{
    student: string;
    startDate: Date;
    endDate: Date;
    status: string;
    bedNumber?: number;
  }>;
}

interface IMealPlan {
  _id: string;
  name: string;
  description: string;
  meals: string[];
}

interface IStudentMealPlan {
  _id: string;
  student: string;
  mealPlan: IMealPlan;
  startDate: Date;
  endDate: Date;
  status: string;
}

interface IMeal {
  _id: string;
  name: string;
  scheduledTime: Date;
  studentMealPlans: Array<{
    student: string;
    status: string;
  }>;
}

interface IPayment {
  _id: string;
  student: string;
  amount: number;
  status: string;
  paymentDate: Date;
  description: string;
  createdAt: Date;
  dueDate?: Date;
}

interface IComplaint {
  _id: string;
  student: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date;
}

interface INotification {
  _id: string;
  title: string;
  message: string;
  createdAt: Date;
  type: "info" | "warning" | "error" | "success";
  recipients: string[];
  recipientRole: string;
}

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private (Student only)
export const getStudentDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Get student's room from allocations
    const allocation = await Allocation.findOne({
      student: req.user._id,
    }).populate("room");

    // get student's room
    const room = await Room.findById(allocation?.room);

    let roomInfo = {
      roomNumber: room?.roomNumber,
      floor: room?.floor,
      type: room?.type,
      amenities: room?.amenities,
      startDate: allocation?.startDate || new Date(),
      endDate: allocation?.endDate || new Date(),
      status: room?.status || "inactive",
    };

    // Get student's meal plan
    const studentMealPlan = (await StudentMealPlan.findOne({
      student: req.user._id,
      status: "active",
    }).populate("mealPlan")) as unknown as IStudentMealPlan | null;

    let mealPlanInfo = {
      name: studentMealPlan?.mealPlan?.name,
      description: studentMealPlan?.mealPlan?.description,
      meals: studentMealPlan?.mealPlan?.meals,
      startDate: studentMealPlan?.startDate,
      endDate: studentMealPlan?.endDate,
      status: studentMealPlan?.status,
    };

    // Get student's payment information
    const payments = (await Payment.find({
      student: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(5)) as unknown as IPayment[];

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
    const complaints = (await Complaint.find({
      student: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(5)) as unknown as IComplaint[];

    const complaintInfo = complaints.map((complaint) => ({
      id: complaint._id,
      title: complaint.title,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      date: new Date(complaint.createdAt).toLocaleDateString(),
    }));

    // Get notifications for the student
    const notifications = (await Notification.find({
      $or: [
        { recipients: req.user._id },
        { recipientRole: "all" },
        { recipientRole: "student" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)) as unknown as INotification[];

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
  } catch (error: any) {
    console.error("Get student dashboard error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get staff dashboard data
// @route   GET /api/dashboard/staff
// @access  Private (Staff only)
export const getStaffDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Get total rooms and occupancy information
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({
      allocations: { $elemMatch: { status: "active" } },
    });
    const maintenanceRooms = await Room.countDocuments({
      status: "maintenance",
    });
    const vacantRooms = totalRooms - occupiedRooms - maintenanceRooms;

    // Get student information
    const totalStudents = await User.countDocuments({ role: "student" });
    const newAdmissions = await User.countDocuments({
      role: "student",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });
    const checkouts = await Room.countDocuments({
      allocations: {
        $elemMatch: {
          status: "active",
          endDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Next 7 days
        },
      },
    });

    // Get complaint information
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({
      status: "pending",
    });
    const inProgressComplaints = await Complaint.countDocuments({
      status: "in-progress",
    });
    const resolvedComplaints = await Complaint.countDocuments({
      status: { $in: ["resolved", "closed"] },
    });

    // Get meal information
    // This would typically come from meal attendance records
    const breakfastAttendance = 120; // Example value
    const lunchAttendance = 135; // Example value
    const dinnerAttendance = 142; // Example value

    // Get payment information
    const payments = (await Payment.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    })) as unknown as IPayment[];

    const collectedPayments = payments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingPaymentsAmount = payments
      .filter((payment) => payment.status === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const overduePaymentsAmount = payments
      .filter(
        (payment) =>
          payment.status === "pending" &&
          payment.dueDate &&
          new Date(payment.dueDate) < new Date()
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Get notifications
    const notifications = (await Notification.find({
      $or: [
        { recipients: req.user._id },
        { recipientRole: "all" },
        { recipientRole: "staff" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)) as unknown as INotification[];

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

    // Find all students
    type StudentProjection = { _id: any; studentId?: string; name: string };

    const allStudents = await User.find(
      { role: "student" },
      { _id: 1, studentId: 1, name: 1 }
    ) as unknown as StudentProjection[];

    // Find all active allocations
    const activeAllocations = await Allocation.find({ active: true }, { student: 1 });

    const allocatedStudentIds = new Set(activeAllocations.map(a => a.student.toString()));

    // Students without room = those not in allocatedStudentIds
    const studentsWithoutRoom = allStudents.filter(s => !allocatedStudentIds.has(s._id.toString())).map(s => ({
      studentId: s._id,
      name: s.name
    }));


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
      studentsWithoutRoom,
    };

    res.json(dashboardData);
  } catch (error: any) {
    console.error("Get staff dashboard error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
