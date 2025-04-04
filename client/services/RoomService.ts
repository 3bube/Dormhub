import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Define custom type for MongoDB ObjectId
type ObjectId = string;

// Define types for room management
export interface Room {
  _id: ObjectId;
  id?: string; // Added for frontend compatibility
  roomNumber: string;
  floor: string;
  building?: string;
  capacity: number;
  type: string;
  occupied?: number; // Number of beds occupied
  status: string;
  amenities: string[];
  price?: number;
}

export interface Bed {
  _id: ObjectId;
  bedNumber: number;
  roomId: {
    id: string;
    reference: string;
  };
  status: string;
  occupiedBy?: {
    id: string;
    reference: string;
  };
  isOccupied?: boolean;
  occupantName?: string;
}

export interface RoomAllocation {
  _id: ObjectId;
  student: {
    id: string;
    reference: string;
    name?: string;
  };
  room: {
    id: string;
    reference: string;
    roomNumber?: string;
  };
  bed: {
    id: string;
    reference: string;
    bedNumber?: number;
  };
  startDate: string;
  endDate?: string;
  status: string;
  paymentConfirmed: boolean;
}

export interface RoomSummary {
  total: number;
  occupied: number;
  vacant: number;
  maintenance: number;
}

export interface RecentAllocation {
  id: string;
  roomNumber: string;
  type: string;
  studentName: string;
  date: string;
}

export interface MaintenanceRequest {
  id: string;
  roomNumber: string;
  issue: string;
  status: string;
  reportedOn: string;
}

// Room Dashboard Data
export interface RoomDashboardData {
  summary: RoomSummary;
  rooms: Room[];
  recentAllocations: RecentAllocation[];
  pendingRequests: MaintenanceRequest[];
  occupancyRate: number;
}

export interface Roommate {
  id: string;
  name: string;
  course: string;
  year: string;
}

export interface RoomIssue {
  id: string;
  title: string;
  status: string;
  reportedOn: string;
}

export interface CurrentRoom {
  roomNumber: string;
  type: string;
  floor: string;
  checkin: string;
  checkout: string;
  amenities: string[];
  roommates: Roommate[];
  issues: RoomIssue[];
}

export interface RoomHistoryItem {
  id: string;
  roomNumber: string;
  type: string;
  period: string;
}

export interface StudentRoomData {
  current: CurrentRoom;
  history: RoomHistoryItem[];
}

export interface RoomAllocationResponse {
  _id: ObjectId;
  student:
    | ObjectId
    | {
        _id: ObjectId;
        reference?: string;
        name?: string;
        course?: string;
        year?: string;
      };
  room:
    | ObjectId
    | {
        _id: ObjectId;
        reference?: string;
        roomNumber?: string;
        type?: string;
      };
  bed?:
    | ObjectId
    | {
        _id: ObjectId;
        reference?: string;
        bedNumber?: number;
      };
  startDate: string;
  endDate?: string;
  status?: string;
  paymentStatus?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceRequestResponse {
  _id: ObjectId;
  room: string;
  issue?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  priority?: string;
  estimatedCompletionDate?: string;
}

// Define types for dashboard data
interface DashboardRoommate {
  _id: string;
  id?: string;
  name?: string;
  course?: string;
  year?: string;
}

interface DashboardComplaint {
  _id: string;
  id?: string;
  issue?: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

interface DashboardRoomHistory {
  _id?: string;
  id?: string;
  roomNumber?: string;
  type?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
}

interface StudentDashboardData {
  room: any;
  allocation: {
    _id: string;
    room: {
      _id: string;
      roomNumber?: string;
      type?: string;
      floor?: string;
      amenities?: string[];
    };
    startDate: string;
    endDate?: string;
  };
  roommates?: DashboardRoommate[];
  complaints?: DashboardComplaint[];
  roomHistory?: DashboardRoomHistory[];
}

// Room service functions
export const roomService = {
  // Get all rooms
  getAllRooms: async (): Promise<Room[]> => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);

