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
import { CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import mealService from "@/services/MealService";

// Simplified mock data
const MOCK_STUDENT_DATA = {
  today: {
    date: "May 10, 2025",
    day: "Saturday",
    meals: [
      {
        id: "1",
        type: "Breakfast",
        time: "7:00 AM - 9:00 AM",
        menu: ["Eggs", "Toast", "Cereal", "Fruit"],
        attended: true,
      },
      {
        id: "2",
        type: "Lunch",
        time: "12:00 PM - 2:00 PM",
        menu: ["Sandwich", "Soup", "Salad", "Juice"],
        attended: false,
      },
      {
        id: "3",
        type: "Dinner",
        time: "7:00 PM - 9:00 PM",
        menu: ["Rice", "Curry", "Vegetables", "Dessert"],
        attended: false,
      },
    ],
  },
  weeklySchedule: [
    { id: "1", day: "Monday", breakfast: "Continental", lunch: "Italian", dinner: "Indian" },
    { id: "2", day: "Tuesday", breakfast: "American", lunch: "Mexican", dinner: "Chinese" },
    { id: "3", day: "Wednesday", breakfast: "English", lunch: "Thai", dinner: "Mediterranean" },
    { id: "4", day: "Thursday", breakfast: "French", lunch: "Japanese", dinner: "Korean" },
    { id: "5", day: "Friday", breakfast: "Continental", lunch: "American", dinner: "BBQ" },
    { id: "6", day: "Saturday", breakfast: "Brunch Special", lunch: "Fusion", dinner: "Chef's Special" },
    { id: "7", day: "Sunday", breakfast: "Brunch Special", lunch: "Home Style", dinner: "International" },
  ],
  attendance: {
    thisMonth: {
      attended: 12,
      missed: 3,
      percentage: "80%",
    },
    dietaryPreferences: "Vegetarian",
    specialRequests: "No nuts, please",
  },
  mealPlan: {
    planName: "Standard Plan",
    startDate: "May 1, 2025",
    endDate: "May 31, 2025",
    status: "Active",
    dietaryPreferences: "Vegetarian",
    specialRequests: "No nuts, please",
  },
};

const MOCK_STAFF_DATA = {
  today: {
    date: "May 10, 2025",
    day: "Saturday",
    meals: [
      {
        id: "1",
        type: "Breakfast",
        time: "7:00 AM - 9:00 AM",
        menu: ["Eggs", "Toast", "Cereal", "Fruit"],
        attendance: "85%",
        status: "Completed",
      },
      {
        id: "2",
        type: "Lunch",
        time: "12:00 PM - 2:00 PM",
        menu: ["Sandwich", "Soup", "Salad", "Juice"],
        attendance: "92%",
        status: "In Progress",
      },
      {
        id: "3",
        type: "Dinner",
        time: "7:00 PM - 9:00 PM",
        menu: ["Rice", "Curry", "Vegetables", "Dessert"],
        attendance: "0%",
        status: "Upcoming",
      },
    ],
  },
  weeklySchedule: MOCK_STUDENT_DATA.weeklySchedule,
};

function getMealTimeByType(type) {
  switch (type?.toLowerCase()) {
    case "breakfast": return "7:00 AM - 9:00 AM";
    case "lunch": return "12:00 PM - 2:00 PM";
    case "dinner": return "7:00 PM - 9:00 PM";
    default: return "Scheduled Time";
  }
}

function getMealStatusByTime(type) {
  const now = new Date();
  const hours = now.getHours();
  switch (type?.toLowerCase()) {
    case "breakfast": return hours >= 9 ? "Completed" : hours >= 7 ? "In Progress" : "Upcoming";
    case "lunch": return hours >= 14 ? "Completed" : hours >= 12 ? "In Progress" : "Upcoming";
    case "dinner": return hours >= 21 ? "Completed" : hours >= 19 ? "In Progress" : "Upcoming";
    default: return "Scheduled";
  }
}

// Main component
export default function MealManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(MOCK_STUDENT_DATA);
  const [staffData, setStaffData] = useState(MOCK_STAFF_DATA);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.role === "staff") {
          // Fetch staff dashboard data (array of meals)
          const meals = await mealService.getStaffMealDashboardData();
          if (meals && Array.isArray(meals)) {
            // Transform meals array into the expected dashboard structure
            const today = new Date();
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const todayFormatted = today.toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            // Filter for today's meals (breakfast, lunch, dinner)
            const todayMeals = meals
              .filter(meal => ["breakfast", "lunch", "dinner"].includes(meal.type?.toLowerCase()))
              .map(meal => ({
                id: meal._id,
                type: meal.type.charAt(0).toUpperCase() + meal.type.slice(1),
                time: getMealTimeByType(meal.type),
                menu: meal.menu || [meal.name],
                attendance: "0%", // Or fetch attendance if available
                status: getMealStatusByTime(meal.type),
              }));
            // Weekly schedule (example: just use meal names for now)
            const weeklySchedule = dayNames.map((day, idx) => ({
              id: `day${idx + 1}`,
              day,
              breakfast: meals.find(m => m.type?.toLowerCase() === "breakfast")?.name || "Standard Breakfast",
              lunch: meals.find(m => m.type?.toLowerCase() === "lunch")?.name || "Standard Lunch",
              dinner: meals.find(m => m.type?.toLowerCase() === "dinner")?.name || "Standard Dinner",
            }));
            setStaffData({
              today: {
                date: todayFormatted,
                day: dayNames[today.getDay()],
                meals: todayMeals,
              },
              weeklySchedule,
            });
          } else if (meals) {
            setStaffData(meals); // fallback for already-structured data
          }
        } else if (user?._id) {
          // Fetch student dashboard data
          const meals = await mealService.getStudentMealDashboardData(user._id);
          
          if (meals && Array.isArray(meals)) {
            // Transform meals array into the expected dashboard structure
            const today = new Date();
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const todayFormatted = today.toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            
            // Filter for today's meals (breakfast, lunch, dinner)
            const todayMeals = meals
              .filter(meal => ["breakfast", "lunch", "dinner"].includes(meal.type?.toLowerCase()))
              .map(meal => ({
                id: meal._id,
                type: meal.type.charAt(0).toUpperCase() + meal.type.slice(1),
                time: getMealTimeByType(meal.type),
                menu: meal.menu || [meal.name],
                attended: false, // Default to false, update if we have attendance data
              }));
              
            // Weekly schedule (example: just use meal names for now)
            const weeklySchedule = dayNames.map((day, idx) => ({
              id: `day${idx + 1}`,
              day,
              breakfast: meals.find(m => m.type?.toLowerCase() === "breakfast")?.name || "Standard Breakfast",
              lunch: meals.find(m => m.type?.toLowerCase() === "lunch")?.name || "Standard Lunch",
              dinner: meals.find(m => m.type?.toLowerCase() === "dinner")?.name || "Standard Dinner",
            }));
            
            setStudentData({
              today: {
                date: todayFormatted,
                day: dayNames[today.getDay()],
                meals: todayMeals,
              },
              weeklySchedule,
              attendance: {
                thisMonth: {
                  attended: 0,
                  missed: 0,
                  percentage: "0%",
                },
                dietaryPreferences: "None specified",
                specialRequests: "None specified",
              },
              mealPlan: {
                planName: "No Plan",
                startDate: "",
                endDate: "",
                status: "",
                dietaryPreferences: "",
                specialRequests: "",
              },
            });
          } else if (meals) {
            setStudentData(meals); // fallback for already-structured data
          }
        }
      } catch (error) {
        console.error("Error fetching meal data:", error);
        // Keep using mock data as fallback
      } finally {
        setLoading(false);
      }
    };
  
    if (user) {
      fetchData();
    }
  }, [user]);

  console.log(studentData);

  if (loading) {
    return <div className="text-center p-8">Loading meal data...</div>;
  }

  return (
    <div className="w-full mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Management</h1>
          <p className="text-muted-foreground">
            View and manage meal plans and schedules
          </p>
        </div>
        {user?.role === "staff" && (
          <Button asChild>
            <Link href="/dashboard/meal/plan">Manage Meal Plans</Link>
          </Button>
        )}
      </div>

      {user?.role === "staff" ? (
        <StaffMealView data={staffData} />
      ) : (
        <StudentMealView data={studentData} />
      )}
    </div>
  );
}

