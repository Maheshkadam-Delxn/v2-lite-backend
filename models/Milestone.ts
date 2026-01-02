// models/Milestone.js - Fixed spelling of "description" in SubtaskSchema
import mongoose from "mongoose";

/* =======================
   Subtask Schema
======================= */
const SubtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {  // Fixed: Corrected spelling from "desription" to "description"
        type: String,   
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    attachments: [{
        type: String, // URL or file path
    }],
  },
  { _id: true }
);

/* =======================
   Milestone Schema
======================= */
const MilestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: String,

    subtasks: [SubtaskSchema],

    progress: {
      type: Number,
      default: 0, // Stored percentage (0–100)
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
  },
  { timestamps: true }
);

/* =======================
   AUTO PROGRESS CALCULATION
======================= */
MilestoneSchema.pre("save", function (next) {
  const total = this.subtasks.length;

  if (total === 0) {
    this.progress = 0;
    this.status = "not_started";
    return next();
  }

  const completed = this.subtasks.filter(
    (s) => s.isCompleted
  ).length;

  this.progress = Math.round((completed / total) * 100);

  if (this.progress === 0) this.status = "not_started";
  else if (this.progress === 100) this.status = "completed";
  else this.status = "in_progress";

  next();
});

export default mongoose.models.Milestone ||
  mongoose.model("Milestone", MilestoneSchema);