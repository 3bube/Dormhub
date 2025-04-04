import mongoose, { Schema, Document, Types } from "mongoose";

interface IResource extends Document {
  name: string;
  description: string;
  category: string;
  status: string;
  totalQuantity: number;
  availableQuantity: number;
  threshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  totalQuantity: { type: Number, required: true },
  availableQuantity: { type: Number, required: true },
  threshold: { type: Number, required: true },
  status: {
    type: String,
    enum: ["available", "low_stock", "out_of_stock"],
    default: "available",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Resource = mongoose.model<IResource>("Resource", ResourceSchema);

export default Resource;
