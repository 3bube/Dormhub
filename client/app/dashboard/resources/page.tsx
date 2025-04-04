"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  ShoppingCart,
  Clipboard,
  BoxesIcon,
  Bed,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Mock data for resources
const STUDENT_RESOURCES_DATA = {
  requests: [
    {
      id: "r1",
      item: "Study Lamp",
      reason: "Current lamp is not working properly",
      status: "Approved",
      requestDate: "8 Oct 2024",
      deliveryDate: "11 Oct 2024",
    },
    {
      id: "r2",
      item: "Mattress Replacement",
      reason: "Current mattress is damaged",
      status: "In Progress",
      requestDate: "10 Oct 2024",
      deliveryDate: "Pending",
    },
    {
      id: "r3",
      item: "Room Cleaning Kit",
      reason: "Need cleaning supplies",
      status: "Delivered",
      requestDate: "5 Oct 2024",
      deliveryDate: "7 Oct 2024",
    },
    {
      id: "r4",
      item: "Extra Blanket",
      reason: "Weather is getting cold",
      status: "Denied",
      requestDate: "6 Oct 2024",
      deliveryDate: "N/A",
    },
  ],
  inventory: [
    {
      id: "i1",
      item: "Study Desk",
      condition: "Good",
      dateProvided: "15 Sep 2024",
    },
    {
      id: "i2",
      item: "Chair",
      condition: "Good",
      dateProvided: "15 Sep 2024",
    },
    {
      id: "i3",
      item: "Bed Frame",
      condition: "Good",
      dateProvided: "15 Sep 2024",
    },
    {
      id: "i4",
      item: "Mattress",
      condition: "Needs Replacement",
      dateProvided: "15 Sep 2024",
    },
    {
      id: "i5",
      item: "Wardrobe",
      condition: "Good",
      dateProvided: "15 Sep 2024",
    },
    {
      id: "i6",
      item: "Study Lamp",
      condition: "Not Working",
      dateProvided: "15 Sep 2024",
    },
  ],
};

const STAFF_RESOURCES_DATA = {
  pendingRequests: [
    {
      id: "r1",
      studentName: "John Student",
      roomNumber: "A-101",
      item: "Study Lamp",
      reason: "Current lamp is not working properly",
      status: "Pending",
      requestDate: "12 Oct 2024",
    },
    {
      id: "r2",
      studentName: "Sarah Johnson",
      roomNumber: "B-205",
      item: "Chair Replacement",
      reason: "Chair is broken",
      status: "Pending",
      requestDate: "11 Oct 2024",
    },
  ],
  approvedRequests: [
    {
      id: "r3",
      studentName: "Michael Brown",
      roomNumber: "C-103",
      item: "Mattress Replacement",
      reason: "Current mattress is damaged",
      status: "In Progress",
      requestDate: "10 Oct 2024",
      approvedDate: "11 Oct 2024",
    },
    {
      id: "r4",
      studentName: "Emily Davis",
      roomNumber: "A-205",
      item: "Room Cleaning Kit",
      reason: "Need cleaning supplies",
      status: "Delivered",
      requestDate: "5 Oct 2024",
      approvedDate: "6 Oct 2024",
      deliveryDate: "7 Oct 2024",
    },
  ],
  inventory: {
    summary: {
      total: 1250,
      inUse: 1120,
      available: 130,
      needsRepair: 45,
    },
    lowStock: [
      {
        id: "ls1",
        item: "Study Lamps",
        available: 5,
        threshold: 10,
      },
      {
        id: "ls2",
        item: "Mattresses",
        available: 3,
        threshold: 15,
      },
      {
        id: "ls3",
        item: "Chairs",
        available: 8,
        threshold: 20,
      },
    ],
  },
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Approved":
      return (
        <Badge variant="secondary">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
        </Badge>
      );
    case "In Progress":
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" /> In Progress
        </Badge>
      );
    case "Delivered":
      return (
        <Badge variant="default">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Delivered
        </Badge>
      );
    case "Denied":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" /> Denied
        </Badge>
      );
    case "Pending":
      return (
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper function to get condition badge
const getConditionBadge = (condition: string) => {
  switch (condition) {
    case "Good":
      return (
        <Badge variant="default">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Good
        </Badge>
      );
    case "Needs Replacement":
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" /> Needs Replacement
        </Badge>
      );
    case "Not Working":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" /> Not Working
        </Badge>
      );
    default:
      return <Badge variant="outline">{condition}</Badge>;
  }
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const studentData = STUDENT_RESOURCES_DATA;
  const staffData = STAFF_RESOURCES_DATA;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Resource Management
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "student"
            ? "Request resources and view your inventory"
            : "Manage hostel resources and inventory"}
        </p>
      </div>

      {user?.role === "student" ? (
        <StudentResourcesView data={studentData} />
      ) : (
        <StaffResourcesView data={staffData} />
      )}
    </div>
  );
}

