import mongoose from "mongoose";
const { Schema } = mongoose;

const PlanDocumentSchema = new Schema(
  {
    // Document title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Folder reference
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "PlanFolder",
      required: true,
    },

    // Project reference
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // Versions of same document
    versions: [
      {
        versionNumber: {
          type: Number,
          required: true,
        },

        fileUrl: {
          type: String,
          required: true,
        },

        fileType: {
          type: String,
          enum: ["pdf", "image"],
          required: true,
        },

        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },

        note: {
          type: String, // optional: revision note
        },
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

export default mongoose.models.PlanDocument ||
  mongoose.model("PlanDocument", PlanDocumentSchema);
