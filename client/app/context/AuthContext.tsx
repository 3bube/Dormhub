"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService, {
  User as AuthUser,
  LoginCredentials,
  RegisterData,
} from "../../services/AuthServices";

// Define user roles
export type UserRole = "student" | "staff";

// Define user type
export type User = {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  staffId?: string;
  roomNumber?: string;
  profileImage?: string;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  forgotPassword: async () => false,
  resetPassword: async () => false,
  updateProfile: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser as unknown as User);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const credentials: LoginCredentials = { email, password };
      const { user: authUser } = await authService.login(credentials);

      setUser(authUser as unknown as User);
      return true;
    } catch (error) {
      console.error("Sign in error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const registerData: RegisterData = {
        name,
        email,
        password,
        role,
      };

      const { user: authUser } = await authService.register(registerData);
      setUser(authUser as unknown as User);
      return true;
    } catch (error) {
      console.error("Sign up error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      return true;
    } catch (error) {
      console.error("Forgot password error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (
    token: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(
        userData as Partial<AuthUser>
      );
      setUser(updatedUser as unknown as User);
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Create context value
  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
