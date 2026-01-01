
import mongoose from "mongoose";
const { Schema } = mongoose;

const SurveySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project"},
    projectTypeId:{type: Schema.Types.ObjectId, ref:"ProjectType"},

    surveyDate: { type: String },

    assignContractor: { type: Schema.Types.ObjectId, ref: "User" },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },

    description: { type: String },
    documents: [{ type: String }],

    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    status: { type: String, default: "pending" },
    rejectionReason: { type: String },

    // ❗ FIXED FIELD
    approvedAt: { type: Date },

    // Location
    location: {
      siteName: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      latitude: { type: String },
      longitude: { type: String },
      landmark: { type: String },
    },

    // Plot Details
    plotDetails: {
      plotShape: { type: String },
      plotLength: { type: String },
      plotWidth: { type: String },
      plotArea: { type: String },
      areaUnit: { type: String, default: "sq.ft" },
      frontageWidth: { type: String },
      roadWidthFront: { type: String },
      cornerPlot: { type: Boolean, default: false },
      permissibleFSI: { type: String },
      maxPermissibleHeight: { type: String },
    },

    // Setbacks
    setbacks: {
      setbackFront: { type: String },
      setbackBack: { type: String },
      setbackLeft: { type: String },
      setbackRight: { type: String },
      setbackUnit: { type: String, default: "ft" },
    },

    // Topography
    topography: {
      slopeDirection: { type: String },
      slopeGradient: { type: String },
      floodingHistory: { type: Boolean, default: false },
      floodingRemarks: { type: String },
    },

    // Soil
    soil: {
      soilType: { type: String },
      soilRemark: { type: String },
      rockPresence: { type: Boolean, default: false },
      rockDepthApprox: { type: String },
      waterTableDepthApprox: { type: String },
      contaminationSigns: { type: Boolean, default: false },
      contaminationRemarks: { type: String },
    },

    // Surroundings
    surroundings: {
      north: { type: { type: String }, description: String },
      south: { type: { type: String }, description: String },
      east: { type: { type: String }, description: String },
      west: { type: { type: String }, description: String },

      neighborhoodType: { type: String },
      noiseLevel: { type: String },
      dustPollutionLevel: { type: String },
      distanceToMainRoad: { type: String },
      distanceToTransformer: { type: String },
      highTensionLine: { type: Boolean, default: false },
      highTensionRemarks: { type: String },
    },

    // Utilities
    utilities: {
      water: {
        available: { type: Boolean, default: false },
        source: { type: String },
        remarks: { type: String },
      },
      electricity: {
        available: { type: Boolean, default: false },
        phase: { type: String },
        meterInstalled: { type: Boolean, default: false },
        remarks: { type: String },
      },
      sewage: {
        available: { type: Boolean, default: false },
        type: { type: String },
        remarks: { type: String },
      },
      drain: {
        available: { type: Boolean, default: false },
        condition:{ type: String },
        remarks:{ type: String },
      },
      internet: {
        available: { type: Boolean, default: false },
        type: { type: String },
        remarks: { type: String },
      },
    },

    // Access
    access: {
      mainEntryWidth: { type: String },
      accessRoadType: { type: String },
      accessRoadCondition: { type: String },
      heavyVehicleAccess: { type: Boolean, default: false },
      craneAccess: { type: Boolean, default: false },
      materialStorageAvailable: { type: Boolean, default: false },
      materialStorageArea: { type: String },
      remarks: { type: String },
    },

    // Existing Structures
    existingStructures: {
      hasExistingStructure: { type: Boolean, default: false },
      structureType: { type: String },
      noOfFloors: { type: String },
      approximateAge: { type: String },
      structuralCondition: { type: String },
      demolitionRequired: { type: Boolean, default: false },
      partialDemolition: { type: Boolean, default: false },
      demolitionRemarks: { type: String },
    },

    // Risks
    risks: {
      legalDispute: { type: Boolean, default: false },
      legalDisputeRemarks: { type: String },
      encroachment: { type: Boolean, default: false },
      encroachmentRemarks: { type: String },
      heritageZone: { type: Boolean, default: false },
      restrictedHeight: { type: Boolean, default: false },
      remarks: String,
    },

    photos: [{ type: String }],

    measurements: [
      {
        key: { type: String },
        label: { type: String },
        value: { type: String },
        unit: { type: String },
        notes: { type: String },
      },
    ],

    observations: [
      {
        title: { type: String },
        description: { type: String },
        category: { type: String },
        severity: { type: String },
        affectsProposal: { type: Boolean, default: false },
        recommendedAction: { type: String },
      },
    ],

    // Review
    review: {
      status: { type: String },
      remarks: { type: String },
    },
  },
  { timestamps: true }
);

delete mongoose.models.Survey;
export default mongoose.models.Survey || mongoose.model("Survey", SurveySchema);
