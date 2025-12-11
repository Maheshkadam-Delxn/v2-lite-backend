// models/BOQ.js
import mongoose from 'mongoose';

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
    trim: true,
   
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    min: 0
  }
});

const BOQSchema = new mongoose.Schema({

     boqName: {
      type: String,
      required: true,
      trim: true,
    },
  // Project Reference
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // Project Information (from your form)
  builtUpArea: {
    type: Number,
    required: true,
    min: 0
  },
  structuralType: {
    type: String,
    trim: true,
  
  },
  foundationType: {
    type: String,
    trim: true,
 
  },
  
  // Materials (from your materials array)
  materials: [materialSchema],
  
  // Cost Details (from your form)
  laborCost: {
    type: Number,
    default: 0,
    min: 0
  },
  miscCost: {
    type: Number,
    default: 0,
    min: 0
  },
  contingency: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // percentage
  },
  
  // Calculated Fields
  totalMaterialCost: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  
  // Version
  version: {
    type: Number,
    default: 1
  },
  isLatest: {
    type: Boolean,
    default: true
  },
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate amounts before saving
BOQSchema.pre('save', function(next) {
  // Calculate material amounts
  let materialTotal = 0;
  this.materials.forEach(material => {
    if (material.qty && material.rate) {
      material.amount = material.qty * material.rate;
      materialTotal += material.amount;
    }
  });
  
  // Calculate totals
  this.totalMaterialCost = materialTotal;
  this.totalCost = materialTotal + (this.laborCost || 0) + (this.miscCost || 0);
  
  // Apply contingency if exists
  if (this.contingency && this.contingency > 0) {
    const contingencyAmount = (this.totalCost * this.contingency) / 100;
    this.totalCost += contingencyAmount;
  }
  
  this.updatedAt = new Date();
  next();
});

  delete mongoose.models.BOQ;

export default mongoose.models.BOQ || mongoose.model("BOQ", BOQSchema);