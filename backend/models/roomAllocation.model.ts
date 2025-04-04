import mongoose, { Schema, Document, Types } from "mongoose";

interface IRoomAllocation extends Document {
  studentId: { id: Types.ObjectId; ref: string };
  roomId: { id: Types.ObjectId; ref: string };
  bedId: { id: Types.ObjectId; ref: string };
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomAllocationSchema = new Schema<IRoomAllocation>({
  studentId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  roomId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "Room" },
  },
  bedId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "Bed" },
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance", "full"],
    default: "available",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RoomAllocation = mongoose.model<IRoomAllocation>(
  "RoomAllocation",
  RoomAllocationSchema
);

export default RoomAllocation;
