import mongoose, { Schema, Document } from "mongoose";

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  emailAlerts: boolean;
  pushAlerts: boolean;
  smsAlerts: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  projectUpdates: boolean;
  systemNotifications: boolean;
  marketingEmails: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    emailAlerts: { type: Boolean, default: true },
    pushAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    dailySummary: { type: Boolean, default: false },
    weeklyReport: { type: Boolean, default: true },
    projectUpdates: { type: Boolean, default: true },
    systemNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationPreference ||
  mongoose.model<INotificationPreference>(
    "NotificationPreference",
    NotificationPreferenceSchema
);
