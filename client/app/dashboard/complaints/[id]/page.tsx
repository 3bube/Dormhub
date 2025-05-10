"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Send, UserCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import complaintService, { Complaint, ComplaintResponse } from "@/services/ComplaintService";

// Define form validation schema for the response
const responseSchema = z.object({
  message: z.string().min(5, "Response must be at least 5 characters"),
});

// Define form validation schema for status update
const statusUpdateSchema = z.object({
  status: z.string().min(1, "Please select a status"),
  assignedTo: z.string().optional(),
});

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Initialize response form
  const responseForm = useForm<z.infer<typeof responseSchema>>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      message: "",
    },
  });

  // Initialize status update form
  const statusForm = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: "",
      assignedTo: "",
    },
  });

  // Fetch complaint details
  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const complaintId = Array.isArray(id) ? id[0] : id;
        
        // First try to find the complaint in the full list
        let complaintData;
        if (user?.role === 'staff') {
          const allComplaints = await complaintService.getAllComplaints();
          complaintData = allComplaints.complaints.find(c => c.id === complaintId);
        } else {
          const userComplaints = await complaintService.getUserComplaints();
          complaintData = userComplaints.complaints.find(c => c.id === complaintId);
        }
        
        if (complaintData) {
          setComplaint(complaintData);
          
          // Set default values for status form if user is staff
          if (user?.role === 'staff') {
            statusForm.setValue("status", complaintData.status);
            statusForm.setValue("assignedTo", complaintData.assignedTo || "");
          }
        }
        
        if (!complaintData) {
          toast.error("Complaint not found");
          router.push("/dashboard/complaints");
        }
      } catch (error) {
        console.error("Error fetching complaint:", error);
        toast.error("Failed to load complaint details");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchComplaint();
    }
  }, [id, user, router, statusForm]);

  // Handle sending a response
  const onSubmitResponse = async (data: z.infer<typeof responseSchema>) => {
    if (!complaint) return;
    
    try {
      setSubmitting(true);
      
      // Create response data
      const responseData = {
        responder: user?.name || user?.email || 'User',
        message: data.message,
        timestamp: format(new Date(), 'dd MMM yyyy, h:mm a'),
      };
      
      // Add response to the complaint
      await complaintService.addResponse(complaint.id, responseData);
      
      // Refresh the complaint data
      const complaintId = Array.isArray(id) ? id[0] : id;
      let updatedComplaint;
      
      if (user?.role === 'staff') {
        const allComplaints = await complaintService.getAllComplaints();
        updatedComplaint = allComplaints.complaints.find(c => c.id === complaintId);
      } else {
        const userComplaints = await complaintService.getUserComplaints();
        updatedComplaint = userComplaints.complaints.find(c => c.id === complaintId);
      }
      
      if (updatedComplaint) {
        setComplaint(updatedComplaint);
      }
      
      toast.success('Response sent successfully');
      responseForm.reset();
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status update
  const onUpdateStatus = async (data: z.infer<typeof statusUpdateSchema>) => {
    if (!complaint) return;
    
    try {
      setUpdatingStatus(true);
      
      // Create update data
      const updateData: Partial<Complaint> = {
        status: data.status,
        assignedTo: data.assignedTo || undefined,
      };
      
      // Update complaint
      await complaintService.updateComplaint(complaint.id, updateData);
      
      // Refresh the complaint data
      const complaintId = Array.isArray(id) ? id[0] : id;
      const allComplaints = await complaintService.getAllComplaints();
      const updatedComplaint = allComplaints.complaints.find(c => c.id === complaintId);
      
      if (updatedComplaint) {
        setComplaint(updatedComplaint);
      }
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP 'at' p");
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "in-progress":
      case "in progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    switch (priorityLower) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading complaint...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch the details.
          </p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Complaint not found</h2>
          <p className="text-muted-foreground mb-4">
            The complaint you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/dashboard/complaints">Back to Complaints</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/dashboard/complaints">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Complaints
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{complaint.title}</CardTitle>
              <CardDescription>
                {complaint.studentName ? `Reported by ${complaint.studentName}` : "Anonymous report"} 
                {complaint.roomNumber && ` • Room ${complaint.roomNumber}`} • 
                {complaint.createdAt && ` Submitted on ${formatDate(complaint.createdAt)}`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(complaint.status)}
              {getPriorityBadge(complaint.priority)}
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                {complaint.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                {complaint.description}
              </div>
            </div>

            {user?.role === 'staff' && (
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="font-semibold mb-4">Staff Actions</h3>
                <form onSubmit={statusForm.handleSubmit(onUpdateStatus)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={statusForm.watch("status")}
                        onValueChange={(value) => statusForm.setValue("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assigned To</label>
                      <Select
                        value={statusForm.watch("assignedTo")}
                        onValueChange={(value) => statusForm.setValue("assignedTo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maintenance Team">Maintenance Team</SelectItem>
                          <SelectItem value="IT Support">IT Support</SelectItem>
                          <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={updatingStatus}>
                    {updatingStatus ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Complaint"
                    )}
                  </Button>
                </form>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-4">Communication History</h3>
              {complaint.responses && complaint.responses.length > 0 ? (
                <div className="space-y-4">
                  {complaint.responses.map((response, index) => (
                    <div
                      key={response.id || index}
                      className="p-4 border rounded-md shadow-sm"
                    >
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <UserCircle2 className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="font-medium">{response.responder}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(response.timestamp)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <p className="text-muted-foreground">No responses yet</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-4">Add Response</h3>
              <form onSubmit={responseForm.handleSubmit(onSubmitResponse)}>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your response here..."
                    className="h-32"
                    {...responseForm.register("message")}
                  />
                  {responseForm.formState.errors.message && (
                    <p className="text-sm text-red-500">
                      {responseForm.formState.errors.message.message}
                    </p>
                  )}
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Response
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}