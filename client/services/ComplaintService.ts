// Define the base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
import axios from "axios";

// Define types for complaint management
export interface Complaint {
  id: string;
  studentId?: string;
  length?: number;
  studentName?: string;
  roomNumber?: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "resolved" | "closed" | string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
  resolution?: string;
  attachments?: string[];
  responses?: ComplaintResponse[];
}

export interface ComplaintResponse {
  id: string;
  responder: string;
  message: string;
  timestamp: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}

export interface ComplaintsData {
  status?: string;
  length?: number;
  complaints: Complaint[];
  stats: ComplaintStats;
  categories?: Record<string, number>;
}

// Define mock data for complaints
const STUDENT_COMPLAINTS_DATA: ComplaintsData = {
  complaints: [
    {
      id: "c1",
      title: "Flickering Light in Room",
      category: "Electrical",
      description:
        "The main light in my room has been flickering for the past two days.",
      status: "in-progress",
      priority: "medium",
      createdAt: "10 Oct 2024",
      assignedTo: "Maintenance Team",
      responses: [
        {
          id: "r1",
          responder: "John Maintenance",
          message: "We'll check this issue tomorrow morning.",
          timestamp: "11 Oct 2024, 10:30 AM",
        },
      ],
    },
    {
      id: "c2",
      title: "Water Leakage from Bathroom",
      category: "Plumbing",
      description: "There's water leaking from the bathroom sink pipe.",
      status: "resolved",
      priority: "high",
      createdAt: "5 Oct 2024",
      assignedTo: "Maintenance Team",
      responses: [
        {
          id: "r1",
          responder: "John Maintenance",
          message: "We'll check this issue immediately.",
          timestamp: "5 Oct 2024, 2:30 PM",
        },
        {
          id: "r2",
          responder: "John Maintenance",
          message:
            "The issue has been fixed. The pipe was loose and has been tightened.",
          timestamp: "5 Oct 2024, 4:45 PM",
        },
      ],
    },
  ],
  stats: {
    total: 5,
    pending: 1,
    inProgress: 2,
    resolved: 2,
  },
};

const STAFF_COMPLAINTS_DATA: ComplaintsData = {
  complaints: [
    ...STUDENT_COMPLAINTS_DATA.complaints,
    {
      id: "c6",
      title: "Broken Window",
      category: "Maintenance",
      description: "The window in room B-204 is broken and needs replacement.",
      status: "pending",
      priority: "high",
      createdAt: "11 Oct 2024",
      studentName: "David Smith",
      roomNumber: "B-204",
      responses: [],
    },
  ],
  stats: {
    total: 7,
    pending: 2,
    inProgress: 3,
    resolved: 2,
  },
};

// Complaint service functions
const complaintService = {
  // Get all complaints (for staff)
  getAllComplaints: async (): Promise<ComplaintsData> => {
    try {
      const response = await axios.get(`${API_URL}/complaints`);
      
      // Transform API response into expected format
      const complaints = response.data;
      
      // Calculate stats
      const pending = complaints.filter(c => c.status === "pending").length;
      const inProgress = complaints.filter(c => c.status === "in-progress").length;
      const resolved = complaints.filter(c => c.status === "resolved").length;
      const closed = complaints.filter(c => c.status === "closed").length;
      
      return {
        complaints: complaints,
        stats: {
          total: complaints.length,
          pending: pending,
          inProgress: inProgress,
          resolved: resolved + closed
        }
      };
    } catch (error) {
      console.error("Error fetching all complaints:", error);
      // Return mock data as fallback
      return STAFF_COMPLAINTS_DATA;
    }
  },

  // Get user complaints (for students)
  getUserComplaints: async (): Promise<ComplaintsData> => {
    try {
      const response = await axios.get(`${API_URL}/complaints/user`);
      
      // Transform API response into expected format
      const complaints = response.data;
      
      // Calculate stats
      const pending = complaints.filter(c => c.status === "pending").length;
      const inProgress = complaints.filter(c => c.status === "in-progress").length;
      const resolved = complaints.filter(c => c.status === "resolved").length;
      const closed = complaints.filter(c => c.status === "closed").length;
      
      return {
        complaints: complaints,
        stats: {
          total: complaints.length,
          pending: pending,
          inProgress: inProgress,
          resolved: resolved + closed
        }
      };
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      // Return mock data as fallback
      return STUDENT_COMPLAINTS_DATA;
    }
  },

  // Create a new complaint
  createComplaint: async (
    complaintData: Partial<Complaint>
  ): Promise<Complaint> => {
    try {
      const response = await axios.post(`${API_URL}/complaints`, complaintData);
      return response.data;
    } catch (error) {
      console.error("Error creating complaint:", error);
      throw error;
    }
  },

  // Update a complaint
  updateComplaint: async (
    id: string,
    updateData: Partial<Complaint>
  ): Promise<Complaint> => {
    try {
      const response = await axios.put(
        `${API_URL}/complaints/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating complaint:", error);
      throw error;
    }
  },

  // Add a response to a complaint
  addResponse: async (
    complaintId: string,
    responseData: Partial<ComplaintResponse>
  ): Promise<Complaint> => {
    try {
      const response = await axios.post(
        `${API_URL}/complaints/${complaintId}/comments`,
        responseData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding response to complaint:", error);
      throw error;
    }
  },

  // Get complaint by ID
  getComplaintById: async (id: string): Promise<Complaint> => {
    try {
      const response = await axios.get(`${API_URL}/complaints/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching complaint ID ${id}:`, error);
      throw error;
    }
  },

  // Get complaint categories
  getComplaintCategories: async (): Promise<string[]> => {
    try {
      const response = await axios.get(`${API_URL}/complaints/categories`);
      return response.data;
    } catch (error) {
      console.error("Error fetching complaint categories:", error);
      // Return mock categories as fallback
      return ["Electrical", "Plumbing", "Network", "Housekeeping", "Maintenance"];
    }
  },
};

export default complaintService;
