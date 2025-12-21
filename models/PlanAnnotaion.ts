import mongoose from "mongoose";
const { Schema } = mongoose;



const AnnotationSchema = new Schema(
  {
    x: { type: Number, required: true }, // relative (0–1)
    y: { type: Number, required: true }, // relative (0–1)
    text: { type: String, required: true },
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
      required: true,
    },

    // Documents inside this folder
    planDocuments: [
      {
        name:{type:String},
        versions:[ {
          versionNumber:{type:Number},
          image:{type:String},
          annotations: [AnnotationSchema],
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
