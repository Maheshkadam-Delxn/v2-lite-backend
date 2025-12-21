import mongoose from "mongoose";
const { Schema } = mongoose;

const MaterialReceivedSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  vendorId:{type: Schema.Types.ObjectId, ref: "Vendor", required: true},
    materialId: {  type: Schema.Types.ObjectId,  ref:"Material", required: true },
   date: { type: String, required: true },
  status:{ type:String, default:"Received" },
    quantity: { type: Number, required: true, default: 0 },
    note:{type:String},
    vehicleNo:{type:String},
    challanNo:{type:String},
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  
  },
  { timestamps: true }
);
//sample
delete mongoose.models.MaterialReceived;
export default mongoose.models.MaterialReceived || mongoose.model("MaterialReceived", MaterialReceivedSchema);