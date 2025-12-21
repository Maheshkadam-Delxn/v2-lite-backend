import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Annotation from "@/models/Annotation";
import Plan from "@/models/Plan";
import "@/models/Project";

/* =========================================================
   CREATE ANNOTATION
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
      planId,
      planVersion,
      position,
      title,
      description,
      category,
      severity,
      attachments,
      assignedTo,
      status = "open",
      resolutionNote,
    } = await req.json();

    if (!projectId || !planId || !planVersion || !position || !title || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔍 Validate plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    const annotation = await Annotation.create({
      projectId,
      planId,
      planVersion,
      position,
      title,
      description,
      category,
      severity,
      attachments,
      createdBy: session._id,
      assignedTo,
      status,
      resolutionNote,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Annotation created successfully",
        data: annotation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ANNOTATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================================================
   GET ANNOTATIONS (BY PLAN)
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
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json(
        { success: false, message: "planId is required" },
        { status: 400 }
      );
    }

    const annotations = await Annotation.find({ planId })
      .populate("createdBy assignedTo")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: annotations },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET ANNOTATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}