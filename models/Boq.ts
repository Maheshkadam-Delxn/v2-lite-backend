// models/BOQ.js
import mongoose from "mongoose";

/* ---------------- MATERIAL ---------------- */
const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  qty: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    min: 0,
    default: 0
  }
});

/* ---------------- BOQ VERSION ---------------- */
const boqVersionSchema = new mongoose.Schema({
  versionNumber: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  materials: [materialSchema],
status: {
      type: String,
      enum: ["draft", "approved", "rejected"],
      default: "draft"
    },
 rejectionReason: {
      type: String,
      default: ""
    },
    clientApproval: {
      type: String,
      enum: ["pending", "approved", "rejected"],  
      default: "pending"
    },

    contractorApproval: {
      type: String,
      enum: ["pending", "approved", "rejected"],  
      default: "pending"
    },
   
  laborCost: {
    type: Number,
    default: 0,
    min: 0
  },

  totalMaterialCost: {
    type: Number,
    default: 0
  },

  totalCost: {
    type: Number,
    default: 0
  }
});

/* ---------------- BOQ ---------------- */
const BOQSchema = new mongoose.Schema(
  {
    boqName: {
      type: String,
      required: true,
      trim: true
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
     
    },
projectTypeId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectType",
},
    builtUpArea: {
      type: Number,
      required: true,
      min: 0
    },

    structuralType: {
      type: String,
      trim: true
    },

    foundationType: {
      type: String,
      trim: true
    },

    boqVersion: [boqVersionSchema],

    status: {
      type: String,
      enum: ["draft", "approved", "rejected"],
      default: "draft"
    },

   
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

/* ---------------- CALCULATION LOGIC ---------------- */
BOQSchema.pre("save", function (next) {
  this.boqVersion.forEach((version) => {
    let materialTotal = 0;

    version.materials.forEach((material) => {
      material.amount = material.qty * material.rate;
      materialTotal += material.amount;
    });

    version.totalMaterialCost = materialTotal;
    version.totalCost = materialTotal + version.laborCost;
  });

  next();
});
delete mongoose.models.BOQ;
export default mongoose.models.BOQ || mongoose.model("BOQ", BOQSchema);