// Student view component
function StudentMealView({ data }) {
  if (!data || !data.today || !data.weeklySchedule) {
    return <div className="text-center p-8">No meal data available.</div>;
  }
  return (
    <div className="space-y-6 w-full">
      {/* Today's Meals */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Meals - {data.today.date}</CardTitle>
          <CardDescription>
            {data.today.day}&apos;s meal schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.today.meals.map((meal) => (
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
                        {meal.menu.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
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
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

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
              {data.weeklySchedule.map((day) => (
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
    </div>
  );
}

// Staff view component
function StaffMealView({ data }) {
  if (!data || !data.today || !data.weeklySchedule) {
    return <div className="text-center p-8">No meal data available.</div>;
  }
  return (
    <div className="space-y-6 w-full">
      {/* Today's Meals */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Meals - {data.today.date}</CardTitle>
          <CardDescription>
            {data.today.day}&apos;s meal schedule and attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <p className="text-lg font-bold">{meal.attendance}</p>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  {/* <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/meal/attendance/${meal.id}`}>
                      View Details
                    </Link>
                  </Button> */}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Meal Schedule</CardTitle>
          <CardDescription>
            Manage and update the weekly meal schedule
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
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.weeklySchedule.map((day) => (
                <TableRow key={day.id}>
                  <TableCell className="font-medium">{day.day}</TableCell>
                  <TableCell>{day.breakfast}</TableCell>
                  <TableCell>{day.lunch}</TableCell>
                  <TableCell>{day.dinner}</TableCell>
                  {/* <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/meal/schedule/${day.id}`}>
                        Edit
                      </Link>
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}