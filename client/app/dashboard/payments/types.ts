export type PaymentStatus = "Paid" | "Pending" | "Overdue";

export interface PaymentTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: PaymentStatus;
  receiptNo?: string;
}

export interface StudentPaymentData {
  summary: {
    totalPaid: string;
    due: string;
    nextPayment: string;
    dueDate: string;
    paymentStatus: string;
  };
  transactions: PaymentTransaction[];
  pendingPayments: any[]; // Consider defining a more specific type for pending payments
}
