"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import paymentService, { StudentPaymentData, StaffPaymentData } from "@/services/PaymentService";
import StudentPaymentsView from "./student-view";
import StaffPaymentsView from "./staff-view";

// No hardcoded fallback data - we'll handle errors properly

export default function PaymentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentPaymentData, setStudentPaymentData] = useState<StudentPaymentData | null>(null);
  const [staffData, setStaffData] = useState<any | null>(null);

  // Fetch payment data based on user role
  useEffect(() => {
    const fetchPaymentsData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user?.role === "student") {
          try {
            const data = await paymentService.getStudentPayments();
            setStudentPaymentData(data);
          } catch (studentError) {
            console.error("Error fetching student payment data:", studentError);
            setError("Failed to load student payment data. The API might be unavailable.");
          }
        } else {
          try {
            const data = await paymentService.getStaffPayments();
            setStaffData(data);
          } catch (staffError) {
            console.error("Error fetching staff payment data:", staffError);
            setError("Failed to load staff payment data. The API might be unavailable.");
          }
        }
      } catch (error) {
        console.error("General error in payment data fetching:", error);
        setError("Failed to load payment data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPaymentsData();
    }
  }, [user]);

  // Display loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading payment data...</p>
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
          <h2 className="mt-4 text-xl font-semibold">Error Loading Payments</h2>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Payments Management
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "student"
            ? "View your payment history and make payments"
            : "Manage student payments and financial records"}
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error</h3>
          </div>
          <p className="mt-1 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-t-primary rounded-full animate-spin mb-3"></div>
            <p className="text-muted-foreground">Loading payment data...</p>
          </div>
        </div>
      ) : user?.role === "student" ? (
        studentPaymentData ? (
          <StudentPaymentsView data={studentPaymentData} />
        ) : (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-md p-4">
            <p>No payment data found. Please contact the administrator.</p>
          </div>
        )
      ) : (
        staffData ? (
          <StaffPaymentsView data={staffData} />
        ) : (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-md p-4">
            <p>No payment data found. Please check the system configuration.</p>
          </div>
        )
      )}
    </div>
  );
}

// This file now uses the separate StudentPaymentsView and StaffPaymentsView components
// from their respective files (student-view.tsx and staff-view.tsx)
