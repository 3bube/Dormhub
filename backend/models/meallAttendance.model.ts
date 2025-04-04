import mongoose, { Schema, Document, Types } from "mongoose";

interface IMealAttendance extends Document {
  studentId: { id: Types.ObjectId; ref: string };
  mealType: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MealAttendanceSchema = new Schema<IMealAttendance>({
  studentId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  mealType: {
    type: String,
    enum: ["breakfast", "lunch", "dinner"],
    required: true,
  },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MealAttendance = mongoose.model<IMealAttendance>(
  "MealAttendance",
  MealAttendanceSchema
);

export default MealAttendance;