      // Map backend data to frontend format if needed
      const rooms = response.data.map((room: Room) => ({
        ...room,
        id: room._id, // Add id property for frontend compatibility
      }));

      return rooms;
    } catch (error) {
      console.error("Get all rooms error:", error);
      // Fallback to mock data in case of error
      return [
        {
          _id: "1",
          id: "1",
          roomNumber: "A101",
          floor: "1",
          capacity: 2,
          type: "double",
          occupied: 1,
          amenities: ["Air Conditioning", "Study Table", "Wardrobe"],
          status: "available",
        },
        {
          _id: "2",
          id: "2",
          roomNumber: "A102",
          floor: "1",
          capacity: 1,
          type: "single",
          occupied: 1,
          amenities: [
            "Air Conditioning",
            "Study Table",
            "Wardrobe",
            "Private Bathroom",
          ],
          status: "full",
        },
      ];
    }
  },

  // Get room by ID
  getRoomById: async (roomId: string): Promise<Room> => {
    try {
      const response = await axios.get(`${API_URL}/rooms/${roomId}`);

      // Add id property for frontend compatibility
      return {
        ...response.data,
        id: response.data._id,
      };
    } catch (error) {
      console.error("Get room by ID error:", error);
      throw error;
    }
  },

  // Get beds in a room
  getBedsInRoom: async (roomId: string): Promise<Bed[]> => {
    try {
      const response = await axios.get(`${API_URL}/rooms/${roomId}/beds`);

      // Map backend data to frontend format
      return response.data.map((bed: Bed) => ({
        ...bed,
        id: bed._id, // Add id property for frontend compatibility
        isOccupied: bed.status === "occupied",
        occupantName: bed.occupiedBy ? "Student" : undefined, // This would be populated from backend
      }));
    } catch (error) {
      console.error("Get beds in room error:", error);
      throw error;
    }
  },

  // Get student's room allocation
  getStudentAllocation: async (
    studentId: string
  ): Promise<RoomAllocation | null> => {
    try {
      const response = await axios.get(
        `${API_URL}/students/${studentId}/allocation`
      );

      if (!response.data) {
        return null;
      }

      // Map backend data to frontend format
      return {
        ...response.data,
        id: response.data._id, // Add id property for frontend compatibility
      };
    } catch (error) {
      console.error("Get student allocation error:", error);
      return null;
    }
  },

  // Allocate room to student
  allocateRoom: async (
    studentId: string,
    roomId: string,
    bedId: string,
    startDate?: Date,
    endDate?: Date,
    paymentConfirmed?: boolean
  ): Promise<RoomAllocation> => {
    try {
      const response = await axios.post(`${API_URL}/rooms/allocate`, {
        studentId,
        roomId,
        bedId,
        startDate: startDate
          ? startDate.toISOString()
          : new Date().toISOString(),
        endDate: endDate ? endDate.toISOString() : undefined,
        paymentConfirmed: paymentConfirmed || false,
      });

      // Map backend data to frontend format
      return {
        ...response.data,
        id: response.data._id, // Add id property for frontend compatibility
      };
    } catch (error) {
      console.error("Allocate room error:", error);
      throw error;
    }
  },

  // Update room allocation
  updateAllocation: async (
    allocationId: string,
    newRoomId?: string,
    newBedId?: string,
    endDate?: Date,
    paymentConfirmed?: boolean
  ): Promise<RoomAllocation> => {
    try {
      const response = await axios.put(
        `${API_URL}/rooms/allocate/${allocationId}`,
        {
          roomId: newRoomId,
          bedId: newBedId,
          endDate: endDate ? endDate.toISOString() : undefined,
          paymentConfirmed,
        }
      );

      // Map backend data to frontend format
      return {
        ...response.data,
        id: response.data._id, // Add id property for frontend compatibility
      };
    } catch (error) {
      console.error("Update allocation error:", error);
      throw error;
    }
  },

  // End room allocation
  endAllocation: async (allocationId: string): Promise<RoomAllocation> => {
    try {
      const response = await axios.delete(
        `${API_URL}/rooms/allocate/${allocationId}`
      );

      // Map backend data to frontend format
      return {
        ...response.data,
        id: response.data._id, // Add id property for frontend compatibility
      };
    } catch (error) {
      console.error("End allocation error:", error);
      throw error;
    }
  },

  // Get available rooms
  getAvailableRooms: async (): Promise<Room[]> => {
    try {
      const response = await axios.get(`${API_URL}/rooms/available`);

      // Map backend data to frontend format
      return response.data.map((room: Room) => ({
        ...room,
        id: room._id, // Add id property for frontend compatibility
      }));
    } catch (error) {
      console.error("Get available rooms error:", error);
      throw error;
    }
  },

  // Get room dashboard data for staff
  getRoomDashboardData: async (): Promise<RoomDashboardData> => {
    try {
      // Get all rooms
      const roomsResponse = await axios.get(`${API_URL}/rooms`);
      const rooms = roomsResponse.data.map((room: Room) => ({
        ...room,
        id: room._id,
      }));

      // Calculate summary
      const total = rooms.length;
      const maintenance = rooms.filter(
        (room: Room) => room.status === "maintenance"
      ).length;
      const occupied = rooms.filter(
        (room: Room) => room.status === "full"
      ).length;
      const vacant = total - occupied - maintenance;

      // Get recent allocations from the API
      const recentAllocationsResponse = await axios.get(
        `${API_URL}/rooms/allocations/recent`
      );
      const recentAllocations = recentAllocationsResponse.data;

      // Get pending maintenance requests from the API
      const pendingRequestsResponse = await axios.get(
        `${API_URL}/rooms/maintenance/pending`
      );
      const pendingRequests = pendingRequestsResponse.data;

      return {
        summary: {
          total,
          occupied,
          vacant,
          maintenance,
        },
        rooms,
        recentAllocations,
        pendingRequests,
        occupancyRate: Math.round((occupied / total) * 100) || 0,
      };
    } catch (error) {
      console.error("Get room dashboard data error:", error);

      // Return mock data as fallback
      return {
        summary: {
          total: 100,
          occupied: 78,
          vacant: 18,
          maintenance: 4,
        },
        occupancyRate: 78,
        rooms: [
          {
            _id: "1",
            id: "1",
            roomNumber: "A-101",
            floor: "1",
            capacity: 1,
            type: "Single",
            occupied: 1,
            status: "full",
            amenities: ["Air Conditioning", "Private Bathroom", "Study Desk"],
          },
          {
            _id: "2",
            id: "2",
            roomNumber: "B-205",
            floor: "2",
            capacity: 3,
            type: "Triple Sharing",
            occupied: 2,
            status: "available",
            amenities: [
              "Air Conditioning",
              "Shared Bathroom",
              "Study Desk",
              "Wardrobe",
            ],
          },
        ],
        recentAllocations: [
          {
            id: "ra1",
            roomNumber: "A-101",
            type: "Single",
            studentName: "John Smith",
            date: "2 days ago",
          },
        ],
        pendingRequests: [
          {
            id: "pr1",
            roomNumber: "D-405",
            issue: "Plumbing Issue",
            status: "Pending",
            reportedOn: "3 days ago",
          },
        ],
      };
    }
  },

  // Create a maintenance request
  createMaintenanceRequest: async (
    roomId: string,
    issueType: string,
    description: string,
    priority: string = "Medium"
  ): Promise<MaintenanceRequest> => {
    try {
      // Use the complaints API to create a maintenance request
      const response = await axios.post(`${API_URL}/complaints`, {
        title: `Room ${roomId} - ${issueType}`,
        description,
        category: issueType,
        priority,
        location: `Room ${roomId}`,
      });

      return response.data;
    } catch (error) {
      console.error("Create maintenance request error:", error);
      throw error;
    }
  },

  // Create a new room
  createRoom: async (roomData: Partial<Room>): Promise<Room> => {
    try {
      const response = await axios.post(`${API_URL}/rooms`, roomData);

      return {
        ...response.data,
        id: response.data._id,
      };
    } catch (error) {
      console.error("Create room error:", error);
      throw error;
    }
  },

  // Get detailed room information
  getDetailedRoomInfo: async (roomId: string): Promise<Room> => {
    try {
      // Get room details
      const room = await roomService.getRoomById(roomId);

      // In a real implementation, you might make additional API calls to get more details
      // For now, we'll just return the room with some additional amenities

      return {
        ...room,
        amenities: room.amenities || [
          "Air Conditioning",
          "Study Table",
          "Wardrobe",
          "Private Bathroom",
        ],
      };
    } catch (error) {
      console.error("Get detailed room info error:", error);
      throw error;
    }
  },

  // Get student room data
  getStudentRoomData: async (): Promise<StudentRoomData> => {
    try {
      // Get the current user's ID from auth context or localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not authenticated");
      }

      // We'll use the dashboard endpoint since it has all the data we need
      const response = await axios.get<StudentDashboardData>(
        `${API_URL}/dashboard/student`
      );

      // Extract room data from the dashboard response
      const dashboardData = response.data;
      const allocation = dashboardData.room;

      console.log(dashboardData);

      if (!allocation) {
        throw new Error("No active room allocation found");
      }

      // Transform the data to match our StudentRoomData interface
      return {
        current: {
          roomNumber: allocation.roomNumber || "Not assigned",
          type: allocation.type || "Standard",
          floor: allocation.floor || "Not specified",
          checkin: new Date(allocation.startDate).toLocaleDateString(),
          checkout: allocation.endDate
            ? new Date(allocation.endDate).toLocaleDateString()
            : "Not specified",
          amenities: allocation.amenities || [
            "Wi-Fi",
            "Study Table",
            "Wardrobe",
            "Basic Furniture",
          ],
          roommates: allocation.roommates || [],
          issues: allocation.issues || [],
        },
        history:
          dashboardData.roomHistory?.map((history: DashboardRoomHistory) => ({
            id:
              history._id ||
              history.id ||
              `history-${Math.random().toString(36).substr(2, 9)}`,
            roomNumber: history.roomNumber || "Unknown Room",
            type: history.type || "Standard",
            period:
              history.period ||
              `${
                history.startDate
                  ? new Date(history.startDate).toLocaleDateString()
                  : "Unknown"
              } - ${
                history.endDate
                  ? new Date(history.endDate).toLocaleDateString()
                  : "Present"
              }`,
          })) || [],
      };
    } catch (error) {
      console.error("Get student room data error:", error);
      // Fallback to mock data in case of error
      return {
        current: {
          roomNumber: "A-101",
          type: "Double Sharing",
          floor: "1st Floor, A Block",
          checkin: "01 Aug 2024",
          checkout: "31 May 2025",
          amenities: [
            "Air Conditioning",
            "Study Table",
            "Wardrobe",
            "High-Speed Internet",
            "Attached Bathroom",
          ],
          roommates: [
            {
              id: "rm1",
              name: "Jane Smith",
              course: "Computer Science",
              year: "2nd Year",
            },
          ],
          issues: [
            {
              id: "i1",
              title: "Leaking tap in bathroom",
              status: "in-progress",
              reportedOn: "15 Sep 2024",
            },
          ],
        },
        history: [
          {
            id: "h1",
            roomNumber: "B-202",
            type: "Triple Sharing",
            period: "Aug 2023 - May 2024",
          },
        ],
      };
    }
  },
};

// Export default for convenience
export default roomService;
