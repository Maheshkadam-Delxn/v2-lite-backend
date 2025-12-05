import mongoose from "mongoose";
const { Schema } = mongoose;

const SurveySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    surveyType:{type:String},
    surveyDate:{type:String},
    assignContractor:{type:String},
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    documents: [{ type: String }],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        text: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    status: { type: String,  default: "pending" },
    rejectionReason: { type: String },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.models.Survey || mongoose.model("Survey", SurveySchema);
