"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Home,
  Users,
  DoorOpen,
  Wrench,
  UserPlus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import roomService, {
  RoomDashboardData,
  StudentRoomData,
} from "@/services/RoomService";
import { toast } from "sonner";

// Mock data for room management
const STUDENT_ROOM_DATA: StudentRoomData = {
  current: {
    roomNumber: "A-101",
    type: "Double Sharing",
    floor: "1st Floor",
    checkin: "15 Sep 2024",
    checkout: "15 Dec 2025",
    amenities: [
      "Wi-Fi",
      "Attached Bathroom",
      "Study Table",
      "Wardrobe",
      "Hot Water",
    ],
    roommates: [
      {
        id: "rm1",
        name: "John Smith",
        course: "Computer Science",
        year: "2nd Year",
      },
    ],
    issues: [
      {
        id: "i1",
        title: "Leaking tap in bathroom",
        status: "in-progress",
        reportedOn: "15 Sep 2024",
      },
    ],
  },
  history: [
    {
      id: "h1",
      roomNumber: "B-202",
      type: "Triple Sharing",
      period: "Aug 2023 - May 2024",
    },
  ],
};

// Mock data for staff room management
const STAFF_ROOM_DATA: RoomDashboardData = {
  summary: {
    total: 100,
    occupied: 75,
    vacant: 20,
    maintenance: 5,
  },
  occupancyRate: 75,
  rooms: [
    {
      _id: "r1",
      id: "r1",
      roomNumber: "A-101",
      floor: "1st Floor",
      type: "Double Sharing",
      capacity: 2,
      occupied: 2,
      status: "full",
      amenities: ["Wi-Fi", "Attached Bathroom", "Study Table"],
    },
    {
      _id: "r2",
      id: "r2",
      roomNumber: "A-102",
      floor: "1st Floor",
      type: "Single",
      capacity: 1,
      occupied: 0,
      status: "available",
      amenities: ["Wi-Fi", "Shared Bathroom", "Study Table"],
    },
    {
      _id: "r3",
      id: "r3",
      roomNumber: "B-201",
      floor: "2nd Floor",
      type: "Triple Sharing",
      capacity: 3,
      occupied: 1,
      status: "available",
      amenities: ["Wi-Fi", "Attached Bathroom", "Study Table"],
    },
  ],
  recentAllocations: [
    {
      id: "a1",
      roomNumber: "A-101",
      type: "Double Sharing",
      studentName: "John Smith",
      date: "15 Sep 2024",
    },
    {
      id: "a2",
      roomNumber: "B-201",
      type: "Triple Sharing",
      studentName: "Jane Doe",
      date: "12 Sep 2024",
    },
  ],
  pendingRequests: [
    {
      id: "m1",
      roomNumber: "A-103",
      issue: "Broken window",
      status: "pending",
      reportedOn: "10 Sep 2024",
    },
    {
      id: "m2",
      roomNumber: "B-202",
      issue: "AC not working",
      status: "in-progress",
      reportedOn: "05 Sep 2024",
    },
  ],
};

// Get status badge based on room status
function getRoomStatusBadge(status: string) {
  switch (status) {
    case "Occupied":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Occupied
        </Badge>
      );
    case "Partially Occupied":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" />
          Partially Occupied
        </Badge>
      );
    case "Vacant":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <XCircle className="mr-1 h-3 w-3" />
          Vacant
        </Badge>
      );
    case "Maintenance":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertCircle className="mr-1 h-3 w-3" />
          Maintenance
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function RoomManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentRoomData | null>(null);
  const [staffData, setStaffData] = useState<RoomDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user?.role === "student") {
          const data = await roomService.getStudentRoomData();

          console.log("student data", data);
          setStudentData(data);
        } else {
          const data = await roomService.getRoomDashboardData();
          setStaffData(data);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
        setError("Failed to load room data. Please try again later.");

        // Fallback to mock data if fetch fails
        if (user?.role === "student") {
          setStudentData(STUDENT_ROOM_DATA as StudentRoomData);
        } else {
          setStaffData(STAFF_ROOM_DATA);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRoomData();
    }
  }, [user]);

  // Display loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading room data...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">
            Error Loading Room Data
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
  const displayStudentData =
    studentData || (STUDENT_ROOM_DATA as StudentRoomData);
  const displayStaffData = staffData || STAFF_ROOM_DATA;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
        <p className="text-muted-foreground">
          {user?.role === "student"
            ? "View your room details and history"
            : "Manage hostel rooms and allocations"}
        </p>
      </div>

      {user?.role === "student" ? (
        <StudentRoomView data={displayStudentData} />
      ) : (
        <StaffRoomView data={displayStaffData} />
      )}
    </div>
  );
}

