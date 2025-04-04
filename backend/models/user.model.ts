import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  studentId?: string;
  staffId?: string;
  profileImage?: string;
  phone?: string;
  emergencyContact?: string;
  roomNumber?: string;
  joinDate?: Date;
  status?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date | number;
  notificationSettings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    complaintUpdates: boolean;
    paymentReminders: boolean;
    maintenanceAlerts: boolean;
    announcementNotifications: boolean;
  };
  privacySettings?: {
    showProfile: boolean;
    showContactInfo: boolean;
    allowDataCollection: boolean;
    receiveMarketingEmails: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "staff"], required: true },
  studentId: { type: String, sparse: true },
  staffId: { type: String, sparse: true },
  profileImage: { type: String },
  phone: { type: String },
  emergencyContact: { type: String },
  roomNumber: { type: String },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    complaintUpdates: { type: Boolean, default: true },
    paymentReminders: { type: Boolean, default: true },
    maintenanceAlerts: { type: Boolean, default: true },
    announcementNotifications: { type: Boolean, default: true },
  },
  privacySettings: {
    showProfile: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: false },
    allowDataCollection: { type: Boolean, default: true },
    receiveMarketingEmails: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
