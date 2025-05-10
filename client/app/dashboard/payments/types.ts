// Use string instead of specific enum to match PaymentService types
export type PaymentStatus = string;

// Base payment transaction interface
export interface PaymentTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  receiptNo?: string;
  dueDate?: string;
  paymentMethod?: string;
}

// Extended transaction for staff view (includes student info)
export interface StaffPaymentTransaction extends PaymentTransaction {
  studentName: string;
  roomNumber: string;
  reminders?: number;
}

// Student payment data structure
export interface StudentPaymentData {
  summary: {
    totalPaid: string;
    due: string;
    nextPayment: string;
    dueDate: string;
    paymentStatus: string;
  };
  transactions: PaymentTransaction[];
  pendingPayments: PaymentTransaction[];
}

// Staff payment data structure
export interface StaffPaymentData {
  summary: {
    totalCollected: string;
    pendingAmount: string;
    dueAmount: string;
    percentageCollected: string;
  };
  recentTransactions: StaffPaymentTransaction[];
  pendingPayments: StaffPaymentTransaction[];
}

// Fee structure interface
export interface FeeStructure {
  hostelFee: string;
  messFee: string;
  securityDeposit: string;
  utilityFee: string;
  miscellaneous: string;
}
