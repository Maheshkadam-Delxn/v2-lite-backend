import mongoose from "mongoose";
const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    reportType: { 
      type: String, 
      enum: ["progress", "survey", "financial", "snag", "summary"], 
      default: "progress" 
    },
    title: { type: String },
    content: { type: String },
    attachments: [{ type: String }],
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sharedVia: { type: String, enum: ["email", "link", "pdf"] }
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
