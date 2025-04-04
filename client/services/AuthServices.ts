import axios from "axios";

// Define the base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Define types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "student" | "staff";
  studentId?: string;
  staffId?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "staff";
  studentId?: string;
  staffId?: string;
  profileImage?: string;
  token?: string;
}

// Authentication service functions
export const authService = {
  // Login function
  login: async (
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);

      // Extract user and token from response
      const { token, ...user } = response.data;

      // Store user and token in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set up auth interceptors
      setupAuthInterceptors(token);

      return { user, token };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register function
  register: async (
    data: RegisterData
  ): Promise<{ user: User; token: string }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);

      // Extract user and token from response
      const { token, ...user } = response.data;

      // Store user and token in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set up auth interceptors
      setupAuthInterceptors(token);

      return { user, token };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Logout function
  logout: async (): Promise<void> => {
    try {
      // Call the backend logout endpoint
      await axios.post(`${API_URL}/auth/logout`);

      // Clear token and user from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return;
    } catch (error) {
      console.error("Logout error:", error);

      // Even if the API call fails, clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      throw error;
    }
  },

  // Get current user function
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return null;

      // Set up auth interceptors with the stored token
      setupAuthInterceptors(token);

      // Get user profile from backend
      const response = await axios.get(`${API_URL}/auth/me`);

      // Update stored user data
      localStorage.setItem("user", JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);

      // If unauthorized, clear storage
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      return null;
    }
  },

  // Reset password request function
  forgotPassword: async (
    email: string
  ): Promise<{ message: string; resetToken: string }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  // Reset password with token function
  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, userData);

      // Update stored user data
      const updatedUser = response.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },
};

// Function to set up axios interceptors for authentication
export const setupAuthInterceptors = (token: string) => {
  // Remove any existing interceptors
  axios.interceptors.request.eject(0);
  axios.interceptors.response.eject(0);

  // Add token to all requests
  axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle token expiration or other auth errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expired or invalid, logout user
        authService.logout();
        // Redirect to login page
        window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    }
  );
};

// Export default for convenience
export default authService;
