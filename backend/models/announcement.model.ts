import mongoose, { Schema, Document, Types } from "mongoose";

interface IAnnouncement extends Document {
  title: string;
  message: string;
  createdBy: { id: Types.ObjectId; ref: string };
  targetAudience: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  targetAudience: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Announcement = mongoose.model<IAnnouncement>(
  "Announcement",
  AnnouncementSchema
);

export default Announcement;
