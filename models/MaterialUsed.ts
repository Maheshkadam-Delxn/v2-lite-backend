import mongoose from "mongoose";
const { Schema } = mongoose;

const MaterialUsedSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
 
    materialId: {  type: Schema.Types.ObjectId,  ref:"Material", required: true },
   date: { type: String, required: true },
  status:{ type:String, default:"Used" },
    quantity: { type: Number, required: true, default: 0 },
    note:{type:String},
   
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  
  },
  { timestamps: true }
);
//sample
delete mongoose.models.MaterialUsed;
export default mongoose.models.MaterialUsed || mongoose.model("MaterialUsed", MaterialUsedSchema);