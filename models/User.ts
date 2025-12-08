import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },

    
    role: {
      type: String,
   
      default: "client",
    },

    // ✅ New Email Verification Fields
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
newpassRequired: { type: Boolean, default: false },
    designation: { type: String },
    profileImage: { type: String },
    assignedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    lastLogin: { type: Date },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual("roleName").get(function () {
  if (this.populated("roleId") && (this as any).roleId?.name)
    return (this as any).roleId.name;
  return this.role;
});

delete mongoose.models.User;
export default mongoose.models.User || mongoose.model("User", UserSchema);
