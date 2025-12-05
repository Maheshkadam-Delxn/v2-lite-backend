import mongoose from "mongoose";
const { Schema } = mongoose;

const MaterialSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    unit: { type: String },
    quantity: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    vendorName: { type: String },
    hsnCode:{type:String},
    invoiceUrl: { type: String },
    remarks: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);
//sample
export default mongoose.models.Material || mongoose.model("Material", MaterialSchema);