function StudentResourcesView({
  data,
}: {
  data: typeof STUDENT_RESOURCES_DATA;
}) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="inventory">Room Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6 space-y-6">
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/dashboard/resources/request">New Request</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resource Requests</CardTitle>
              <CardDescription>
                Track the status of your resource requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.requests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.item}
                        </TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>{request.deliveryDate}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link
                              href={`/dashboard/resources/requests/${request.id}`}
                            >
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <Package className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No resource requests found.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Resources</CardTitle>
              <CardDescription>Resources that can be requested</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Study Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li>Study Lamp</li>
                      <li>Desk Organizer</li>
                      <li>Bookshelf</li>
                      <li>Whiteboard</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href="/dashboard/resources/request?category=study">
                        Request
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Room Furniture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li>Chair</li>
                      <li>Mattress</li>
                      <li>Bed Frame</li>
                      <li>Wardrobe</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href="/dashboard/resources/request?category=furniture">
                        Request
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cleaning Supplies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li>Room Cleaning Kit</li>
                      <li>Dustbin</li>
                      <li>Broom & Dustpan</li>
                      <li>Cleaning Cloths</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href="/dashboard/resources/request?category=cleaning">
                        Request
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Inventory</CardTitle>
              <CardDescription>
                Items currently assigned to your room
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.inventory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Date Provided</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.item}
                        </TableCell>
                        <TableCell>
                          {getConditionBadge(item.condition)}
                        </TableCell>
                        <TableCell>{item.dateProvided}</TableCell>
                        <TableCell className="text-right">
                          {item.condition !== "Good" && (
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/dashboard/resources/request?item=${item.item}`}
                              >
                                Request Replacement
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <Package className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No inventory items found.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                <p>
                  If any item is missing or damaged, please submit a request for
                  replacement.
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StaffResourcesView({ data }: { data: typeof STAFF_RESOURCES_DATA }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.inventory.summary.total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.inventory.summary.inUse}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.inventory.summary.available}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Needs Repair</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.inventory.summary.needsRepair}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="approved">Approved Requests</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Pending Resource Requests</CardTitle>
                  <CardDescription>Requests awaiting approval</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.pendingRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>{request.roomNumber}</TableCell>
                        <TableCell className="font-medium">
                          {request.item}
                        </TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              Deny
                            </Button>
                            <Button size="sm">Approve</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600 mb-4" />
                  <p className="text-muted-foreground">No pending requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Approved Requests</CardTitle>
                  <CardDescription>
                    Requests that have been approved
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.approvedRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.approvedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>{request.roomNumber}</TableCell>
                        <TableCell className="font-medium">
                          {request.item}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>{request.approvedDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {request.status === "In Progress" ? (
                              <Button size="sm">Mark Delivered</Button>
                            ) : (
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <Package className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No approved requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6 space-y-6">
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/resources/inventory/export">
                Export Inventory
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/resources/inventory/add">
                Add Inventory
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>Items that need to be restocked</CardDescription>
            </CardHeader>
            <CardContent>
              {data.inventory.lowStock.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.inventory.lowStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.item}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {item.available}
                        </TableCell>
                        <TableCell>{item.threshold}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm">Order More</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600 mb-4" />
                  <p className="text-muted-foreground">No low stock items.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common inventory management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/dashboard/resources/inventory/audit">
                    <Clipboard className="mr-2 h-4 w-4" />
                    Conduct Inventory Audit
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/dashboard/resources/inventory/maintenance">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Schedule Maintenance
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/dashboard/resources/inventory/orders">
                    <BoxesIcon className="mr-2 h-4 w-4" />
                    View Purchase Orders
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Categories</CardTitle>
                <CardDescription>Browse inventory by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 justify-start"
                  >
                    <Link href="/dashboard/resources/inventory/furniture">
                      <div className="flex flex-col items-center justify-center w-full">
                        <Bed className="h-6 w-6 mb-2" />
                        <span>Furniture</span>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 justify-start"
                  >
                    <Link href="/dashboard/resources/inventory/electronics">
                      <div className="flex flex-col items-center justify-center w-full">
                        <Package className="h-6 w-6 mb-2" />
                        <span>Electronics</span>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 justify-start"
                  >
                    <Link href="/dashboard/resources/inventory/cleaning">
                      <div className="flex flex-col items-center justify-center w-full">
                        <Package className="h-6 w-6 mb-2" />
                        <span>Cleaning</span>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 justify-start"
                  >
                    <Link href="/dashboard/resources/inventory/other">
                      <div className="flex flex-col items-center justify-center w-full">
                        <Package className="h-6 w-6 mb-2" />
                        <span>Other</span>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
