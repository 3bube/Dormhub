import mongoose, { Schema, Document, Types } from "mongoose";

interface IPayment extends Document {
  studentId: { id: Types.ObjectId; ref: string };
  amount: number;
  description: string;
  paymentMethod: string;
  status: string;
  dueDate: Date;
  paidDate: Date;
  receiptNumber: string;
  transactionId: string;
  remindersSent: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  paymentMethod: {
    type: String,
    enum: ["online", "bank_transfer", "cash"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  dueDate: { type: Date },
  paidDate: { type: Date },
  receiptNumber: { type: String },
  transactionId: { type: String },
  remindersSent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
