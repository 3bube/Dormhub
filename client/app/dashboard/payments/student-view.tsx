"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Download,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { StudentPaymentData } from "@/services/PaymentService";
import paymentService from "@/services/PaymentService";

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case "overdue":
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          <AlertCircle className="mr-1 h-3 w-3" /> Overdue
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Define schema for making a payment
const makePaymentSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(3, "Description is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

export default function StudentPaymentsView({ data }: { data: StudentPaymentData }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMakingPayment, setIsMakingPayment] = useState(false);
  const [feeStructure, setFeeStructure] = useState<any>(null);

  // Form for making a payment
  const paymentForm = useForm<z.infer<typeof makePaymentSchema>>({
    resolver: zodResolver(makePaymentSchema),
    defaultValues: {
      amount: "",
      description: "",
      paymentMethod: "upi",
    },
  });

  // Handle making a payment
  const onMakePayment = async (values: z.infer<typeof makePaymentSchema>) => {
    try {
      setIsMakingPayment(true);
      await paymentService.makePayment({
        amount: parseFloat(values.amount),
        description: values.description,
        paymentMethod: values.paymentMethod,
      });
      toast.success("Payment made successfully");
      paymentForm.reset();
      // Close modal
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error("Error making payment:", error);
      toast.error("Failed to make payment. Please try again.");
    } finally {
      setIsMakingPayment(false);
    }
  };

  // Handle downloading a receipt
  const handleDownloadReceipt = async (receiptNo: string) => {
    try {
      const receipt = await paymentService.getReceipt(receiptNo);
      const url = URL.createObjectURL(receipt);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt-${receiptNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt. Please try again.");
    }
  };

  // Get fee structure when payment modal is opened
  const handleOpenPaymentModal = async () => {
    try {
      const fees = await paymentService.getFeeStructure();
      setFeeStructure(fees);
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error("Error fetching fee structure:", error);
      toast.error("Failed to fetch fee structure. Please try again.");
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "all paid":
        return "text-green-600";
      case "due soon":
        return "text-yellow-600";
      case "overdue":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>
              Overview of your payment history and pending payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Paid
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {data.summary.totalPaid}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Amount Due
                </p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {data.summary.due}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Next Payment
                </p>
                <p className="text-xl font-semibold">{data.summary.nextPayment}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Due Date
                </p>
                <p className="text-xl font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> {data.summary.dueDate}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className={`text-sm font-medium ${getPaymentStatusColor(data.summary.paymentStatus)}`}>
              Status: {data.summary.paymentStatus}
            </p>
            <Button onClick={handleOpenPaymentModal}>
              <CreditCard className="h-4 w-4 mr-2" /> Make Payment
            </Button>
          </CardFooter>
        </Card>

        {/* Pending Payments Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>
              Upcoming payments that need to be completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.pendingPayments.length > 0 ? (
              <div className="space-y-4">
                {data.pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" /> Due: {payment.dueDate}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="font-semibold mr-2">{payment.amount}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                <p className="text-lg font-medium">No Pending Payments</p>
                <p className="text-sm text-muted-foreground">
                  You're all caught up with your payments!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View your past payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.length > 0 ? (
                  data.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{transaction.receiptNo}</TableCell>
                      <TableCell>
                        {transaction.receiptNo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(transaction.receiptNo)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No payment history available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Make Payment Dialog */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>
              Complete your payment with your preferred payment method
            </DialogDescription>
          </DialogHeader>
          {feeStructure && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <h4 className="font-medium mb-2">Fee Structure Reference</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Hostel Fee: {feeStructure.hostelFee}</div>
                <div>Mess Fee: {feeStructure.messFee}</div>
                <div>Security Deposit: {feeStructure.securityDeposit}</div>
                <div>Utility Fee: {feeStructure.utilityFee}</div>
              </div>
            </div>
          )}
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onMakePayment)} className="space-y-4 py-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Hostel Fee for Term 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="net_banking">Net Banking</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isMakingPayment}>
                  {isMakingPayment ? "Processing..." : "Make Payment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
