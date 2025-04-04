import mongoose, { Schema, Document, Types } from "mongoose";

interface IMealOrder extends Document {
  studentId: { id: Types.ObjectId; ref: string };
  mealId: { id: Types.ObjectId; ref: string };
  date: Date;
  time: string;
  status: string;
  specialRequests: string;
  createdAt: Date;
  updatedAt: Date;
}

const MealOrderSchema = new Schema<IMealOrder>({
  studentId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  mealId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "MealPlan" },
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "delivered", "cancelled"],
    default: "available",
  },
  specialRequests: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MealOrder = mongoose.model<IMealOrder>("MealOrder", MealOrderSchema);

export default MealOrder;
