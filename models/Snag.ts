import mongoose from "mongoose";
const { Schema } = mongoose;

const SnagSchema = new Schema(
  {
    // 🔗 Core References
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    workProgressId: {
      type: Schema.Types.ObjectId,
      ref: "WorkProgress",
      // Optional: Read-only reference for traceability
    },

    // 📝 Details
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["civil", "electrical", "plumbing", "finishing", "other"],
      required: true,
    },
    location: { type: String, required: true }, // e.g., "Floor 1, Room 101"

    // ⚠️ Severity & Status
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "assigned", "fixed", "verified", "closed"],
      default: "open",
      index: true,
    },

    // 📸 Evidence
    photos: [{ type: String }], // Initial reporting photos
    resolutionPhotos: [{ type: String }], // Proof of fix

    // 👤 People
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

    // 🕒 Timestamps (System Managed)
    assignedAt: { type: Date },
    fixedAt: { type: Date },
    verifiedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

// 🔍 Indices for Performance of common filters
SnagSchema.index({ projectId: 1, status: 1 });
SnagSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.models.Snag || mongoose.model("Snag", SnagSchema);
