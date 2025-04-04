import mongoose, { Schema, Document, Types } from "mongoose";

interface IScheduleReport extends Document {
  title: string;
  type: string;
  frequency: string;
  dayOfWeek: number;
  time: string;
  dayOfMonth: number;
  createdBy: { id: Types.ObjectId; ref: string };
  parameters: any;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleReportSchema = new Schema<IScheduleReport>({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "occupancy",
      "financial",
      "meal",
      "complaint",
      "inventory",
      "student",
    ],
    required: true,
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    required: true,
  },
  dayOfWeek: { type: Number }, // 0-6 for Sunday-Saturday
  dayOfMonth: { type: Number }, // 1-31
  time: { type: String },
  parameters: { type: Object },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ScheduleReport = mongoose.model<IScheduleReport>(
  "ScheduleReport",
  ScheduleReportSchema
);

export default ScheduleReport;
