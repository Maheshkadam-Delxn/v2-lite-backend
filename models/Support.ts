import mongoose, { Schema, Document } from "mongoose";

export interface ISupport extends Document {
  userId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  category: string;
  subject: string;
  message: string;
  attachments?: string[];
  status: "open" | "in_progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high";
  replies: {
    sender: mongoose.Types.ObjectId;
    message: string;
    attachments?: string[];
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportSchema = new Schema<ISupport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    category: {
      type: String,
      required: true,
      enum: ["technical", "billing", "general", "project", "other"],
      default: "general",
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    attachments: [{ type: String }],

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    replies: [
      {
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true },
        attachments: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Support ||
  mongoose.model<ISupport>("Support", SupportSchema);
