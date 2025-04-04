import mongoose, { Schema, Document, Types } from "mongoose";

interface IBed extends Document {
  roomId: { id: Types.ObjectId; ref: string };
  bedNumber: number;
  isOccupied: boolean;
  occupiedBy: Types.ObjectId | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const BedSchema = new Schema<IBed>({
  roomId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "Room" },
  },
  bedNumber: { type: Number, required: true },
  isOccupied: { type: Boolean, default: false },
  occupiedBy: { type: mongoose.Types.ObjectId, default: null },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance", "full"],
    default: "available",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Bed = mongoose.model<IBed>("Bed", BedSchema);

export default Bed;
