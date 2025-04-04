import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISettings extends Document {
  hostelName: string;
  hostelAddress: string;
  contactEmail: string;
  contactPhone: string;
  wardenName: string;
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  notificationSettings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  privacySettings: {
    dataSharing: boolean;
    profileVisibility: string;
    contactInfoVisibility: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  hostelName: { type: String, default: "University Hostel" },
  hostelAddress: {
    type: String,
    default: "123 University Road, City, State, 12345",
  },
  contactEmail: { type: String, default: "hostel@university.edu" },
  contactPhone: { type: String, default: "+1 (123) 456-7890" },
  wardenName: { type: String, default: "Dr. John Smith" },
  defaultLanguage: { type: String, default: "English" },
  dateFormat: { type: String, default: "DD/MM/YYYY" },
  timeFormat: { type: String, default: "24-hour" },
  timezone: { type: String, default: "UTC+00:00" },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false }
  },
  privacySettings: {
    dataSharing: { type: Boolean, default: false },
    profileVisibility: { type: String, default: "students" },
    contactInfoVisibility: { type: String, default: "staff" }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Settings = mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
