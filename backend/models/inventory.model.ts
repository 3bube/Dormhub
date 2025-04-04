import mongoose, { Schema, Document, Types } from "mongoose";

interface IInventory extends Document {
  roomId: { id: Types.ObjectId; ref: string };
  studentId: { id: Types.ObjectId; ref: string };
  item: string;
  condition: string;
  dateProvided: Date;
  lastInspected: Date;
  notes: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>({
  roomId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "Room" },
  },
  studentId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  item: { type: String, required: true },
  condition: { type: String, required: true },
  dateProvided: { type: Date, required: true },
  lastInspected: { type: Date, required: true },
  notes: { type: String },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance", "full"],
    default: "available",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Inventory = mongoose.model<IInventory>("Inventory", InventorySchema);

export default Inventory;
