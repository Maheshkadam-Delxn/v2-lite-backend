import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import WorkProgress from "@/models/WorkProgress";

/* =========================================================
   GET PROJECT PROGRESS SUMMARY
   ========================================================= */
export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "projectId is required" },
        { status: 400 }
      );
    }

    const progressEntries = await WorkProgress.find({ projectId });

    let total = 0;
    progressEntries.forEach((p) => {
      total += p.progressPercent;
    });

    const overallProgress =
      progressEntries.length > 0
        ? Math.min(total / progressEntries.length, 100)
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        overallProgressPercent: overallProgress,
        totalEntries: progressEntries.length,
        lastUpdated:
          progressEntries.length > 0
            ? progressEntries[progressEntries.length - 1].progressDate
            : null,
      },
    });
  } catch (error) {
    console.error("PROGRESS SUMMARY ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
