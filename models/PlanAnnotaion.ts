import mongoose from "mongoose";
const { Schema } = mongoose;



const AnnotationSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    text: { type: String, required: true },
    imageUri: {
      type: String,
      default: null, // Cloudinary image URL
    },

    /* -------- AUDIO -------- */
    audioUri: {
      type: String,
      default: null, // Cloudinary audio URL
    },
    audioDuration: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);
const PlanFolderSchema = new Schema(
  {
    // Folder name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Parent folder (null = root)
    parentFolder: {
      type: Schema.Types.ObjectId,
      ref: "PlanFolder",
      default: null,
    },

    // Project reference
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",

    },
    projectTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectType",
    },
    // Documents inside this folder
    planDocuments: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        name: { type: String },
        versions: [{
          versionNumber: { type: Number },
          image: { type: String },
          annotations: [AnnotationSchema],
          status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending", // 👈 when uploaded
          },
          rejectionReason: {
            type: String,
            default: null,
          },
          approvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
          },
          rejectedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
          },
          approvedAt: { type: Date, default: null },
          rejectedAt: { type: Date, default: null },
          createdAt: { type: Date, default: Date.now },

        }],
      },
    ],

    // Created by
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

delete mongoose.models.PlanFolder

export default mongoose.models.PlanFolder ||
  mongoose.model("PlanFolder", PlanFolderSchema);
