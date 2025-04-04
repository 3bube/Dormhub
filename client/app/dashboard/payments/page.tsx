"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Download,
  FileText,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import paymentService from "@/services/PaymentService";
import { toast } from "sonner";
import { StudentPaymentData, PaymentStatus } from "./types";

// Define payment data with proper typing
const STUDENT_PAYMENTS_DATA: StudentPaymentData = {
  summary: {
    totalPaid: "₹45,000",
    due: "₹15,000",
    nextPayment: "₹15,000",
    dueDate: "15 Dec 2024",
    paymentStatus: "Due Soon",
  },
  transactions: [
    {
      id: "tx1",
      date: "10 Aug 2024",
      description: "Hostel Fee - First Semester",
      amount: "₹30,000",
      status: "Paid" as PaymentStatus, // Use the union type
      receiptNo: "REC-2024-001",
    },
    {
      id: "tx2",
      date: "15 Sep 2024",
      description: "Mess Fee - First Semester",
      amount: "₹15,000",
      status: "Paid" as PaymentStatus,
      receiptNo: "REC-2024-002",
    },
  ],
  pendingPayments: [],
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Paid":
      return (
        <Badge variant="default">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
        </Badge>
      );
    case "Pending":
      return (
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case "Overdue":
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" /> Overdue
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentPaymentData, setStudentPaymentData] =
    useState<StudentPaymentData>(STUDENT_PAYMENTS_DATA);
  const [staffData, setStaffData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentsData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user?.role === "student") {
          const data = await paymentService.getStudentPayments();
          setStudentPaymentData(data);
        } else {
          const data = await paymentService.getStaffPayments();
          setStaffData(data);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setError("Failed to load payment data. Please try again later.");

        // Fallback to mock data if fetch fails
        if (user?.role === "student") {
          setStudentPaymentData(STUDENT_PAYMENTS_DATA);
        }
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

      {user?.role === "student" ? (
        <StudentPaymentsView data={studentPaymentData} />
      ) : (
        <StaffPaymentsView data={staffData} />
      )}
    </div>
  );
}

function StudentPaymentsView({ data }: { data: StudentPaymentData }) {
  const [activeTab, setActiveTab] = useState("history");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(data.summary.nextPayment);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // Handle payment submission
  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Call payment service to make payment
      await paymentService.makePayment({
        amount: paymentAmount,
        description: "Hostel Fee Payment",
        paymentMethod: paymentMethod,
      });

      // Show success message
      toast.message("Payment Successful", {
        description: `Your payment of ${paymentAmount} has been processed successfully.`,
      });

      // Close modal and refresh page
      setShowPaymentModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Payment failed:", error);
      toast.message("Payment Failed", {
        description:
          "There was an error processing your payment. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle receipt download
  const handleDownloadReceipt = async (receiptNo: string) => {
    try {
      const receiptBlob = await paymentService.getReceipt(receiptNo);

      // Create download link
      const url = window.URL.createObjectURL(receiptBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt-${receiptNo}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.message("Download Failed", {
        description: "Failed to download receipt. Please try again later.",
      });
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalPaid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.due}</div>
            {data.summary.due !== "₹0" && (
              <p className="text-xs text-muted-foreground mt-1">
                Due by {data.summary.dueDate}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.nextPayment}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Due on {data.summary.dueDate}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {getStatusBadge(data.summary.paymentStatus)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowPaymentModal(true)}>
          <CreditCard className="mr-2 h-4 w-4" />
          Make Payment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View your payment history and download receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          {transaction.status === "Paid" &&
                            transaction.receiptNo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDownloadReceipt(transaction.receiptNo!)
                                }
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Receipt
                              </Button>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    No payment history
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                    You haven&apos;t made any payments yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>
                View your upcoming and pending payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.pendingPayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pendingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.dueDate}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPaymentAmount(payment.amount);
                              setShowPaymentModal(true);
                            }}
                          >
                            Pay Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    No pending payments
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                    You don&apos;t have any pending payments at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Make Payment</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="text"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                  <option value="net-banking">Net Banking</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span> Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StaffPaymentsView({ data }: { data: any }) {
  return <div>Staff Payments View</div>;
}
