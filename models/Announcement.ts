import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  createdBy: mongoose.Types.ObjectId;
  pinned: boolean;
  visible: boolean;
  sendToAll: boolean;
  recipients: mongoose.Types.ObjectId[];
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
  category: "general" | "maintenance" | "update" | "alert";
  scheduledAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema<IAnnouncement> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    sendToAll: {
      type: Boolean,
      default: false,
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
      },
    ],
    category: {
      type: String,
      enum: ["general", "maintenance", "update", "alert"],
      default: "general",
    },
    scheduledAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
