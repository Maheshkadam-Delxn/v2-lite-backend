import mongoose, { Schema, Document } from "mongoose";

export interface IFolder extends Document {
  name: string;
  projectId?: mongoose.Types.ObjectId;
  parentFolderId?: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  path: string[];
  fileUrls:string[];
  sharedWith: {
    userId: mongoose.Types.ObjectId;
    permission: "view" | "edit";
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    parentFolderId: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileUrls:[{type:Object}],
    path: {
      type: [String],
      default: [],
      index: true, // useful for hierarchical lookups
    },

    sharedWith: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        permission: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Folder ||
  mongoose.model<IFolder>("Folder", FolderSchema);
