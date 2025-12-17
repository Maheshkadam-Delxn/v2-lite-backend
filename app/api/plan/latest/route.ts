import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Plan from "@/models/Plan";
import "@/models/Project"; // 🔥 REQUIRED for populate

/* =========================================================
   GET LATEST PLANS (Project-wise)
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

    const plans = await Plan.find({
      projectId,
      isLatest: true,
    })
      .populate("uploadedBy projectId")
      .sort({ planType: 1, floor: 1, area: 1 });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("GET LATEST PLANS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