function StudentRoomView({ data }: { data: StudentRoomData }) {
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issuePriority, setIssuePriority] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle reporting a new room issue
  const handleSubmitIssue = async () => {
    if (!issueType || !issueDescription || !issuePriority) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // Get the room number from the current room data
      const roomNumber = data.current.roomNumber;

      await roomService.createMaintenanceRequest(
        roomNumber,
        issueType,
        issueDescription,
        issuePriority
      );

      toast.success("Issue reported successfully");
      setReportIssueModalOpen(false);
      setIssueType("");
      setIssueDescription("");
      setIssuePriority("");

      // Refresh the page to show the new issue
      window.location.reload();
    } catch (error) {
      console.error("Report issue error:", error);
      toast.error("Failed to report issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(data);

  return (
    <div className="grid gap-4 md:grid-cols-2 ">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Your Current Room</CardTitle>
          <CardDescription>
            Details about your current hostel room
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {data.current.roomNumber}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.current.type}, {data.current.floor}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Check-in Date</p>
                <p className="text-sm text-muted-foreground">
                  {data.current.checkin}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Check-out Date</p>
                <p className="text-sm text-muted-foreground">
                  {data.current.checkout}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Amenities</h3>
              <ul className="space-y-1 text-sm">
                {data.current.amenities.map((amenity, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Roommate(s)</h3>
              {data.current.roommates.length > 0 ? (
                data.current.roommates.map((roommate) => (
                  <div key={roommate.id} className="border rounded-md p-3 mb-2">
                    <p className="font-medium">{roommate.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {roommate.course}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {roommate.year}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No roommates assigned
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Room Issues</h3>
            {data.current.issues.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.current.issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>{issue.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{issue.status}</Badge>
                      </TableCell>
                      <TableCell>{issue.reportedOn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active issues reported.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Button
            onClick={() => setReportIssueModalOpen(true)}
            variant="outline"
          >
            Report Issue
          </Button> */}
          {/* <Button asChild>
            <Link href="/dashboard/room/request-change">
              Request Room Change
            </Link>
          </Button> */}
        </CardFooter>
      </Card>
      {/* 
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Room History</CardTitle>
          <CardDescription>Your previous room allocations</CardDescription>
        </CardHeader>
        <CardContent>
          {data.history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.history.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>{room.roomNumber}</TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>{room.period}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No previous room history.
            </p>
          )}
        </CardContent>
      </Card> */}

      {/* Report Issue Modal */}
      {reportIssueModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Report Room Issue</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Issue Type</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Network">Network</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Please describe the issue in detail..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  value={issuePriority}
                  onChange={(e) => setIssuePriority(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                onClick={() => setReportIssueModalOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitIssue} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Issue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffRoomView({ data }: { data: RoomDashboardData }) {
  console.log(data);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Room Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Home className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{data.summary.occupied}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vacant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DoorOpen className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{data.summary.vacant}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Under Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wrench className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {data.summary.maintenance}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Rate and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
            <CardDescription>Current room occupancy percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative h-40 w-40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold">
                    {data.occupancyRate}%
                  </div>
                </div>
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted-foreground/20"
                    cx="50"
                    cy="50"
                    r="40"
                    pathLength="100"
                    strokeWidth="10"
                    fill="none"
                    stroke="currentColor"
                  />
                  <circle
                    className="text-primary"
                    cx="50"
                    cy="50"
                    r="40"
                    pathLength="100"
                    strokeWidth="10"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="100"
                    strokeDashoffset={100 - data.occupancyRate}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Perform common room management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/room/maintenance">
                  <Wrench className="mr-2 h-4 w-4" />
                  Maintenance Request
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard/room/allocate">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Allocate Room
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room List */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Room List</CardTitle>
            <CardDescription>Manage all hostel rooms</CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/room/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Room
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Occupied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rooms.map((room) => (
                <TableRow key={room._id}>
                  <TableCell className="font-medium">
                    {room.roomNumber}
                  </TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.occupied || 0}</TableCell>
                  <TableCell>{getRoomStatusBadge(room.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/room/${room._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Allocations and Pending Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Allocations</CardTitle>
            <CardDescription>Recently allocated rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAllocations.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell className="font-medium">
                      {allocation.roomNumber} ({allocation.type})
                    </TableCell>
                    <TableCell>{allocation.studentName}</TableCell>
                    <TableCell>{allocation.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>
              Maintenance requests awaiting action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.roomNumber}
                    </TableCell>
                    <TableCell>{request.issue}</TableCell>
                    <TableCell>
                      {request.status === "Pending" ? (
                        <Badge variant="outline">Pending</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">
                          In Progress
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{request.reportedOn}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
