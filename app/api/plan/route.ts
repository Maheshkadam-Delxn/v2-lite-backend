import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Plan from "@/models/Plan";
import Project from "@/models/Project";

/* =========================================================
   GET PLANS (Project-wise)
   ========================================================= */
export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "projectId is required" },
        { status: 400 }
      );
    }

    const plans = await Plan.find({ projectId })
      .populate("uploadedBy projectId")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("GET PLANS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================================================
   CREATE PLAN / CREATE NEW VERSION
   ========================================================= */
export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      projectId,
      title,
      planType,
      floor,
      area,
      file,
      remarks,
    } = await req.json();

    if (!projectId || !title || !planType || !file?.url) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔍 Validate project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // 🔍 Find existing latest plan (if any)
    const latestPlan = await Plan.findOne({
      projectId,
      planType,
      floor,
      area,
      isLatest: true,
    });

    let version = 1;
    let previousPlanId = null;

    if (latestPlan) {
      version = latestPlan.version + 1;
      previousPlanId = latestPlan._id;

      // Mark old version as not latest
      await Plan.updateOne(
        { _id: latestPlan._id },
        { isLatest: false }
      );
    }

    const plan = await Plan.create({
      projectId,
      title,
      planType,
      floor,
      area,
      file,
      version,
      previousPlanId,
      isLatest: true,
      remarks,
      uploadedBy: session._id,
    });

  return NextResponse.json(
  {
    success: true,
    message: "Plan uploaded successfully",
    data: plan,
  },
  { status: 201 }
);

  } catch (error) {
    console.error("CREATE PLAN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
