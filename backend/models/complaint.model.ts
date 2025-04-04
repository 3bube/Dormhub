import mongoose, { Schema, Document, Types } from "mongoose";

interface IComplaint extends Document {
  studentId: { id: Types.ObjectId; ref: string };
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  assignedTo: { id: Types.ObjectId; ref: "User" };
  resolution: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>({
  studentId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  title: { required: true, type: String },
  description: { required: true, type: String },
  category: {
    required: true,
    type: String,
    enum: [
      "Electrical",
      "Plumbing",
      "Furniture",
      "Housekeeping",
      "Network",
      "Mess",
      "Security",
      "Resident Issue",
      "Other",
    ],
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved", "closed"],
    default: "pending",
  },
  location: { type: String },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    sparse: true,
  },
  resolution: { type: String },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

const Complaint = mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;
