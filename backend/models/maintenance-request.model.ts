import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceRequest extends Document {
  room: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  issue: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: mongoose.Types.ObjectId;
  completedOn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    issue: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedOn: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const MaintenanceRequest = mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);

export default MaintenanceRequest;
