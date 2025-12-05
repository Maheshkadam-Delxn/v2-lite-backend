import mongoose, { Schema, Document } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  logo?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  timezone?: string;
  gstNumber?: string;
  panNumber?: string;
  createdBy: mongoose.Types.ObjectId;
  members: {
    userId: mongoose.Types.ObjectId;
    role: string;
  }[];
  settings?: {
    currency?: string;
    dateFormat?: string;
    defaultLanguage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String },
    industry: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    website: { type: String },
    timezone: { type: String, default: "Asia/Kolkata" },
    gstNumber: { type: String },
    panNumber: { type: String },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String },
      },
    ],

    settings: {
      currency: { type: String, default: "INR" },
      dateFormat: { type: String, default: "DD/MM/YYYY" },
      defaultLanguage: { type: String, default: "en" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
