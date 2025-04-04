import axios from 'axios';

// Define the base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper functions for meal management
const getMealTimeByType = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'breakfast':
      return '7:00 AM - 9:00 AM';
    case 'lunch':
      return '12:00 PM - 2:00 PM';
    case 'dinner':
      return '7:00 PM - 9:00 PM';
    case 'snack':
      return '4:00 PM - 5:00 PM';
    default:
      return 'Scheduled Time';
  }
};

const getMealStatusByTime = (type: string): string => {
  const now = new Date();
  const hours = now.getHours();

  switch (type.toLowerCase()) {
    case 'breakfast':
      return hours >= 9 ? "Completed" : hours >= 7 ? "In Progress" : "Upcoming";
    case 'lunch':
      return hours >= 14 ? "Completed" : hours >= 12 ? "In Progress" : "Upcoming";
    case 'dinner':
      return hours >= 21 ? "Completed" : hours >= 19 ? "In Progress" : "Upcoming";
    case 'snack':
      return hours >= 17 ? "Completed" : hours >= 16 ? "In Progress" : "Upcoming";
    default:
      return "Scheduled";
  }
};

// Define types for meal management
export interface Meal {
  _id: string;
  id?: string;
  name: string;
  description: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  calories: number;
  price: number;
  available: boolean;
  imageUrl?: string;
}

export interface MealPlan {
  _id: string;
  id?: string;
  name: string;
  description: string;
  meals: {
    breakfast: Meal[] | string[];
    lunch: Meal[] | string[];
    dinner: Meal[] | string[];
    snack?: Meal[] | string[];
  };
  daysAvailable: (
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  )[];
  price: number;
}

