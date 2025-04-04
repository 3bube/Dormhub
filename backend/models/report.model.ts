import mongoose, { Schema, Document, Types } from "mongoose";

interface IReport extends Document {
  title: string;
  type: string;
  generatedBy: { id: Types.ObjectId; ref: string };
  parameters: any;
  fileUrl: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>({
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
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  parameters: { type: Object },
  fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model<IReport>("Report", ReportSchema);

export default Report;
