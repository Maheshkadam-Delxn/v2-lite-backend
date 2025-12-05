import mongoose from "mongoose";
const { Schema } = mongoose;

const DocumentSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    folderName: { type: String },
    fileName: { type: String },
    fileUrl: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    fileType: { type: String },
    size: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);
