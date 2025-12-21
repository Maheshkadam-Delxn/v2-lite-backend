import mongoose from "mongoose";
const { Schema } = mongoose;

const MaterialRequestSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  
    materialId: {  type: Schema.Types.ObjectId,  ref:"Material", required: true },
   date: { type: String, required: true },
   status:{ type:String, default:"Requested" },
    itemDescription: { type: String },
     notes: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  
  },
  { timestamps: true }
);
//sample
delete mongoose.models.MaterialRequest;
export default mongoose.models.MaterialRequest || mongoose.model("MaterialRequest", MaterialRequestSchema);