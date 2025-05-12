"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/app/context/AuthContext";
import {
  Bed,
  Utensils,
  DollarSign,
  AlertCircle as InfoIcon,
  AlertTriangle,
  Users,
  Home,
  CreditCard,
  BadgeAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dashboardService, {
  StudentDashboardData,
  StaffDashboardData,
} from "@/services/DashboardService";

// Mock data for the dashboard
const STUDENT_MOCK_DATA: StudentDashboardData = {
  room: {
    roomNumber: "A-101",
    type: "Double Sharing",
    floor: "1st Floor",
    endDate: new Date("2025-12-15"),
  },
  mealPlan: {
    name: "Basic Plan",
    description: "Includes breakfast, lunch, and dinner",
    meals: ["Breakfast", "Lunch", "Dinner"],
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    status: "active",
  },
  payments: [
    {
      id: "1",
      description: "Monthly Fee",
      amount: "₹25,000",
      date: "12 Oct 2024",
      dueDate: "12 Jan 2025",
      status: "paid",
    },
  ],
  complaints: [
    {
      id: "1",
      title: "Room Maintenance",
      category: "Room",
      date: "2 hours ago",
      status: "pending",
      priority: "high",
    },
    {
      id: "2",
      title: "Food Quality",
      category: "Food",
      date: "Yesterday",
      status: "in-progress",
      priority: "medium",
    },
  ],
  notifications: [
    {
      id: "1",
      title: "Maintenance Notice",
      message: "Water supply will be interrupted from 10 AM to 2 PM tomorrow.",
      date: "2 hours ago",
      type: "info",
    },
    {
      id: "2",
      title: "Room Inspection",
      message: "Monthly room inspection scheduled for tomorrow at 11 AM.",
      date: "Yesterday",
      type: "warning",
    },
  ],
};

// Mock data for staff dashboard
const STAFF_MOCK_DATA: StaffDashboardData = {
  occupancy: {
    total: 100,
    occupied: 85,
    vacant: 12,
    maintenance: 3,
  },
  students: {
    total: 150,
    newAdmissions: 12,
    checkouts: 5,
  },
  complaints: {
    total: 25,
    pending: 8,
    inProgress: 10,
    resolved: 7,
  },
  meals: {
    breakfast: 120,
    lunch: 135,
    dinner: 142,
  },
  payments: {
    collected: "₹3,75,000",
    pending: "₹45,000",
    overdue: "₹15,000",
  },
  notifications: [
    {
      id: "1",
      title: "System Maintenance",
      message: "System will be down for maintenance from 2 AM to 4 AM.",
      date: "1 hour ago",
      type: "info",
    },
    {
      id: "2",
      title: "Staff Meeting",
      message: "Monthly staff meeting scheduled for tomorrow at 10 AM.",
      date: "Yesterday",
      type: "warning",
    },
  ],
  recentActivities: [
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
  ],
};

// Dashboard card component
function DashboardCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentDashboardData | null>(
    null
  );
  const [staffData, setStaffData] = useState<StaffDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (user?.role === "student") {
          const data = await dashboardService.getStudentDashboard();
          setStudentData(data);
        } else if (user?.role === "staff") {
          const data = await dashboardService.getStaffDashboard();
          setStaffData(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");

        // Fallback to mock data if fetch fails
        if (user?.role === "student") {
          setStudentData(STUDENT_MOCK_DATA);
        } else if (user?.role === "staff") {
          setStaffData(STAFF_MOCK_DATA);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    redirect("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">
            Error Loading Dashboard
          </h2>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use mock data as fallback if real data is not available
  const displayStudentData = studentData || STUDENT_MOCK_DATA;
  const displayStaffData = staffData || STAFF_MOCK_DATA;


  console.log(displayStaffData)


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening in your{" "}
          {user?.role === "student" ? "hostel account" : "hostel dashboard"}.
        </p>
      </div>

      {user?.role === "student" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Room Information"
              icon={<Home className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-2">
                <p className="text-2xl font-bold">
                  {displayStudentData.room?.roomNumber || "Not Assigned"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayStudentData.room?.type || "N/A"} |{" "}
                  {displayStudentData.room?.floor || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Checkout:{" "}
                  {displayStudentData.room?.endDate
                    ? new Date(
                        displayStudentData.room.endDate
                      ).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
                <p className="text-xs">
                  <Link href="/dashboard/rooms" className="text-primary hover:underline">
                    View Details
                  </Link>
                </p>
              </div>
            </DashboardCard>
            <DashboardCard
              title="Meal Plan"
              icon={<Utensils className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-2">
                <p className="text-2xl font-bold">
                  {displayStudentData.mealPlan?.name || "Not Subscribed"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayStudentData.mealPlan?.description ||
                    "No meal plan active"}
                </p>
                {displayStudentData.mealPlan?.meals && (
                  <p className="text-xs text-muted-foreground">
                    Includes: {displayStudentData.mealPlan.meals.join(", ")}
                  </p>
                )}
                <p className="text-xs">
                  <Link href="/dashboard/meals" className="text-primary hover:underline">
                    View Details
                  </Link>
                </p>
              </div>
            </DashboardCard>
            <DashboardCard
              title="Payments"
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-2">
                <p className="text-2xl font-bold">
                  {displayStudentData.payments &&
                  displayStudentData.payments.length > 0
                    ? displayStudentData.payments[0].amount
                    : "No Payments"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayStudentData.payments &&
                  displayStudentData.payments.length > 0
                    ? `Last Payment: ${displayStudentData.payments[0].date}`
                    : "No recent payments"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayStudentData.payments &&
                  displayStudentData.payments.length > 0 &&
                  displayStudentData.payments[0].dueDate
                    ? `Next Due: ${displayStudentData.payments[0].dueDate}`
                    : "No upcoming payments"}
                </p>
                <p className="text-xs">
                  <Link
                    href="/dashboard/payments"
                    className="text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </p>
              </div>
            </DashboardCard>
            <DashboardCard
              title="Complaints"
              icon={<InfoIcon className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-2">
                <p className="text-2xl font-bold">
                  {displayStudentData.complaints
                    ? displayStudentData.complaints.filter(
                        (c) =>
                          c.status === "pending" || c.status === "in-progress"
                      ).length
                    : 0}{" "}
                  Active
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayStudentData.complaints
                    ? displayStudentData.complaints.filter(
                        (c) => c.status === "resolved" || c.status === "closed"
                      ).length
                    : 0}{" "}
                  Resolved
                </p>
                <p className="text-xs">
                  <Link
                    href="/dashboard/complaints"
                    className="text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </p>
              </div>
            </DashboardCard>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Your recent payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayStudentData.payments &&
                  displayStudentData.payments.length > 0 ? (
                    displayStudentData.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between space-x-4"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {payment.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.date}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              payment.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            )}
                          >
                            {payment.status}
                          </span>
                          <span className="text-sm font-medium">
                            {payment.amount}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No payment records found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Recent updates and announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayStudentData.notifications &&
                  displayStudentData.notifications.length > 0 ? (
                    displayStudentData.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start space-x-4 rounded-md border p-4"
                      >
                        <div
                          className={cn(
                            "mt-0.5 rounded-full p-1",
                            notification.type === "warning"
                              ? "bg-yellow-100"
                              : notification.type === "error"
                              ? "bg-red-100"
                              : notification.type === "success"
                              ? "bg-green-100"
                              : "bg-blue-100"
                          )}
                        >
                          {notification.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          ) : notification.type === "error" ? (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          ) : notification.type === "success" ? (
                            <InfoIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <InfoIcon className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.date}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No notifications at this time.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Complaints</CardTitle>
                <CardDescription>
                  Status of your recent complaints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayStudentData.complaints &&
                  displayStudentData.complaints.length > 0 ? (
                    displayStudentData.complaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="flex items-center justify-between space-x-4"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {complaint.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {complaint.category} • {complaint.date}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              complaint.status === "resolved" ||
                                complaint.status === "closed"
                                ? "bg-green-100 text-green-800"
                                : complaint.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {complaint.status}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              complaint.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : complaint.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            )}
                          >
                            {complaint.priority}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No complaints found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        // Staff dashboard
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Occupancy"
              icon={<Bed className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {displayStaffData.occupancy.occupied}/
                  {displayStaffData.occupancy.total}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayStaffData.occupancy.vacant} Vacant |{" "}
                  {displayStaffData.occupancy.maintenance} Maintenance
                </p>
                <p className="text-xs">
                  <Link href="/dashboard/room" className="text-primary hover:underline">
                    View all rooms
                  </Link>
                </p>
              </div>
            </DashboardCard>
            <DashboardCard
              title="Students"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {displayStaffData.students.total}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayStaffData.students.newAdmissions} New |{" "}
                  {displayStaffData.students.checkouts} Checkouts
                </p>
                <p className="text-xs">
                  <Link
                    href="/dashboard/students"
                    className="text-primary hover:underline"
                  >
                    View all students
                  </Link>
                </p>
              </div>
            </DashboardCard>
            <DashboardCard
              title="Complaints"
              icon={<BadgeAlert className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {displayStaffData.complaints.pending} Pending
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayStaffData.complaints.inProgress} In Progress |{" "}
                  {displayStaffData.complaints.resolved} Resolved
                </p>
                <p className="text-xs">
                  <Link
                    href="/dashboard/complaints"
                    className="text-primary hover:underline"
                  >
                    View all complaints
                  </Link>
                </p>
              </div>
            </DashboardCard>
            <DashboardCard
              title="Payments"
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {displayStaffData.payments.collected}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayStaffData.payments.pending} Pending |{" "}
                  {displayStaffData.payments.overdue} Overdue
                </p>
                <p className="text-xs">
                  <Link
                    href="/dashboard/payments"
                    className="text-primary hover:underline"
                  >
                    View all payments
                  </Link>
                </p>
              </div>
            </DashboardCard>
          </div>

          {/* Students Without Room Table */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Students Without Room</CardTitle>
                <CardDescription>
                  List of students currently not assigned to any room
                </CardDescription>
              </CardHeader>
              <CardContent>
                {displayStaffData.studentsWithoutRoom && displayStaffData.studentsWithoutRoom.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent divide-y  divide-gray-200">
                        {displayStaffData.studentsWithoutRoom.map((student) => (
                          <tr key={student.studentId || student.name}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{student.studentId || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{student.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All students are assigned to rooms.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
