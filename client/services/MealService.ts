import axios from 'axios';

// Define the base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Configure axios with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
      // Get today's date and day
      const today = new Date();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayFormatted = today.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Make a direct API call to get meal data
      const response = await api.get('/meals');
      const data = response.data;
      
      // Also get meal attendance data
      const attendanceResponse = await api.get('/meals/attendance');
      const attendanceData = attendanceResponse.data;
      
      // If we have data from the API, use it
      if (data) {
        return data;
      }
      
      // If API doesn't return data, create minimal structure with helper functions
      const todayMeals = [
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
      ];
      
      // Create basic weekly schedule
      const weeklySchedule = dayNames.map((day, index) => ({
        id: `day${index + 1}`,
        day,
        breakfast: "Standard Breakfast",
        lunch: "Standard Lunch",
        dinner: "Standard Dinner",
      }));
      
      // Return simplified dashboard data
      return {
        today: {
          date: todayFormatted,
          day: dayNames[today.getDay()],
          meals: todayMeals,
        },
        weeklySchedule,
        stats: {
          averageAttendance: "0%",
          mostPopularMeal: "None",
          leastPopularMeal: "None",
          specialDiets: {
            vegetarian: 0,
            vegan: 0,
            nonVegetarian: 0,
          },
        },
        dietaryRequests: [],
      };
    } catch (error) {
      console.error("Get staff meal dashboard data error:", error);
      throw error;
    }
  },
  
  // Get student meal dashboard data
  getStudentMealDashboardData: async (studentId: string): Promise<StudentMealDashboardData> => {
    try {
      // Get today's date and day
      const today = new Date();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayFormatted = today.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Make a direct API call to get meal data
      const response = await api.get('/meals');
      const data = response.data;
      
      // Get student's meal orders to determine attendance
      const ordersResponse = await api.get(`/meals/students/${studentId}/orders`);
      const ordersData = ordersResponse.data;
      
      // If we have data from the API, use it
      if (data) {
        return data;
      }
      
      // If API doesn't return data, create minimal structure with helper functions
      const todayMeals = [
        {
          id: "m1",
          type: "Breakfast",
          time: getMealTimeByType("breakfast"),
          menu: ["Bread", "Eggs", "Cereal", "Milk", "Fruits"],
          attended: false,
        },
        {
          id: "m2",
          type: "Lunch",
          time: getMealTimeByType("lunch"),
          menu: ["Rice", "Dal", "Vegetables", "Chicken Curry", "Salad"],
          attended: false,
        },
        {
          id: "m3",
          type: "Dinner",
          time: getMealTimeByType("dinner"),
          menu: ["Roti", "Paneer Butter Masala", "Mixed Vegetables", "Yogurt"],
          attended: false,
        },
      ];
      
      // Create basic weekly schedule
      const weeklySchedule = dayNames.map((day, index) => ({
        id: `day${index + 1}`,
        day,
        breakfast: "Standard Breakfast",
        lunch: "Standard Lunch",
        dinner: "Standard Dinner",
      }));
      
      // Return simplified dashboard data
      return {
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
      };
    } catch (error) {
      console.error("Get student meal dashboard data error:", error);
      throw error;
    }
  },
};

// Export default for convenience
export default mealService;
