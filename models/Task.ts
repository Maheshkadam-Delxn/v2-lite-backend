import mongoose from "mongoose";
const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },

    planId: { type: Schema.Types.ObjectId, ref: "Plan" },
    planVersion: Number,

    annotationId: { type: Schema.Types.ObjectId, ref: "Annotation" },

    title: { type: String, required: true },
    description: String,

    taskType: {
      type: String,
      enum: ["annotation", "site", "documentation", "approval", "general"],
      default: "general"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },

    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    startDate: Date,
    dueDate: Date,

    status: {
      type: String,
      enum: ["todo", "inprogress", "blocked", "review", "done"],
      default: "todo"
    },

    progress: { type: Number, default: 0 },

    attachments: [
      {
        url: String,
        name: String,
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);


export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
