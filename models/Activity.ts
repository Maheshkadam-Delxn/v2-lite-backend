import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  description: string;
  ipAddress?: string;
  device?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true }, // e.g., "create", "update", "delete", "download"
    entityType: { type: String, required: true, trim: true }, // e.g., "Project", "Document", "User"
    entityId: { type: Schema.Types.ObjectId }, // optional reference to any document
    description: { type: String, required: true, trim: true },
    ipAddress: { type: String },
    device: { type: String },
    metadata: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);
//changes from anish