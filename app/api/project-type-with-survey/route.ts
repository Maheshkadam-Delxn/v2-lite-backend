import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ProjectType from "@/models/ProjectType";
import Survey from "@/models/Survey";
import mongoose from "mongoose";
import BOQ from "@/models/Boq";
import PlanFolder from "@/models/PlanAnnotaion";
import { getSession } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    await dbConnect();
 const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const {
      projectTypeName,
      image,
      category,
      description,
      landArea,
      estimated_days,
      budgetMinRange,
      budgetMaxRange,
      material,
      boqs,
     
      siteSurvey,
       plansData
    } = body;

    /* ----------------- VALIDATION ----------------- */
    if (!projectTypeName) {
      return NextResponse.json(
        { success: false, message: "projectTypeName is required" },
        { status: 400 }
      );
    }

    if (!siteSurvey) {
      return NextResponse.json(
        { success: false, message: "siteSurvey data is required" },
        { status: 400 }
      );
    }
console.log("this is data",siteSurvey);
    /* ----------------- CREATE PROJECT TYPE ----------------- */
    const projectType = await ProjectType.create({
      projectTypeName,
      image,
      category,
      description,
      landArea,
      estimated_days,
      budgetMinRange,
      budgetMaxRange,
      material,
      createdBy:  session._id,
    });
function mapSurveyPayload(siteSurvey: any, projectTypeId: any) {
  return {
    projectTypeId,

    surveyDate: new Date().toISOString(),

    location: {
      siteName: siteSurvey.siteName,
      addressLine1: siteSurvey.addressLine1,
      addressLine2: siteSurvey.addressLine2,
      city: siteSurvey.city,
      state: siteSurvey.state,
      pincode: siteSurvey.pincode,
      latitude: siteSurvey.latitude,
      longitude: siteSurvey.longitude,
      landmark: siteSurvey.landmark,
    },

    plotDetails: {
      plotShape: siteSurvey.plotShape,
      plotLength: siteSurvey.plotLength,
      plotWidth: siteSurvey.plotWidth,
      plotArea: siteSurvey.plotArea,
      areaUnit: siteSurvey.areaUnit,
      frontageWidth: siteSurvey.frontageWidth,
      roadWidthFront: siteSurvey.roadWidthFront,
      cornerPlot: siteSurvey.cornerPlot,
      permissibleFSI: siteSurvey.permissibleFSI,
      maxPermissibleHeight: siteSurvey.maxPermissibleHeight,
    },

    setbacks: {
      setbackFront: siteSurvey.setbackFront,
      setbackBack: siteSurvey.setbackBack,
      setbackLeft: siteSurvey.setbackLeft,
      setbackRight: siteSurvey.setbackRight,
      setbackUnit: siteSurvey.setbackUnit,
    },

    topography: {
      slopeDirection: siteSurvey.slopeDirection,
      slopeGradient: siteSurvey.slopeGradient,
      floodingHistory: siteSurvey.floodingHistory,
      floodingRemarks: siteSurvey.floodingRemarks,
    },

    soil: {
      soilType: siteSurvey.soilType,
      soilRemark: siteSurvey.soilRemark,
      rockPresence: siteSurvey.rockPresence,
      rockDepthApprox: siteSurvey.rockDepthApprox,
      waterTableDepthApprox: siteSurvey.waterTableDepthApprox,
      contaminationSigns: siteSurvey.contaminationSigns,
      contaminationRemarks: siteSurvey.contaminationRemarks,
    },

    surroundings: {
      north: {
        type: siteSurvey.northType,
        description: siteSurvey.northDescription,
      },
      south: {
        type: siteSurvey.southType,
        description: siteSurvey.southDescription,
      },
      east: {
        type: siteSurvey.eastType,
        description: siteSurvey.eastDescription,
      },
      west: {
        type: siteSurvey.westType,
        description: siteSurvey.westDescription,
      },

      neighborhoodType: siteSurvey.neighborhoodType,
      noiseLevel: siteSurvey.noiseLevel,
      dustPollutionLevel: siteSurvey.dustPollutionLevel,
      distanceToMainRoad: siteSurvey.distanceToMainRoad,
      distanceToTransformer: siteSurvey.distanceToTransformer,
      highTensionLine: siteSurvey.highTensionLine,
      highTensionRemarks: siteSurvey.highTensionRemarks,
    },

    utilities: {
      water: {
        available: siteSurvey.waterAvailable,
        source: siteSurvey.waterSource,
        remarks: siteSurvey.waterRemarks,
      },
      electricity: {
        available: siteSurvey.electricityAvailable,
        phase: siteSurvey.electricityPhase,
        meterInstalled: siteSurvey.meterInstalled,
        remarks: siteSurvey.electricityRemarks,
      },
      sewage: {
        available: siteSurvey.sewageAvailable,
        type: siteSurvey.sewageType,
        remarks: siteSurvey.sewageRemarks,
      },
      drain: {
        available: siteSurvey.drainAvailable,
        condition: siteSurvey.drainCondition,
        remarks: siteSurvey.drainRemarks,
      },
      internet: {
        available: siteSurvey.internetAvailable,
        type: siteSurvey.internetType,
        remarks: siteSurvey.internetRemarks,
      },
    },

    access: {
      mainEntryWidth: siteSurvey.mainEntryWidth,
      accessRoadType: siteSurvey.accessRoadType,
      accessRoadCondition: siteSurvey.accessRoadCondition,
      heavyVehicleAccess: siteSurvey.heavyVehicleAccess,
      craneAccess: siteSurvey.craneAccess,
      materialStorageAvailable: siteSurvey.materialStorageAvailable,
      materialStorageArea: siteSurvey.materialStorageArea,
      remarks: siteSurvey.accessRemarks,
    },

    existingStructures: {
      hasExistingStructure: siteSurvey.hasExistingStructure,
      structureType: siteSurvey.structureType,
      noOfFloors: siteSurvey.noOfFloors,
      approximateAge: siteSurvey.approximateAge,
      structuralCondition: siteSurvey.structuralCondition,
      demolitionRequired: siteSurvey.demolitionRequired,
      partialDemolition: siteSurvey.partialDemolition,
      demolitionRemarks: siteSurvey.demolitionRemarks,
    },

    risks: {
      legalDispute: siteSurvey.legalDispute,
      legalDisputeRemarks: siteSurvey.legalDisputeRemarks,
      encroachment: siteSurvey.encroachment,
      encroachmentRemarks: siteSurvey.encroachmentRemarks,
      heritageZone: siteSurvey.heritageZone,
      restrictedHeight: siteSurvey.restrictedHeight,
      remarks: siteSurvey.risksRemarks,
    },

    photos: siteSurvey.photos || [],
    measurements: siteSurvey.measurements || [],
    observations: siteSurvey.observations || [],

    review: {
      status: siteSurvey.reviewStatus,
      remarks: siteSurvey.reviewRemarks,
    },
  };
}

    /* ----------------- PREPARE SURVEY DATA ----------------- */
    // const surveyPayload = {
    //   ...siteSurvey,
    //   projectTypeId: projectType._id, // 🔥 LINK HERE
    // };

    // const survey = await Survey.create(surveyPayload);
    const surveyPayload = mapSurveyPayload(siteSurvey, projectType._id);

