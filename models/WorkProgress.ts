import mongoose from "mongoose";
const { Schema } = mongoose;

const WorkProgressSchema = new Schema(
  {
    // 🔗 Core References
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // Optional task reference (loose coupling)
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: false,
    },

    // 📅 Progress Date (1 entry per day recommended)
    progressDate: {
      type: Date,
      required: true,
      index: true,
    },

    // 📝 Description of work done
    workDescription: {
      type: String,
      trim: true,
      required: true,
    },

    // 📊 Progress %
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    // 📸 Proof of work
    photos: [
      {
        url: { type: String, required: true },
        caption: { type: String },
      },
    ],

    // ⚠️ Issues / blockers (optional)
    issues: {
      type: String,
      trim: true,
    },

    // 👤 Audit
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔒 Locking (prevents retro-editing)
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * 🔐 Constraints:
 * - Only ONE progress entry per project per day
 */
WorkProgressSchema.index(
  { projectId: 1, progressDate: 1 },
  { unique: true }
);

export default mongoose.models.WorkProgress ||
  mongoose.model("WorkProgress", WorkProgressSchema);
