import mongoose from "mongoose";
const { Schema } = mongoose;

const SnagSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    surveyId: { type: Schema.Types.ObjectId, ref: "Survey" },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String },
    photos: [{ type: String }],
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "in-progress", "resolved"], default: "open" },
    resolutionNotes: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.models.Snag || mongoose.model("Snag", SnagSchema);