export interface StudentMealPlan {
  _id: string;
  id?: string;
  student: {
    id: string;
    reference: string;
    name?: string;
  };
  plan: {
    id: string;
    reference: string;
    name?: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  specialRequests?: string;
}

export interface MealOrder {
  _id: string;
  id?: string;
  student: {
    id: string;
    reference: string;
    name?: string;
  };
  meal: {
    id: string;
    reference: string;
    name?: string;
  };
  date: string;
  time: string;
  status: string;
  specialRequests?: string;
}

export interface MealAttendance {
  _id: string;
  id?: string;
  meal: {
    id: string;
    reference: string;
    type?: string;
  };
  date: string;
  totalStudents: number;
  attendedStudents: number;
  percentage: number;
}

export interface DailyMeal {
  id: string;
  type: string;
  time: string;
  menu: string[];
  attendance: string;
  status: string;
}

export interface WeeklyScheduleItem {
  id: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface DietaryRequest {
  id: string;
  studentName: string;
  roomNumber: string;
  request: string;
  status: string;
}

export interface MealStats {
  averageAttendance: string;
  mostPopularMeal: string;
  leastPopularMeal: string;
  specialDiets: {
    vegetarian: number;
    vegan: number;
    nonVegetarian: number;
  };
}

export interface StaffMealDashboardData {
  today: {
    date: string;
    day: string;
    meals: DailyMeal[];
  };
  weeklySchedule: WeeklyScheduleItem[];
  stats: MealStats;
  dietaryRequests: DietaryRequest[];
}

export interface StudentMealDashboardData {
  today: {
    date: string;
    day: string;
    meals: {
      id: string;
      type: string;
      time: string;
      menu: string[];
      attended: boolean;
    }[];
  };
  weeklySchedule: WeeklyScheduleItem[];
  attendance: {
    thisMonth: {
      attended: number;
      missed: number;
      percentage: string;
    };
    dietaryPreferences: string;
    specialRequests: string;
  };
  mealPlan: {
    planName: string;
    startDate: string;
    endDate: string;
    status: string;
    dietaryPreferences: string;
    specialRequests: string;
  };
}

// Define API response types
export interface MealApiResponse {
  _id: string;
  name: string;
  description: string;
  type: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  menu?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanApiResponse {
  _id: string;
  name: string;
  description: string;
  price: number;
  daysAvailable: string[];
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface MealAttendanceApiResponse {
  _id: string;
  studentId: string;
  mealId: string;
  date: string;
  status: string;
  percentage?: number;
  count?: number;
  meal?: {
    _id: string;
    type: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DietaryRequestApiResponse {
  _id: string;
  studentName: string;
  studentId: string;
  roomNumber: string;
  request: string;
  status: string;
  createdAt: string;
}

export interface MealStatsApiResponse {
  mostPopularMeal: string;
  leastPopularMeal: string;
  specialDiets: {
    vegetarian: number;
    vegan: number;
    nonVegetarian: number;
  };
}

export interface StudentMealOrderApiResponse {
  _id: string;
  student: string | { _id: string; name: string };
  meal: string | MealApiResponse;
  date: string;
  attended: boolean;
  status: string;
}

export interface StudentMealPlanApiResponse {
  _id: string;
  student: string | { _id: string; name: string };
  plan: string | MealPlanApiResponse;
  startDate: string;
  endDate: string;
  status: string;
  dietaryPreferences?: string;
  specialRequests?: string;
}

export interface StudentAttendanceApiResponse {
  thisMonth: {
    attended: number;
    missed: number;
    percentage: string;
  };
  dietaryPreferences: string;
  specialRequests: string;
}

// Define types for meal creation and update
export interface MealInput {
  name: string;
  description: string;
  type: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  menu?: string[];
}

// Define types for meal plan creation and update
export interface MealPlanInput {
  name: string;
  description: string;
  price: number;
  daysAvailable: string[];
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
}

// Meal service functions
export const mealService = {
  // Get all available meals
  getAllMeals: async (): Promise<MealApiResponse[]> => {
    try {
      const response = await axios.get(`${API_URL}/meals`);
      return response.data;
    } catch (error) {
      console.error("Get all meals error:", error);
      return [];
    }
  },

  // Get meal by ID
  getMealById: async (id: string): Promise<MealApiResponse> => {
    try {
      const response = await axios.get(`${API_URL}/meals/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get meal by ID error:", error);
      throw error;
    }
  },

  // Create a new meal
  createMeal: async (mealData: MealInput): Promise<MealApiResponse> => {
    try {
      const response = await axios.post(`${API_URL}/meals`, mealData);
      return response.data;
    } catch (error) {
      console.error("Create meal error:", error);
      throw error;
    }
  },

  // Update a meal
  updateMeal: async (id: string, mealData: MealInput): Promise<MealApiResponse> => {
    try {
      const response = await axios.put(`${API_URL}/meals/${id}`, mealData);
      return response.data;
    } catch (error) {
      console.error("Update meal error:", error);
      throw error;
    }
  },

  // Delete a meal
  deleteMeal: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/meals/${id}`);
    } catch (error) {
      console.error("Delete meal error:", error);
      throw error;
    }
  },

  // Get all meal plans
  getAllMealPlans: async (): Promise<MealPlanApiResponse[]> => {
    try {
      const response = await axios.get(`${API_URL}/meals/plans`);
      return response.data;
    } catch (error) {
      console.error("Get all meal plans error:", error);
      return [];
    }
  },

  // Get meal plan by ID
  getMealPlanById: async (id: string): Promise<MealPlanApiResponse> => {
    try {
      const response = await axios.get(`${API_URL}/meals/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get meal plan by ID error:", error);
      throw error;
    }
  },

  // Create a new meal plan
  createMealPlan: async (planData: MealPlanInput): Promise<MealPlanApiResponse> => {
    try {
      const response = await axios.post(`${API_URL}/meals/plans`, planData);
      return response.data;
    } catch (error) {
      console.error("Create meal plan error:", error);
      throw error;
    }
  },

  // Update a meal plan
  updateMealPlan: async (id: string, planData: MealPlanInput): Promise<MealPlanApiResponse> => {
    try {
      const response = await axios.put(`${API_URL}/meals/plans/${id}`, planData);
      return response.data;
    } catch (error) {
      console.error("Update meal plan error:", error);
      throw error;
    }
  },

  // Delete a meal plan
  deleteMealPlan: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/meals/plans/${id}`);
    } catch (error) {
      console.error("Delete meal plan error:", error);
      throw error;
    }
  },

  // Get meal attendance
  getMealAttendance: async (date?: string): Promise<MealAttendanceApiResponse[]> => {
    try {
      // Use the correct path with query parameters
      let url = `${API_URL}/meals/attendance`;
      if (date) {
        url += `?date=${date}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Get meal attendance error:", error);
      return [];
    }
  },

  // Get student's meal plan
  getStudentMealPlan: async (studentId: string): Promise<StudentMealPlan | null> => {
    try {
      const response = await axios.get(`${API_URL}/students/${studentId}/meal-plan`);
      
      if (!response.data) {
        return null;
      }
      
      // Map backend data to frontend format
      return {
        ...response.data,
        id: response.data._id, // Add id property for frontend compatibility
      };
    } catch (error) {
      console.error("Get student meal plan error:", error);
      return null;
    }
  },

  // Subscribe to meal plan
  subscribeToPlan: async (
    studentId: string,
    planId: string,
    specialRequests?: string
  ): Promise<StudentMealPlan> => {
    try {
      const response = await axios.post(`${API_URL}/students/meal-plan`, {
        studentId,
        planId,
        specialRequests,
      });
      
      // Map backend data to frontend format
      return {
        ...response.data,
        id: response.data._id, // Add id property for frontend compatibility
      };
    } catch (error) {
      console.error("Subscribe to plan error:", error);
      throw error;
    }
  },

  // Cancel meal plan subscription
  cancelSubscription: async (subscriptionId: string): Promise<StudentMealPlan> => {
    try {
      const response = await axios.delete(`${API_URL}/students/meal-plan/${subscriptionId}`);
      
      // Map backend data to frontend format
      return {
        ...response.data,
        id: response.data._id, // Add id property for frontend compatibility
      };
    } catch (error) {
      console.error("Cancel subscription error:", error);
      throw error;
    }
  },

  // Order individual meal
  orderMeal: async (
    studentId: string,
    mealId: string,
    date: string,
    time: string,
    specialRequests?: string
  ): Promise<MealOrder> => {
    try {
      const response = await axios.post(`${API_URL}/meals/order`, {
        studentId,
        mealId,
        date,
        time,
        specialRequests,
      });
      
      // Map backend data to frontend format
      return {
        ...response.data,
        id: response.data._id, // Add id property for frontend compatibility
      };
    } catch (error) {
      console.error("Order meal error:", error);
      throw error;
    }
  },

  // Get student's meal orders
  getStudentOrders: async (studentId: string): Promise<MealOrder[]> => {
    try {
      const response = await axios.get(`${API_URL}/students/${studentId}/meal-orders`);
      
      // Map backend data to frontend format
      return response.data.map((order: MealOrder) => ({
        ...order,
        id: order._id, // Add id property for frontend compatibility
      }));
    } catch (error) {
      console.error("Get student orders error:", error);
      return [];
    }
  },
  
  // Get staff meal dashboard data
  getStaffMealDashboardData: async (): Promise<StaffMealDashboardData> => {
    try {
      // We need to aggregate data from multiple endpoints since there's no dedicated dashboard endpoint
      
      // Get today's date and day
      const today = new Date();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayFormatted = today.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Get meal attendance for today
      const attendanceResponse = await axios.get(
        `${API_URL}/meals/attendance?date=${today.toISOString().split('T')[0]}`
      );
      const attendanceData: MealAttendanceApiResponse[] = attendanceResponse.data || [];
      
      // Get meal plans for weekly schedule
      const mealPlansResponse = await axios.get(`${API_URL}/meals/plans`);
      const mealPlans: MealPlanApiResponse[] = mealPlansResponse.data || [];
      
      // Get today's meals
      const todayMealsResponse = await axios.get(`${API_URL}/meals`);
      const allMeals: MealApiResponse[] = todayMealsResponse.data || [];
      
      // Filter meals for today based on type (breakfast, lunch, dinner)
      const todayMealsData = allMeals.filter(meal => 
        ["breakfast", "lunch", "dinner"].includes(meal.type.toLowerCase())
      );
      
      // Map meals data to dashboard format
      const todayMeals = todayMealsData && todayMealsData.length > 0 ? 
        todayMealsData.map((meal: MealApiResponse) => ({
          id: meal._id,
          type: meal.type.charAt(0).toUpperCase() + meal.type.slice(1),
          time: getMealTimeByType(meal.type),
          menu: Array.isArray(meal.menu) ? meal.menu : [meal.name || "Standard Meal"],
          attendance: attendanceData.find((a: MealAttendanceApiResponse) => a.mealId === meal._id)?.percentage !== undefined ? attendanceData.find((a: MealAttendanceApiResponse) => a.mealId === meal._id)?.percentage?.toString() + "%" : "0%",
          status: getMealStatusByTime(meal.type),
        })) : 
        [
          {
            id: "m1",
            type: "Breakfast",
            time: getMealTimeByType("breakfast"),
            menu: ["Bread", "Eggs", "Cereal", "Milk", "Fruits"],
            attendance: attendanceData.find((a: MealAttendanceApiResponse) => a.mealId === "m1")?.percentage !== undefined ? attendanceData.find((a: MealAttendanceApiResponse) => a.mealId === "m1")?.percentage?.toString() + "%" : "0%",
            status: getMealStatusByTime("breakfast"),
          },
          {
            id: "m2",
            type: "Lunch",
            time: getMealTimeByType("lunch"),
            menu: ["Rice", "Dal", "Vegetables", "Chicken Curry", "Salad"],
            attendance: attendanceData.find((a: MealAttendanceApiResponse) => a.mealId === "m2")?.percentage !== undefined ? attendanceData.find((a: MealAttendanceApiResponse) => a.mealId === "m2")?.percentage?.toString() + "%" : "0%",
            status: getMealStatusByTime("lunch"),
          },
          {
            id: "m3",
            type: "Dinner",
            time: getMealTimeByType("dinner"),
            menu: ["Roti", "Paneer Butter Masala", "Mixed Vegetables", "Yogurt"],
            attendance: attendanceData.find((a: MealAttendanceApiResponse) => a.mealId === "m3")?.percentage !== undefined ? attendanceData.find((a: MealAttendanceApiResponse) => a.mealId === "m3")?.percentage?.toString() + "%" : "0%",
            status: getMealStatusByTime("dinner"),
          },
        ];
      
      // Create weekly schedule
      const weeklySchedule: WeeklyScheduleItem[] = dayNames.map((day, index) => {
        // Find meal plan for this day
        const planForDay = mealPlans.find((plan: MealPlanApiResponse) => 
          plan.daysAvailable && plan.daysAvailable.includes(day.toLowerCase())
        );
        
        return {
          id: `day${index + 1}`,
          day,
          breakfast: planForDay ? 
            (Array.isArray(planForDay.meals?.breakfast) ? 
              (planForDay.meals.breakfast as (MealApiResponse | string)[]).map((m: MealApiResponse | string) => 
                typeof m === 'string' ? m : m.name
              ).join(", ") : 
              "Standard Breakfast") : 
            "Standard Breakfast",
          lunch: planForDay ? 
            (Array.isArray(planForDay.meals?.lunch) ? 
              (planForDay.meals.lunch as (MealApiResponse | string)[]).map((m: MealApiResponse | string) => 
                typeof m === 'string' ? m : m.name
              ).join(", ") : 
              "Standard Lunch") : 
            "Standard Lunch",
          dinner: planForDay ? 
            (Array.isArray(planForDay.meals?.dinner) ? 
              (planForDay.meals.dinner as (MealApiResponse | string)[]).map((m: MealApiResponse | string) => 
                typeof m === 'string' ? m : m.name
              ).join(", ") : 
              "Standard Dinner") : 
            "Standard Dinner",
        };
      });
      
      // Get dietary requests
      let dietaryRequests: DietaryRequestApiResponse[] = [];
      try {
        const dietaryRequestsResponse = await axios.get(`${API_URL}/meals/dietary-requests`);
        dietaryRequests = dietaryRequestsResponse.data || [];
      } catch (error) {
        console.error("Error fetching dietary requests:", error);
        // Fallback data
        dietaryRequests = [
          {
            _id: "dr1",
            studentName: "John Doe",
            studentId: "s1",
            roomNumber: "A101",
            request: "Allergic to nuts",
            status: "pending",
            createdAt: new Date().toISOString()
          },
          {
            _id: "dr2",
            studentName: "Jane Smith",
            studentId: "s2",
            roomNumber: "B202",
            request: "Lactose intolerant",
            status: "approved",
            createdAt: new Date().toISOString()
          }
        ];
      }
      
      // Get meal statistics
      let statsData: MealStatsApiResponse;
      try {
        const statsResponse = await axios.get(`${API_URL}/meals/stats`);
        statsData = statsResponse.data;
      } catch (error) {
        console.error("Error fetching meal stats:", error);
        // Fallback data
        statsData = {
          mostPopularMeal: "Sunday Lunch",
          leastPopularMeal: "Monday Breakfast",
          specialDiets: {
            vegetarian: 45,
            vegan: 12,
            nonVegetarian: 125,
          }
        };
      }
      
      // Return dashboard data
      return {
        today: {
          date: todayFormatted,
          day: dayNames[today.getDay()],
          meals: todayMeals,
        },
        weeklySchedule,
        stats: {
          averageAttendance: "88%",
          mostPopularMeal: statsData.mostPopularMeal || "Sunday Lunch",
          leastPopularMeal: statsData.leastPopularMeal || "Monday Breakfast",
          specialDiets: statsData.specialDiets || {
            vegetarian: 45,
            vegan: 12,
            nonVegetarian: 125,
          },
        },
        dietaryRequests: dietaryRequests.length > 0 ? 
          dietaryRequests.map((req: DietaryRequestApiResponse) => ({
            id: req._id,
            studentName: req.studentName,
            roomNumber: req.roomNumber,
            request: req.request,
            status: req.status,
          })) : 
          [
            {
              id: "dr1",
              studentName: "Alice Johnson",
              roomNumber: "A-102",
              request: "Vegan diet",
              status: "Approved",
            },
            {
              id: "dr2",
              studentName: "Michael Brown",
              roomNumber: "B-204",
              request: "Gluten-free meals",
              status: "Pending",
            },
            {
              id: "dr3",
              studentName: "Sarah Wilson",
              roomNumber: "C-305",
              request: "Allergic to nuts",
              status: "Approved",
            },
          ],
      };
    } catch (error) {
      console.error("Get staff meal dashboard data error:", error);
      
      // Return mock data as fallback
      return {
        today: {
          date: new Date().toLocaleDateString('en-US', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }),
          day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()],
          meals: [
            {
              id: "m1",
              type: "Breakfast",
              time: getMealTimeByType("breakfast"),
              menu: ["Bread", "Eggs", "Cereal", "Milk", "Fruits"],
              attendance: "75%",
              status: getMealStatusByTime("breakfast"),
            },
            {
              id: "m2",
              type: "Lunch",
              time: getMealTimeByType("lunch"),
              menu: ["Rice", "Dal", "Vegetables", "Chicken Curry", "Salad"],
              attendance: "82%",
              status: getMealStatusByTime("lunch"),
            },
            {
              id: "m3",
              type: "Dinner",
              time: getMealTimeByType("dinner"),
              menu: ["Roti", "Paneer Butter Masala", "Mixed Vegetables", "Yogurt"],
              attendance: "0%",
              status: getMealStatusByTime("dinner"),
            },
          ],
        },
        weeklySchedule: [
          {
            id: "day1",
            day: "Monday",
            breakfast: "Idli, Sambar, Chutney",
            lunch: "Rice, Dal, Vegetables, Chicken",
            dinner: "Roti, Paneer Dish, Mixed Vegetables",
          },
          {
            id: "day2",
            day: "Tuesday",
            breakfast: "Bread, Eggs, Cereal",
            lunch: "Rice, Rajma, Vegetables",
            dinner: "Roti, Mix Veg, Dal",
          },
          {
            id: "day3",
            day: "Wednesday",
            breakfast: "Poha, Fruits, Tea",
            lunch: "Rice, Dal, Fish Curry",
            dinner: "Pulao, Raita, Salad",
          },
          {
            id: "day4",
            day: "Thursday",
            breakfast: "Upma, Fruits, Coffee",
            lunch: "Rice, Sambar, Vegetables",
            dinner: "Roti, Chicken Curry, Salad",
          },
          {
            id: "day5",
            day: "Friday",
            breakfast: "Dosa, Chutney, Fruits",
            lunch: "Rice, Dal, Egg Curry",
            dinner: "Biryani, Raita, Salad",
          },
          {
            id: "day6",
            day: "Saturday",
            breakfast: "Bread, Eggs, Cereal, Milk, Fruits",
            lunch: "Rice, Dal, Vegetables, Chicken Curry, Salad",
            dinner: "Roti, Paneer Butter Masala, Mixed Vegetables, Yogurt",
          },
          {
            id: "day7",
            day: "Sunday",
            breakfast: "Puri, Sabji, Fruits",
            lunch: "Special Thali, Dessert",
            dinner: "Roti, Mix Vegetable, Dal Makhani",
          },
        ],
        stats: {
          averageAttendance: "88%",
          mostPopularMeal: "Sunday Lunch",
          leastPopularMeal: "Monday Breakfast",
          specialDiets: {
            vegetarian: 45,
            vegan: 12,
            nonVegetarian: 125,
          },
        },
        dietaryRequests: [
          {
            id: "dr1",
            studentName: "Alice Johnson",
            roomNumber: "A-102",
            request: "Vegan diet",
            status: "Approved",
          },
          {
            id: "dr2",
            studentName: "Michael Brown",
            roomNumber: "B-204",
            request: "Gluten-free meals",
            status: "Pending",
          },
          {
            id: "dr3",
            studentName: "Sarah Wilson",
            roomNumber: "C-305",
            request: "Allergic to nuts",
            status: "Approved",
          },
        ],
      };
    }
  },
  
  // Get student meal dashboard data
  getStudentMealDashboardData: async (studentId: string): Promise<StudentMealDashboardData> => {
    try {
      // We need to aggregate data from multiple endpoints since there's no dedicated dashboard endpoint
      
      // Get today's date and day
      const today = new Date();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayFormatted = today.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Check if student has a meal plan
      const studentMealPlanResponse = await axios.get(`${API_URL}/meals/students/${studentId}/plan`);
      const studentMealPlan: StudentMealPlanApiResponse | null = studentMealPlanResponse.data || null;
      
      // Get all available meals
      const mealsResponse = await axios.get(`${API_URL}/meals`);
      const allMeals: MealApiResponse[] = mealsResponse.data || [];
      
      // Filter meals for today based on type (breakfast, lunch, dinner)
      const todayMealsData = allMeals.filter(meal => 
        ["breakfast", "lunch", "dinner"].includes(meal.type.toLowerCase())
      );
      
      // Get student's meal orders to determine attendance
      const ordersResponse = await axios.get(`${API_URL}/meals/students/${studentId}/meal-orders`);
      const studentOrders: StudentMealOrderApiResponse[] = ordersResponse.data || [];
      
      // Create attendance data from orders
      const attendanceData = studentOrders
        .filter((order: StudentMealOrderApiResponse) => {
          const orderDate = new Date(order.date);
          return orderDate.toDateString() === today.toDateString();
        })
        .map((order: StudentMealOrderApiResponse) => ({
          mealId: typeof order.meal === 'string' ? order.meal : order.meal._id,
          attended: order.attended || false
        }));
      
      // Map meals data to dashboard format
      const todayMeals = todayMealsData && todayMealsData.length > 0 ? 
        todayMealsData.map((meal: MealApiResponse) => ({
          id: meal._id,
          type: meal.type.charAt(0).toUpperCase() + meal.type.slice(1),
          time: getMealTimeByType(meal.type),
          menu: Array.isArray(meal.menu) ? meal.menu : [meal.name || "Standard Meal"],
          attended: attendanceData.find(a => a.mealId === meal._id)?.attended || false,
        })) : 
        [
          {
            id: "m1",
            type: "Breakfast",
            time: getMealTimeByType("breakfast"),
            menu: ["Bread", "Eggs", "Cereal", "Milk", "Fruits"],
            attended: attendanceData.find(a => a.mealId === "m1")?.attended || false,
          },
          {
            id: "m2",
            type: "Lunch",
            time: getMealTimeByType("lunch"),
            menu: ["Rice", "Dal", "Vegetables", "Chicken Curry", "Salad"],
            attended: attendanceData.find(a => a.mealId === "m2")?.attended || false,
          },
          {
            id: "m3",
            type: "Dinner",
            time: getMealTimeByType("dinner"),
            menu: ["Roti", "Paneer Butter Masala", "Mixed Vegetables", "Yogurt"],
            attended: attendanceData.find(a => a.mealId === "m3")?.attended || false,
          },
        ];
      
      // Get weekly meal schedule for the student
      const weeklyMealsResponse = await axios.get(`${API_URL}/meals/weekly/student/${studentId}`);
      const weeklyMealsData: MealPlanApiResponse[] = weeklyMealsResponse.data || [];
      
      // Format weekly schedule
      const weeklySchedule = weeklyMealsData.length > 0 ? 
        weeklyMealsData.map((dayPlan: MealPlanApiResponse, index: number) => ({
          id: `day${index + 1}`,
          day: dayNames[index],
          breakfast: dayPlan.meals?.breakfast ? 
            (Array.isArray(dayPlan.meals.breakfast) ? 
              (dayPlan.meals.breakfast as (MealApiResponse | string)[]).map((m: MealApiResponse | string) => 
                typeof m === 'string' ? m : m.name
              ).join(", ") : 
              "Standard Breakfast") : 
            "Standard Breakfast",
          lunch: dayPlan.meals?.lunch ? 
            (Array.isArray(dayPlan.meals.lunch) ? 
              (dayPlan.meals.lunch as (MealApiResponse | string)[]).map((m: MealApiResponse | string) => 
                typeof m === 'string' ? m : m.name
              ).join(", ") : 
              "Standard Lunch") : 
            "Standard Lunch",
          dinner: dayPlan.meals?.dinner ? 
            (Array.isArray(dayPlan.meals.dinner) ? 
              (dayPlan.meals.dinner as (MealApiResponse | string)[]).map((m: MealApiResponse | string) => 
                typeof m === 'string' ? m : m.name
              ).join(", ") : 
              "Standard Dinner") : 
            "Standard Dinner",
        })) : 
        dayNames.map((day, index) => ({
          id: `day${index + 1}`,
          day,
          breakfast: index === 0 ? "Idli, Sambar, Chutney" :
                    index === 1 ? "Bread, Eggs, Cereal" :
                    index === 2 ? "Poha, Fruits, Tea" :
                    index === 3 ? "Upma, Fruits, Coffee" :
                    index === 4 ? "Dosa, Chutney, Fruits" :
                    index === 5 ? "Bread, Eggs, Cereal, Milk, Fruits" :
                    "Puri, Sabji, Fruits",
          lunch: index === 0 ? "Rice, Dal, Vegetables, Chicken" :
                 index === 1 ? "Rice, Rajma, Vegetables" :
                 index === 2 ? "Rice, Dal, Fish Curry" :
                 index === 3 ? "Rice, Sambar, Vegetables" :
                 index === 4 ? "Rice, Dal, Egg Curry" :
                 index === 5 ? "Rice, Dal, Vegetables, Chicken Curry, Salad" :
                 "Special Thali, Dessert",
          dinner: index === 0 ? "Roti, Paneer Dish, Mixed Vegetables" :
                  index === 1 ? "Roti, Mix Veg, Dal" :
                  index === 2 ? "Pulao, Raita, Salad" :
                  index === 3 ? "Roti, Chicken Curry, Salad" :
                  index === 4 ? "Biryani, Raita, Salad" :
                  index === 5 ? "Roti, Paneer Butter Masala, Mixed Vegetables, Yogurt" :
                  "Roti, Mix Vegetable, Dal Makhani",
        }));
      
      // Get attendance data for the student
      const attendanceResponse = await axios.get(`${API_URL}/meals/students/${studentId}/attendance`);
      const attendanceDataResponse: StudentAttendanceApiResponse = attendanceResponse.data || {
        thisMonth: {
          attended: 20,
          missed: 5,
          percentage: "80%",
        },
        dietaryPreferences: "Vegetarian",
        specialRequests: "Gluten-free meals",
      };
      
      // Get student's meal plan details
      const studentMealPlanDetails = studentMealPlan ? {
        planName: typeof studentMealPlan.plan === 'string' 
          ? "Standard Plan" 
          : studentMealPlan.plan.name || "Standard Plan",
        startDate: studentMealPlan.startDate,
        endDate: studentMealPlan.endDate,
        status: studentMealPlan.status,
        dietaryPreferences: studentMealPlan.dietaryPreferences || "Vegetarian",
        specialRequests: studentMealPlan.specialRequests || "Gluten-free meals",
      } : {
        planName: "No Plan",
        startDate: "",
        endDate: "",
        status: "",
        dietaryPreferences: "",
        specialRequests: "",
      };
      
      return {
        today: {
          date: todayFormatted,
          day: dayNames[today.getDay()],
          meals: todayMeals,
        },
        weeklySchedule,
        attendance: attendanceDataResponse,
        mealPlan: studentMealPlanDetails,
      };
    } catch (error) {
      console.error("Get student meal dashboard data error:", error);
      
      // Return mock data as fallback
      return {
        today: {
          date: new Date().toLocaleDateString('en-US', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }),
          day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()],
          meals: [
            {
              id: "m1",
              type: "Breakfast",
              time: getMealTimeByType("breakfast"),
              menu: ["Bread", "Eggs", "Cereal", "Milk", "Fruits"],
              attended: true,
            },
            {
              id: "m2",
              type: "Lunch",
              time: getMealTimeByType("lunch"),
              menu: ["Rice", "Dal", "Vegetables", "Chicken Curry", "Salad"],
              attended: true,
            },
            {
              id: "m3",
              type: "Dinner",
              time: getMealTimeByType("dinner"),
              menu: ["Roti", "Paneer Butter Masala", "Mixed Vegetables", "Yogurt"],
              attended: false,
            },
          ],
        },
        weeklySchedule: [
          {
            id: "day1",
            day: "Monday",
            breakfast: "Idli, Sambar, Chutney",
            lunch: "Rice, Dal, Vegetables, Chicken",
            dinner: "Roti, Paneer Dish, Mixed Vegetables",
          },
          {
            id: "day2",
            day: "Tuesday",
            breakfast: "Bread, Eggs, Cereal",
            lunch: "Rice, Rajma, Vegetables",
            dinner: "Roti, Mix Veg, Dal",
          },
          {
            id: "day3",
            day: "Wednesday",
            breakfast: "Poha, Fruits, Tea",
            lunch: "Rice, Dal, Fish Curry",
            dinner: "Pulao, Raita, Salad",
          },
          {
            id: "day4",
            day: "Thursday",
            breakfast: "Upma, Fruits, Coffee",
            lunch: "Rice, Sambar, Vegetables",
            dinner: "Roti, Chicken Curry, Salad",
          },
          {
            id: "day5",
            day: "Friday",
            breakfast: "Dosa, Chutney, Fruits",
            lunch: "Rice, Dal, Egg Curry",
            dinner: "Biryani, Raita, Salad",
          },
          {
            id: "day6",
            day: "Saturday",
            breakfast: "Bread, Eggs, Cereal, Milk, Fruits",
            lunch: "Rice, Dal, Vegetables, Chicken Curry, Salad",
            dinner: "Roti, Paneer Butter Masala, Mixed Vegetables, Yogurt",
          },
          {
            id: "day7",
            day: "Sunday",
            breakfast: "Puri, Sabji, Fruits",
            lunch: "Special Thali, Dessert",
            dinner: "Roti, Mix Vegetable, Dal Makhani",
          },
        ],
        attendance: {
          thisMonth: {
            attended: 20,
            missed: 5,
            percentage: "80%",
          },
          dietaryPreferences: "Vegetarian",
          specialRequests: "Gluten-free meals",
        },
        mealPlan: {
          planName: "Standard Plan",
          startDate: "2022-01-01",
          endDate: "2022-12-31",
          status: "Active",
          dietaryPreferences: "Vegetarian",
          specialRequests: "Gluten-free meals",
        },
      };
    }
  },
};

// Export default for convenience
export default mealService;
