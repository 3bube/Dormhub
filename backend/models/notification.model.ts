import mongoose, { Schema, Document, Types } from "mongoose";

interface INotification extends Document {
  userId: { id: Types.ObjectId; ref: string };
  title: string;
  message: string;
  read: boolean;
  relatedTo: string;
  relatedId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedTo: { type: String, required: true },
  relatedId: { type: mongoose.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default Notification;
