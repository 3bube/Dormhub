import mongoose, { Schema, Document, Types } from "mongoose";

interface IStudentMealPlan extends Document {
  studentId: { id: Types.ObjectId; ref: string };
  mealPlanId: { id: Types.ObjectId; ref: string };
  startDate: Date;
  endDate: Date;
  status: string;
  specialRequests: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentMealPlanSchema = new Schema<IStudentMealPlan>({
  mealPlanId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "MealPlan" },
  },
  studentId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance", "full"],
    default: "available",
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  specialRequests: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const StudentMealPlan = mongoose.model<IStudentMealPlan>(
  "StudentMealPlan",
  StudentMealPlanSchema
);

export default StudentMealPlan;
