import mongoose, { Schema, Document, Types } from "mongoose";

interface IResourceRequest extends Document {
  studentId: { id: Types.ObjectId; ref: string };
  resourceId: { id: Types.ObjectId; ref: string };
  quantity: number;
  reason: string;
  status: string;
  requestDate: Date;
  approvedDate: Date;
  deliveryDate: Date;
  approvedBy: { id: Types.ObjectId; ref: string };
  denialReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceRequestSchema = new Schema<IResourceRequest>({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
    required: true,
  },
  quantity: { type: Number, default: 1 },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "in_progress", "delivered", "denied"],
    default: "pending",
  },
  requestDate: { type: Date, default: Date.now },
  approvedDate: { type: Date },
  deliveryDate: { type: Date },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    sparse: true,
  },
  denialReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ResourceRequest = mongoose.model<IResourceRequest>(
  "ResourceRequest",
  ResourceRequestSchema
);

export default ResourceRequest;