const survey = await Survey.create(surveyPayload);

let createdBOQs = [];

if (Array.isArray(boqs) && boqs.length > 0) {
  const boqPayload = boqs.map((boq: any) => ({
    boqName: boq.boqName,
    projectTypeId: projectType._id,
    builtUpArea: boq.builtUpArea,
    structuralType: boq.structuralType,
    foundationType: boq.foundationType,
    status: boq.status || "draft",
    boqVersion: boq.boqVersion || [],
    createdBy: session._id,
  }));

  createdBOQs = await BOQ.insertMany(boqPayload);
}

let createdPlans = [];



if (Array.isArray(plansData) && plansData.length > 0) {
  const planPayload = plansData.map((plan: any) => ({
    name: plan.name,
    parentFolder: plan.parentFolder || null,
    projectTypeId: projectType._id, // 🔥 LINK PROJECT TYPE
    createdBy: session._id,

    planDocuments: plan.planDocuments.map((doc: any) => ({
      name: doc.name,

      versions: doc.versions.map((v: any) => ({
        versionNumber: v.versionNumber,
        image: v.image,
        status: v.status || "approved",
        annotations: v.annotations || [],
        createdAt: new Date(),
      })),
    })),
  }));

  createdPlans = await PlanFolder.insertMany(planPayload);
}



    /* ----------------- RESPONSE ----------------- */
    return NextResponse.json(
      {
        success: true,
        message: "Project Type and Survey created successfully",
        data: {
          projectType,
          survey,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
