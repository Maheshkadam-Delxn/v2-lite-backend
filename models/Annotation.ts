import mongoose, { Schema } from "mongoose";

const AnnotationSchema = new Schema(
  {
    /* =====================================================
       CORE REFERENCES
    ===================================================== */

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
      index: true,
    },

    planVersion: {
      type: Number,
      required: true,
      comment: "Version of plan when annotation was created",
    },

    /* =====================================================
       POSITION & VISUAL CONTEXT
    ===================================================== */

    position: {
      x: { type: Number, required: true }, // normalized (0–1)
      y: { type: Number, required: true }, // normalized (0–1)
      page: { type: Number, default: 1 },  // for PDFs
    },

    shape: {
      type: String,
      enum: ["point", "rectangle", "circle", "polygon"],
      default: "point",
    },

    /* =====================================================
       ANNOTATION CONTENT
    ===================================================== */

    title: {
      type: String,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "design_issue",
        "site_condition",
        "clarification",
        "change_request",
        "execution_note",
        "quality_issue",
      ],
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    /* =====================================================
       STATUS & WORKFLOW
    ===================================================== */

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },

    resolvedAt: {
      type: Date,
    },

    resolutionNote: {
      type: String,
      trim: true,
    },

    /* =====================================================
       LINKED ACTIONS (OPTIONAL)
    ===================================================== */

    linkedTaskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      comment: "Created when annotation converts to task",
    },

    linkedBOQId: {
      type: Schema.Types.ObjectId,
      ref: "BOQ",
      comment: "If annotation impacts cost",
    },

    /* =====================================================
       ATTACHMENTS
    ===================================================== */

    attachments: [
      {
        url: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: Date,
        originalName: { type: String, trim: true },
      },
    ],

    /* =====================================================
       AUDIT
    ===================================================== */

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      comment: "Optional owner",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Annotation ||
  mongoose.model("Annotation", AnnotationSchema);