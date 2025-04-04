import mongoose, { Schema, Document, Types } from "mongoose";

interface IComplaintComment extends Document {
  complaintId: { id: Types.ObjectId; ref: string };
  userId: { id: Types.ObjectId; ref: string };
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintCommentSchema = new Schema<IComplaintComment>({
  complaintId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "Complaint" },
  },
  userId: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ComplaintComment = mongoose.model<IComplaintComment>(
  "ComplaintComment",
  ComplaintCommentSchema
);

export default ComplaintComment;
