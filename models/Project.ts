import mongoose from "mongoose";
import "@/models/ProjectType"; // ✅ Add this line to register model first
const { Schema } = mongoose;

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    projectCode: { type: String },
    location: { type: String },
    description: { type: String },
    category:{type:String},
    startDate: { type: Date },
    plans:[{type:Object}],
    landArea:{type:String},
    endDate: { type: Date },
    projectImages:{type:String},
   projectDocuments: [{
  type: Object
}]
,
    clientName: {type:String},
    needsNewSiteSurvey:{type:Boolean},
   clientEmail: {type:String},
    clientPhone: {type:Number},
    assignedSiteSurvey:{ type: Schema.Types.ObjectId, ref: "User" },
    budget:{type:Number},
    selectedItems:[{type:String}],


    projectType: { type: Schema.Types.ObjectId, ref: "ProjectType"},
rejectionReason:{type:String},
    manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
    engineers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
  
      default: "ongoing",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    versionDetails: {
      currentVersion: { type: String },
      lastUpdated: { type: Date },
      history: [
        {
          version: String,
          updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
          updatedAt: Date,
          notes: String,
        },
      ],
    },
  },
  { timestamps: true }
);
delete mongoose.models.Project;

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
