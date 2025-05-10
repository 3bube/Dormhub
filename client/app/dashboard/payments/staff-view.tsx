"use client";

import { useState } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FileText,
  Send,
  Plus,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { StaffPaymentData, PaymentTransaction } from "@/services/PaymentService";
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

// Define schema for recording a payment
const recordPaymentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(3, "Description is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  receiptNo: z.string().optional(),
});

// Define schema for sending a reminder
const reminderSchema = z.object({
  message: z.string().min(5, "Message is required"),
});

export default function StaffPaymentsView({ data }: { data: StaffPaymentData }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PaymentTransaction | null>(null);

  // Form for recording a payment
  const recordPaymentForm = useForm<z.infer<typeof recordPaymentSchema>>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      studentId: "",
      amount: "",
      description: "",
      paymentMethod: "cash",
      receiptNo: "",
    },
  });

  // Form for sending a reminder
  const reminderForm = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      message: "This is a friendly reminder that your payment is due. Please make the payment as soon as possible.",
    },
  });

  // Handle recording a payment
  const onRecordPayment = async (values: z.infer<typeof recordPaymentSchema>) => {
    try {
      setIsRecordingPayment(true);
      await paymentService.recordPayment({
        studentId: values.studentId,
        amount: parseFloat(values.amount),
        description: values.description,
        paymentMethod: values.paymentMethod,
        receiptNo: values.receiptNo,
      });
      toast.success("Payment recorded successfully");
      recordPaymentForm.reset();
      // Close dialog
      setIsRecordingPayment(false);
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment. Please try again.");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  // Handle sending a reminder
  const onSendReminder = async (values: z.infer<typeof reminderSchema>) => {
    if (!selectedStudent) return;

    try {
      setIsSendingReminder(true);
      await paymentService.sendPaymentReminder({
        studentId: selectedStudent.id,
        message: values.message,
        paymentId: selectedStudent.id,
      });
      toast.success(`Reminder sent to ${selectedStudent.studentName}`);
      reminderForm.reset();
      // Close dialog
      setIsSendingReminder(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder. Please try again.");
    } finally {
      setIsSendingReminder(false);
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

  return (
    <div className="w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.summary.totalCollected}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.summary.pendingAmount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.summary.dueAmount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.percentageCollected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mr-2">
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a new payment from a student. This will be added to their payment history.
              </DialogDescription>
            </DialogHeader>
            <Form {...recordPaymentForm}>
              <form onSubmit={recordPaymentForm.handleSubmit(onRecordPayment)} className="space-y-4 py-4">
                <FormField
                  control={recordPaymentForm.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={recordPaymentForm.control}
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
                  control={recordPaymentForm.control}
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
                  control={recordPaymentForm.control}
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
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="debit_card">Debit Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={recordPaymentForm.control}
                  name="receiptNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter receipt number" {...field} />
                      </FormControl>
                      <FormDescription>
                        If left blank, a receipt number will be generated automatically.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isRecordingPayment}>
                    {isRecordingPayment ? "Recording..." : "Record Payment"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for Recent Transactions and Pending Payments */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
        </TabsList>

        {/* Recent Transactions */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                View all recent payment transactions made by students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.studentName}</TableCell>
                        <TableCell>{transaction.roomNumber}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          {transaction.receiptNo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReceipt(transaction.receiptNo!)}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Payments */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>
                View and manage pending payments from students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reminders</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pendingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.studentName}</TableCell>
                        <TableCell>{payment.roomNumber}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>{payment.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>{payment.reminders || 0}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStudent(payment)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Remind
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Send Payment Reminder</DialogTitle>
                                <DialogDescription>
                                  Send a reminder to {payment.studentName} for the pending payment.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...reminderForm}>
                                <form onSubmit={reminderForm.handleSubmit(onSendReminder)} className="space-y-4 py-4">
                                  <FormField
                                    control={reminderForm.control}
                                    name="message"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder="Enter message"
                                            className="h-32"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <DialogFooter>
                                    <Button type="submit" disabled={isSendingReminder}>
                                      {isSendingReminder ? "Sending..." : "Send Reminder"}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
