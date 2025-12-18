import mongoose, { Schema, models, model } from "mongoose";
import Material from "./Material";

const TransactionSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ============================
       TRANSACTION CLASSIFICATION
       ============================ */

    category: {
      type: String,
      enum: ["material", "expense", "payment", "document"],
      required: true,
    },

    nature: {
      type: String,
      enum: ["purchase", "payment_in", "payment_out", "invoice", "debit_note"],
      required: true,
    },

    direction: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },

    /* ============================
       MATERIAL LINK (OPTIONAL)
       ============================ */

    materialId: {
      type: Schema.Types.ObjectId,
      ref: "Material",
    },

    /* ============================
       FINANCIAL DETAILS
       ============================ */

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMode: {
      type: String,
      enum: ["cash", "bank_transfer", "upi", "cheque"],
    },

    paymentDate: Date,

    referenceNumber: String,

    /* ============================
       VENDOR / INVOICE
       ============================ */

    vendorName: String,
    invoiceNumber: String,
    invoiceDate: Date,

    items: [
      {
        itemName: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
        remarks: String,
      },
    ],

    documents: [{ type: String }],

    remarks: String,

    /* ============================
       APPROVAL FLOW
       ============================ */

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,
  },
  { timestamps: true }
);

delete mongoose.models.Transaction;
// ✅ Always use `models.Transaction` check
const Transaction = models.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
