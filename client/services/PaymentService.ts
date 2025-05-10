import axios from "axios";

// Define the base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Define types for payment management
export interface PaymentTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
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
  // Get student payment data - compatible with the backend API
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

  // Get staff payment data - compatible with both real API and mock data
  getStaffPayments: async (): Promise<StaffPaymentData> => {
    try {
      // Get payments from API
      const response = await axios.get(`${API_URL}/payments`);
      const allPayments = Array.isArray(response.data) ? response.data : [];
      
      // Calculate payment statistics
      const paidPayments = allPayments.filter(p => p && p.status === 'paid');
      const overduePayments = allPayments.filter(p => p && p.status === 'overdue');
      const pendingOnlyPayments = allPayments.filter(p => p && p.status === 'pending');
      
      // Calculate totals with proper number conversion
      const totalCollected = paidPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
      const pendingAmount = pendingOnlyPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
      const dueAmount = overduePayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
      
      // Calculate percentage
      const totalAmount = totalCollected + pendingAmount + dueAmount;
      const percentageCollected = totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0;
      
      // Format recent transactions (paid payments)
      const recentTransactions = paidPayments
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 10) // Get only 10 most recent transactions
        .map(payment => ({
          id: payment._id || payment.id || `payment-${Date.now()}`,
          date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          description: payment.description || 'Payment',
          amount: `₹${(Number(payment.amount) || 0).toLocaleString()}`,
          status: capitalizeFirstLetter(payment.status || 'paid'),
          studentName: payment.studentName || (payment.student ? payment.student.name : 'Unknown'),
          roomNumber: payment.roomNumber || (payment.student ? payment.student.roomNumber : 'N/A'),
          receiptNo: payment.receiptNo || '',
          paymentMethod: payment.paymentMethod || 'Online',
        }));
      
      // Combine pending and overdue payments
      const allPendingPayments = [...pendingOnlyPayments, ...overduePayments];
      const formattedPendingPayments = allPendingPayments
        .map(payment => ({
          id: payment._id || payment.id || `pending-${Date.now()}`,
          date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          description: payment.description || 'Pending Payment',
          amount: `₹${(Number(payment.amount) || 0).toLocaleString()}`,
          status: capitalizeFirstLetter(payment.status || 'pending'),
          studentName: payment.studentName || (payment.student ? payment.student.name : 'Unknown'),
          roomNumber: payment.roomNumber || (payment.student ? payment.student.roomNumber : 'N/A'),
          dueDate: payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : new Date().toLocaleDateString(),
          reminders: payment.reminders || 0,
        }));
      
      return {
        summary: {
          totalCollected: `₹${totalCollected.toLocaleString()}`,
          pendingAmount: `₹${pendingAmount.toLocaleString()}`,
          dueAmount: `₹${dueAmount.toLocaleString()}`,
          percentageCollected: `${percentageCollected}%`,
        },
        recentTransactions: recentTransactions,
        pendingPayments: formattedPendingPayments,
      };
    } catch (error) {
      console.error("Error fetching staff payments:", error);
      throw error;
    }
  },

  // Make a payment
  makePayment: async (paymentData: {
    amount: number;
    description: string;
    paymentMethod: string;
  }): Promise<void> => {
    try {
      await axios.post(`${API_URL}/payments`, {
        ...paymentData,
        date: new Date().toISOString(),
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error making payment:", error);
      throw error;
    }
  },

  // Get receipt for a payment
  getReceipt: async (receiptNo: string): Promise<Blob> => {
    try {
      const response = await axios.get(`${API_URL}/payments/receipt/${receiptNo}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error("Error getting receipt:", error);
      throw error;
    }
  },

  // Send payment reminder to a student
  sendPaymentReminder: async (reminderData: {
    studentId: string;
    message: string;
    paymentId: string;
  }): Promise<void> => {
    try {
      await axios.post(`${API_URL}/payments/send-reminders`, reminderData);
      return Promise.resolve();
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      throw error;
    }
  },

  // Record a payment (for staff)
  recordPayment: async (paymentData: {
    studentId: string;
    amount: number;
    description: string;
    paymentMethod: string;
    receiptNo?: string;
  }): Promise<void> => {
    try {
      await axios.post(`${API_URL}/payments/record`, paymentData);
      return Promise.resolve();
    } catch (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  },

  // Get fee structure
  getFeeStructure: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}/payments/fee-structure`);
      return response.data;
    } catch (error) {
      console.error("Error fetching fee structure:", error);
      throw error;
    }
  },
};

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to determine payment status
function getPaymentStatus(pendingPayments: any[]): string {
  if (pendingPayments.length === 0) return "All Paid";

  const overduePayments = pendingPayments.filter(p => 
    p.status === 'overdue' || 
    (p.status === 'pending' && new Date(p.dueDate) < new Date())
  );

  if (overduePayments.length > 0) return "Overdue";

  const soonDuePayments = pendingPayments.filter(p => {
    const dueDate = new Date(p.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  if (soonDuePayments.length > 0) return "Due Soon";
  return "Upcoming";
}

export default paymentService;
