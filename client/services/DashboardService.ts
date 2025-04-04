import axios from "axios";

// Define the base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Define types for dashboard data
export interface RoomData {
  roomNumber: string;
  building?: string;
  floor: string;
  type: string;
  bedNumber?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  checkout?: string; // For backward compatibility
}

export interface MealPlanData {
  name: string;
  description: string;
  meals: string[];
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface PaymentItem {
  id: string;
  amount: string;
  description: string;
  date: string;
  status: string;
  dueDate: string | null;
}

export interface ComplaintItem {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "info" | "warning" | "error" | "success";
}

export interface RecentActivity {
  id: number;
  action: string;
  user: string;
  date: string;
}

export interface StudentDashboardData {
  room: RoomData | null;
  mealPlan: MealPlanData | null;
  payments: PaymentItem[];
  complaints: ComplaintItem[];
  notifications: Notification[];
}

export interface StaffDashboardData {
  occupancy: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance: number;
  };
  students: {
    total: number;
    newAdmissions: number;
    checkouts: number;
  };
  complaints: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
  meals: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  payments: {
    collected: string;
    pending: string;
    overdue: string;
  };
  notifications: Notification[];
  recentActivities?: RecentActivity[];
}

// Dashboard service functions
export const dashboardService = {
  // Get student dashboard data
  getStudentDashboard: async (): Promise<StudentDashboardData> => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/dashboard/student`, config);
      return response.data;
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
      throw error;
    }
  },
  
  // Get staff dashboard data
  getStaffDashboard: async (): Promise<StaffDashboardData> => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/dashboard/staff`, config);
      return response.data;
    } catch (error) {
      console.error("Error fetching staff dashboard data:", error);
      throw error;
    }
  }
};

export default dashboardService;
