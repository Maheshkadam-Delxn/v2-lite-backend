import mongoose, { Schema } from "mongoose";

const ProjectTypeSchema = new Schema(
  {
    projectTypeName: { type: String, required: true, unique: true },
    image:{ type: String},
    category: { type: String },
    description: { type: String },
    landArea:{type:String},
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    estimated_days:{type:Number},
    budgetMaxRange:{type:String},
    budgetMinRange:{type:String},
    material:[

      {
        material_name:{type:String},
        units:{type:String},
        quantity:{type:Number}
        
      }
    ],
    createdAt:{type:String},

  },
  { timestamps: true }
);

export default mongoose.models.ProjectType || mongoose.model("ProjectType", ProjectTypeSchema);
