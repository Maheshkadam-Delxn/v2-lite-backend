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

    /* ----------------- PREPARE SURVEY DATA ----------------- */
    const surveyPayload = {
      ...siteSurvey,
      projectTypeId: projectType._id, // 🔥 LINK HERE
    };

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
