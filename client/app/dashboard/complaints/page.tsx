"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Clock, AlertCircle, Search } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import complaintService, {
  Complaint,
  ComplaintsData,
} from "@/services/ComplaintService";

// Mock data for complaints
const STUDENT_COMPLAINTS_DATA = {
  complaints: [
    {
      id: "c1",
      title: "Flickering Light in Room",
      category: "Electrical",
      description:
        "The main light in my room has been flickering for the past two days.",
      status: "In Progress",
      priority: "Medium",
      createdAt: "10 Oct 2024",
      assignedTo: "Maintenance Team",
      responses: [
        {
          id: "r1",
          responder: "John Maintenance",
          message: "We'll check this issue tomorrow morning.",
          timestamp: "11 Oct 2024, 10:30 AM",
        },
      ],
    },
    {
      id: "c2",
      title: "Water Leakage from Bathroom",
      category: "Plumbing",
      description: "There's water leaking from the bathroom sink pipe.",
      status: "Resolved",
      priority: "High",
      createdAt: "5 Oct 2024",
      assignedTo: "Maintenance Team",
      responses: [
        {
          id: "r1",
          responder: "John Maintenance",
          message: "We'll check this issue immediately.",
          timestamp: "5 Oct 2024, 2:30 PM",
        },
        {
          id: "r2",
          responder: "John Maintenance",
          message:
            "The issue has been fixed. The pipe was loose and has been tightened.",
          timestamp: "5 Oct 2024, 4:45 PM",
        },
      ],
    },
    {
      id: "c3",
      title: "Wi-Fi Not Working",
      category: "Network",
      description:
        "The Wi-Fi in my room is not working since yesterday evening.",
      status: "Pending",
      priority: "High",
      createdAt: "11 Oct 2024",
      assignedTo: "IT Support",
      responses: [],
    },
    {
      id: "c4",
      title: "Room Cleaning Issue",
      category: "Housekeeping",
      description: "My room wasn't cleaned yesterday as per schedule.",
      status: "Resolved",
      priority: "Low",
      createdAt: "8 Oct 2024",
      assignedTo: "Housekeeping Team",
      responses: [
        {
          id: "r1",
          responder: "Housekeeping Manager",
          message:
            "We apologize for the inconvenience. Your room will be cleaned today.",
          timestamp: "9 Oct 2024, 9:15 AM",
        },
      ],
    },
    {
      id: "c5",
      title: "Noisy Neighbors",
      category: "Resident Issue",
      description:
        "The residents in the next room are making too much noise late at night.",
      status: "In Progress",
      priority: "Medium",
      createdAt: "9 Oct 2024",
      assignedTo: "Warden",
      responses: [
        {
          id: "r1",
          responder: "Hostel Warden",
          message: "We'll speak to the residents concerned.",
          timestamp: "10 Oct 2024, 11:00 AM",
        },
      ],
    },
  ],
  stats: {
    total: 5,
    pending: 1,
    inProgress: 2,
    resolved: 2,
  },
};

const STAFF_COMPLAINTS_DATA = {
  complaints: [
    ...STUDENT_COMPLAINTS_DATA.complaints,
    {
      id: "c6",
      title: "Broken Window",
      category: "Maintenance",
      description: "The window in room B-204 is broken and needs replacement.",
      status: "Pending",
      priority: "High",
      createdAt: "11 Oct 2024",
      studentName: "David Smith",
      roomNumber: "B-204",
      responses: [],
    },
    {
      id: "c7",
      title: "Food Quality Issue",
      category: "Mess",
      description:
        "Several students have complained about yesterday's dinner quality.",
      status: "In Progress",
      priority: "High",
      createdAt: "10 Oct 2024",
      studentName: "Student Council",
      roomNumber: "N/A",
      responses: [
        {
          id: "r1",
          responder: "Mess Manager",
          message:
            "We're investigating this issue and will improve the quality.",
          timestamp: "11 Oct 2024, 10:00 AM",
        },
      ],
    },
  ],
  stats: {
    total: 7,
    pending: 2,
    inProgress: 3,
    resolved: 2,
  },
  categories: {
    Electrical: 1,
    Plumbing: 1,
    Network: 1,
    Housekeeping: 1,
    "Resident Issue": 1,
    Maintenance: 1,
    Mess: 1,
  },
};

// Helper function to get badge for complaint status
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Resolved":
      return (
        <Badge variant="default">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Resolved
        </Badge>
      );
    case "In Progress":
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" /> In Progress
        </Badge>
      );
    case "Pending":
      return (
        <Badge variant="outline">
          <AlertCircle className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper function to get badge for complaint priority
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "High":
      return <Badge variant="destructive">High</Badge>;
    case "Medium":
      return <Badge variant="secondary">Medium</Badge>;
    case "Low":
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaintsData, setComplaintsData] = useState<ComplaintsData | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch complaints data
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        let data;

        if (user?.role === "staff") {
          data = await complaintService.getAllComplaints();
        } else {
          data = await complaintService.getUserComplaints();
        }

        setComplaintsData(data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        // Fallback to mock data
        setComplaintsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user]);

  // Filter complaints based on search term and filters
  const filteredComplaints = complaintsData?.filter((complaint) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      complaint.status.toLowerCase() === statusFilter.toLowerCase();

    // Category filter
    const matchesCategory =
      categoryFilter === "all" ||
      complaint.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories from complaints
  const categories = [
    ...new Set(complaintsData?.complaints?.map((c) => c.category) || []),
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Complaints Management
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "student"
            ? "Submit and track your complaints"
            : "Manage and respond to student complaints"}
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {complaintsData?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {complaintsData?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {complaintsData?.status === "in-progress" ? 1 : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {complaintsData?.status === "resolved" ? 1 : 0}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/dashboard/complaints/new">New Complaint</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint List</CardTitle>
          <CardDescription>
            {user?.role === "student"
              ? "View and track your submitted complaints"
              : "Manage and respond to student complaints"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Loading complaints...
                </p>
              </div>
            </div>
          ) : filteredComplaints ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    {user?.role === "staff" && <TableHead>Student</TableHead>}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredComplaints as Complaint[]).map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">
                        {complaint.title}
                      </TableCell>
                      <TableCell>{complaint.category}</TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell>
                        {getPriorityBadge(complaint.priority)}
                      </TableCell>
                      <TableCell>{complaint.createdAt}</TableCell>
                      {user?.role === "staff" && (
                        <TableCell>{complaint.studentName}</TableCell>
                      )}
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/complaints/${complaint.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-muted p-3">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                No complaints found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                {searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : user?.role === "student"
                  ? "You haven't submitted any complaints yet"
                  : "There are no complaints in the system"}
              </p>
              {user?.role === "student" && (
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/complaints/new">
                    Submit a Complaint
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
