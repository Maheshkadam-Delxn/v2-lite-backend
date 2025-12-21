import mongoose from "mongoose";
const { Schema } = mongoose;

const MaterialPurchaseSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  vendorId:{type: Schema.Types.ObjectId, ref: "Vendor", required: true},
    materialId: {  type: Schema.Types.ObjectId,  ref:"Material", required: true },
   date: { type: String, required: true },
   rate:{type:String, required:true},
   totalAmount:{type:String, required:true},
  status:{ type:String, default:"Purchased" },
    advance: { type: String },
     balance: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  
  },
  { timestamps: true }
);
//sample
delete mongoose.models.MaterialPurchase;
export default mongoose.models.MaterialPurchase || mongoose.model("MaterialPurchase", MaterialPurchaseSchema);