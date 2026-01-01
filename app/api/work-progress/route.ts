import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import WorkProgress from "@/models/WorkProgress";

/* =========================================================
   CREATE DAILY WORK PROGRESS
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
      taskId,
      progressDate,
      workDescription,
      progressPercent,
      photos,
      issues,
    } = await req.json();

    if (!projectId || !progressDate || !workDescription || progressPercent === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prevent duplicate entry per day
    const existing = await WorkProgress.findOne({
      projectId,
      progressDate: new Date(progressDate),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Progress already added for this date" },
        { status: 409 }
      );
    }

    const progress = await WorkProgress.create({
      projectId,
      taskId,
      progressDate,
      workDescription,
      progressPercent,
      photos,
      issues,
      reportedBy: session._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Work progress added successfully",
        data: progress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE WORK PROGRESS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================================================
   GET ALL WORK PROGRESS (PROJECT-WISE)
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

    const progressList = await WorkProgress.find({ projectId })
      .populate("reportedBy taskId")
      .sort({ progressDate: -1 });

    return NextResponse.json({
      success: true,
      data: progressList,
    });
  } catch (error) {
    console.error("GET WORK PROGRESS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
