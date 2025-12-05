import mongoose, { Schema, Document } from "mongoose";

export interface IPreference extends Document {
  userId: mongoose.Types.ObjectId;
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  dashboardLayout: "grid" | "list";
  defaultProjectView: "summary" | "detailed";
  itemsPerPage: number;
  autoSave: boolean;
  dateFormat: string;
  createdAt: Date;
  updatedAt: Date;
}

const PreferenceSchema = new Schema<IPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    language: { type: String, default: "en" },
    timezone: { type: String, default: "Asia/Kolkata" },

    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },

    dashboardLayout: {
      type: String,
      enum: ["grid", "list"],
      default: "grid",
    },
    defaultProjectView: {
      type: String,
      enum: ["summary", "detailed"],
      default: "summary",
    },
    itemsPerPage: { type: Number, default: 10 },
    autoSave: { type: Boolean, default: true },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
  },
  { timestamps: true }
);

export default mongoose.models.Preference ||
  mongoose.model<IPreference>("Preference", PreferenceSchema);
