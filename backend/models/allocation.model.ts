import mongoose, { Schema, Document } from 'mongoose';

export interface IAllocation extends Document {
  student: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  bed: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  paymentStatus: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AllocationSchema = new Schema<IAllocation>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    bed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    endDate: {
      type: Date
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'refunded'],
      default: 'pending'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Allocation = mongoose.model<IAllocation>('Allocation', AllocationSchema);

export default Allocation;
