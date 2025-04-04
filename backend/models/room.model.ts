import mongoose, { Schema, Document } from "mongoose";

interface IRoom extends Document {
  roomNumber: string;
  floor: number;
  capacity: number;
  type: string;
  occupied: number;
  amenities: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  roomNumber: { type: String, required: true },
  floor: { type: Number, required: true },
  capacity: { type: Number, required: true },
  type: { type: String, required: true },
  occupied: { type: Number, default: 0 },
  amenities: { type: [String], required: true },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance", "full"],
    default: "available",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Room = mongoose.model<IRoom>("Room", RoomSchema);

export default Room;
