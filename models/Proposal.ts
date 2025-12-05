import mongoose from "mongoose";
const { Schema } = mongoose;

const ProposalSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    description: { type: String },
    documents: [{ type: String }],
    version: { type: String },
    status: { type: String, enum: ["submitted", "under-review", "approved", "rejected"], default: "submitted" },
    remarks: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.models.Proposal || mongoose.model("Proposal", ProposalSchema);
