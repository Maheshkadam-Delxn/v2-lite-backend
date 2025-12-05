import mongoose, { Schema, models, model } from "mongoose";
import Material from "./Material";
const TransactionSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["purchase", "expense", "payment_in", "payment_out", "invoice", "debit_note"],
      required: true,
    },
    vendorName: String,
    invoiceNumber: String,
    invoiceDate: Date,
    paymentMode: { type: String, enum: ["cash", "bank_transfer", "upi", "cheque"], default: "cash" },
    referenceNumber: String,
    paymentDate: Date,
    materialId: { type: Schema.Types.ObjectId, ref: "Material" },
    items: [
      {
        itemName: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
        remarks: String,
      },
    ],
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    documents: [{ type: String }],
    remarks: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    consumptionLimit: {
      limitSetBy: { type: Schema.Types.ObjectId, ref: "User" },
      limitValue: Number,
      usedValue: Number,
    },
  },
  { timestamps: true }
);
delete mongoose.models.Transaction;
// ✅ Always use `models.Transaction` check
const Transaction = models.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
