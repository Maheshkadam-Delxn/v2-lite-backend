import mongoose from "mongoose";
const { Schema } = mongoose;

const MaterialSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  
    materialName: { type: String, required: true },
    unit: { type: String },
    gst: { type: Number, required: true },
    hsnCode:{type:String},
    category: { type: String },
    description: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  
  },
  { timestamps: true }
);
//sample
// delete mongoose.models.Material;
export default mongoose.models.Material || mongoose.model("Material", MaterialSchema);