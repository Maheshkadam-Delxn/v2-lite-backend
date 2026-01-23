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

    // 📍 Structural References (Optional)
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: "Milestone",
      required: false,
    },
    subtaskId: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    // 📅 Progress Date (1 entry per day recommended)
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // 📝 Details
    description: {
      type: String,
      trim: true,
      required: true,
    },

    // 📊 Progress % achievement for the day
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    // 📸 Proof of work
    photos: [{ type: String }],

    // ⚠️ Issues / blockers (optional)
    issues: {
      type: String,
      trim: true,
    },

    // 👤 Audit
    createdBy: {
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
  { projectId: 1, date: 1 },
  { unique: true }
);

export default mongoose.models.WorkProgress ||
  mongoose.model("WorkProgress", WorkProgressSchema);
