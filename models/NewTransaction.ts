import mongoose, { Schema, models, model } from "mongoose";

const NewTransactionSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {type: String,required: true,  },
    vendorId: {type: Schema.Types.ObjectId, ref: "Vendor" },
    date: { type: Date },
    paymentMode: { type: String, default: "cash" },
   description: { type: String },
   bankName:{type:String},
   costCode:{type:String},
   category:{type:String},
    amount: { type: Number, required: true },
    documents: [{ type: String }],
    
  
  },
  { timestamps: true }
);

// ✅ Always use `models.Transaction` check
const Transaction = models.NewTransaction || model("NewTransaction", NewTransactionSchema);

export default Transaction;
