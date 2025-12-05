import mongoose from "mongoose";
const { Schema } = mongoose;

const ActivityLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    action: { type: String, required: true },
    description: { type: String },
    entityType: { 
      type: String, 
      enum: [
        "project", 
        "survey", 
        "snag", 
        "transaction", 
        "report", 
        "proposal", 
        "task", 
        "material"
      ]
    },
    entityId: { type: Schema.Types.ObjectId },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
