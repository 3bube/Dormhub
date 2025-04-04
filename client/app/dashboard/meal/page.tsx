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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import mealService, {
  StaffMealDashboardData,
  StudentMealDashboardData,
} from "@/services/MealService";

// MealManagementPage component
export default function MealManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState<StaffMealDashboardData | null>(
    null
  );
  const [studentData, setStudentData] =
    useState<StudentMealDashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.role === "staff") {
          // Fetch staff dashboard data
          const data = await mealService.getStaffMealDashboardData();
          setStaffData(data);
        } else if (user?._id) {
          // Fetch student dashboard data
          const data = await mealService.getStudentMealDashboardData(user._id);
          setStudentData(data);
        }
      } catch (error) {
        console.error("Error fetching meal data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading meal data...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch the latest information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Management</h1>
          <p className="text-muted-foreground">
            View and manage meal plans, schedules, and attendance
          </p>
        </div>
        {user?.role === "staff" && (
          <div className="flex gap-2">
            <Link href="/dashboard/meal/create">
              <Button>Create Meal</Button>
            </Link>
            <Link href="/dashboard/meal/plan">
              <Button variant="outline">Manage Meal Plans</Button>
            </Link>
          </div>
        )}
      </div>

      {user?.role === "staff" && staffData && (
        <StaffMealView data={staffData} />
      )}
      {user?.role === "student" && studentData && (
        <StudentMealView data={studentData} />
      )}
    </div>
  );
}

// StudentMealView component
function StudentMealView({ data }: { data: StudentMealDashboardData }) {
  return (
    <div className="space-y-6 w-full">
      {/* Today's Meals */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Meals - {data.today.date}</CardTitle>
          <CardDescription>
            {data.today.day}&apos;s meal schedule and your attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.today.meals.map((meal: any) => (
              <Card key={meal.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{meal.type}</CardTitle>
                  <CardDescription>{meal.time}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium">Menu</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {meal.menu.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center space-x-2 text-sm">
                    {meal.attended ? (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Attended
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" /> Not Yet
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule & Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Meal Schedule</CardTitle>
            <CardDescription>
              Plan your week with our meal schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Breakfast</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Dinner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.weeklySchedule.map((day: any) => (
                  <TableRow key={day.id}>
                    <TableCell className="font-medium">{day.day}</TableCell>
                    <TableCell>{day.breakfast}</TableCell>
                    <TableCell>{day.lunch}</TableCell>
                    <TableCell>{day.dinner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Meal Attendance</CardTitle>
            <CardDescription>
              Statistics for this month&apos;s meal attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Attended
                  </h4>
                  <p className="text-2xl font-bold">
                    {data.attendance.thisMonth.attended}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Missed
                  </h4>
                  <p className="text-2xl font-bold">
                    {data.attendance.thisMonth.missed}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Percentage
                  </h4>
                  <p className="text-2xl font-bold">
                    {data.attendance.thisMonth.percentage}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium">Dietary Preferences</h4>
                  <p className="text-muted-foreground">
                    {data.attendance.dietaryPreferences}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Special Requests</h4>
                  <p className="text-muted-foreground">
                    {data.attendance.specialRequests}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/dashboard/meal/preferences">
                  <Button variant="outline" size="sm">
                    Update Preferences
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// StaffMealView component
function StaffMealView({ data }: { data: StaffMealDashboardData }) {
  return (
    <div className="space-y-6 w-full">
      <Tabs defaultValue="today">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today&apos;s Meals</TabsTrigger>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          {/* <TabsTrigger value="stats">Statistics</TabsTrigger> */}
        </TabsList>

        {/* Today's Meals Tab */}
        <TabsContent value="today" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {data.today.date} - {data.today.day}
              </h2>
              <p className="text-muted-foreground">
                Manage today&apos;s meals and attendance
              </p>
            </div>
            <Link href="/dashboard/meal/attendance">
              <Button>Record Attendance</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.today.meals.map((meal) => (
              <Card key={meal.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{meal.type}</CardTitle>
                      <CardDescription>{meal.time}</CardDescription>
                    </div>
                    <Badge
                      className={
                        meal.status === "Completed"
                          ? "bg-green-500"
                          : meal.status === "In Progress"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }
                    >
                      {meal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium">Menu</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {meal.menu.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Attendance</h4>
                      <p
                        className={`text-lg font-bold ${
                          parseFloat(meal.attendance) > 80
                            ? "text-green-600"
                            : parseFloat(meal.attendance) > 50
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {meal.attendance}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/meal/edit/${meal.id}`}>
                      <Button variant="outline" size="sm">
                        Edit Menu
                      </Button>
                    </Link>
                    <Link href={`/dashboard/meal/attendance/${meal.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Weekly Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Meal Schedule</CardTitle>
              <CardDescription>
                Manage and update the weekly meal schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Day</TableHead>
                      <TableHead>Breakfast</TableHead>
                      <TableHead>Lunch</TableHead>
                      <TableHead>Dinner</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.weeklySchedule.map((day) => (
                      <TableRow key={day.id}>
                        <TableCell className="font-medium">{day.day}</TableCell>
                        <TableCell>{day.breakfast}</TableCell>
                        <TableCell>{day.lunch}</TableCell>
                        <TableCell>{day.dinner}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/meal/schedule/${day.id}`}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Default</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Meal Statistics</CardTitle>
                <CardDescription>
                  Overview of meal attendance and popularity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Average Attendance
                    </h3>
                    <p className="text-3xl font-bold">
                      {data.stats.averageAttendance}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <h3 className="font-medium text-sm text-muted-foreground">
                        Most Popular
                      </h3>
                      <p className="text-xl font-bold">
                        {data.stats.mostPopularMeal}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <h3 className="font-medium text-sm text-muted-foreground">
                        Least Popular
                      </h3>
                      <p className="text-xl font-bold">
                        {data.stats.leastPopularMeal}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dietary Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Dietary Requirements</CardTitle>
                <CardDescription>
                  Special dietary needs and requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Vegetarian
                      </h4>
                      <p className="text-2xl font-bold">
                        {data.stats.specialDiets.vegetarian}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Vegan
                      </h4>
                      <p className="text-2xl font-bold">
                        {data.stats.specialDiets.vegan}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Non-Veg
                      </h4>
                      <p className="text-2xl font-bold">
                        {data.stats.specialDiets.nonVegetarian}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Special Requests</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Request</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.dietaryRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.studentName}</TableCell>
                            <TableCell>{request.roomNumber}</TableCell>
                            <TableCell>{request.request}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  request.status === "Approved"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/meal/requests">
                  <Button variant="outline">View All Requests</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
