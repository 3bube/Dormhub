export type RequestStatus = "Pending" | "Approved" | "Rejected" | "Delivered";

export interface InventoryRequest {
  id: string;
  item: string;
  reason: string;
  status: RequestStatus;
  requestDate: string;
  deliveryDate?: string;
  studentName?: string;
  roomNumber?: string;
}

export interface InventoryItem {
  id: string;
  item: string;
  condition: string;
  dateProvided: string;
}

export interface StudentInventoryData {
  requests: InventoryRequest[];
  inventory: InventoryItem[];
}

export interface StaffInventoryData {
  pendingRequests: InventoryRequest[];
  approvedRequests: InventoryRequest[];
  inventory: InventoryItem[];
}

export type InventoryData = StudentInventoryData | StaffInventoryData;

// Type guard to check if data is StaffInventoryData
export function isStaffData(data: InventoryData): data is StaffInventoryData {
  return "pendingRequests" in data;
}

// Type guard to check if data is StudentInventoryData
export function isStudentData(
  data: InventoryData
): data is StudentInventoryData {
  return "requests" in data;
}
