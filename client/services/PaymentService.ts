import axios from "axios";

// Define the base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Define types for payment management
export interface PaymentTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
  receiptNo?: string;
  studentName?: string;
  roomNumber?: string;
  paymentMethod?: string;
  reminders?: number;
  dueDate?: string;
}

export interface StudentPaymentSummary {
  totalPaid: string;
  due: string;
  nextPayment: string;
  dueDate: string;
  paymentStatus: string;
}

export interface StaffPaymentSummary {
  totalCollected: string;
  pendingAmount: string;
  dueAmount: string;
  percentageCollected: string;
}

export interface StudentPaymentData {
  summary: StudentPaymentSummary;
  transactions: PaymentTransaction[];
  pendingPayments: PaymentTransaction[];
}

export interface StaffPaymentData {
  summary: StaffPaymentSummary;
  recentTransactions: PaymentTransaction[];
  pendingPayments: PaymentTransaction[];
}

// Payment service functions
const paymentService = {
  // Get student payment data
  getStudentPayments: async (): Promise<StudentPaymentData> => {
    try {
      const response = await axios.get(`${API_URL}/payments/student`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student payments:", error);
      // Return mock data as fallback
      return {
        summary: {
          totalPaid: "₹75,000",
          due: "₹0",
          nextPayment: "₹25,000",
          dueDate: "15 Jan 2025",
          paymentStatus: "Paid",
        },
        transactions: [
          {
            id: "t1",
            date: "12 Oct 2024",
            description: "Hostel Fee - Term 1",
            amount: "₹25,000",
            status: "Paid",
            receiptNo: "RCPT-2024-001",
          },
          {
            id: "t2",
            date: "15 Jul 2024",
            description: "Hostel Fee - Term 3 (Previous Academic Year)",
            amount: "₹25,000",
            status: "Paid",
            receiptNo: "RCPT-2023-003",
          },
          {
            id: "t3",
            date: "15 Apr 2024",
            description: "Hostel Fee - Term 2 (Previous Academic Year)",
            amount: "₹25,000",
            status: "Paid",
            receiptNo: "RCPT-2023-002",
          },
          {
            id: "t4",
            date: "15 Jan 2024",
            description: "Hostel Fee - Term 1 (Previous Academic Year)",
            amount: "₹25,000",
            status: "Paid",
            receiptNo: "RCPT-2023-001",
          },
        ],
        pendingPayments: [],
      };
    }
  },

  // Get staff payment data
  getStaffPayments: async (): Promise<StaffPaymentData> => {
    try {
      const response = await axios.get(`${API_URL}/payments/staff`);
      return response.data;
    } catch (error) {
      console.error("Error fetching staff payments:", error);
      // Return mock data as fallback
      return {
        summary: {
          totalCollected: "₹2,75,000",
          pendingAmount: "₹50,000",
          dueAmount: "₹3,25,000",
          percentageCollected: "84.6%",
        },
        recentTransactions: [
          {
            id: "t1",
            date: "12 Oct 2024",
            studentName: "John Student",
            roomNumber: "A-101",
            description: "Hostel Fee - Term 1",
            amount: "₹25,000",
            status: "Paid",
            paymentMethod: "Online",
          },
          {
            id: "t2",
            date: "11 Oct 2024",
            studentName: "Mary Johnson",
            roomNumber: "A-102",
            description: "Hostel Fee - Term 1",
            amount: "₹25,000",
            status: "Paid",
            paymentMethod: "Bank Transfer",
          },
          {
            id: "t3",
            date: "10 Oct 2024",
            studentName: "Robert Williams",
            roomNumber: "B-201",
            description: "Hostel Fee - Term 1",
            amount: "₹25,000",
            status: "Paid",
            paymentMethod: "Cash",
          },
        ],
        pendingPayments: [
          {
            id: "p1",
            date: "15 Oct 2024",
            dueDate: "15 Oct 2024",
            studentName: "Jane Smith",
            roomNumber: "B-202",
            description: "Hostel Fee - Term 1",
            amount: "₹25,000",
            status: "Pending",
            reminders: 2,
          },
          {
            id: "p2",
            date: "15 Oct 2024",
            dueDate: "15 Oct 2024",
            studentName: "Michael Brown",
            roomNumber: "C-101",
            description: "Hostel Fee - Term 1",
            amount: "₹25,000",
            status: "Pending",
            reminders: 1,
          },
        ],
      };
    }
  },

  // Make a payment
  makePayment: async (paymentData: { amount: string; description: string; paymentMethod: string }): Promise<void> => {
    try {
      await axios.post(`${API_URL}/payments/pay`, paymentData);
    } catch (error) {
      console.error("Error making payment:", error);
      throw error;
    }
  },

  // Get receipt for a payment
  getReceipt: async (receiptNo: string): Promise<Blob> => {
    try {
      const response = await axios.get(`${API_URL}/payments/receipt/${receiptNo}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error getting receipt:", error);
      throw error;
    }
  },

  // Send payment reminder to a student
  sendPaymentReminder: async (reminderData: { studentId: string; message: string }): Promise<void> => {
    try {
      await axios.post(`${API_URL}/payments/remind`, reminderData);
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      throw error;
    }
  },

  // Record a payment (for staff)
  recordPayment: async (paymentId: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/payments/record/${paymentId}`);
    } catch (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  },
};

export default paymentService;
