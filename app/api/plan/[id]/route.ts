import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Plan from "@/models/Plan";

/* =========================================================
   GET SINGLE PLAN
   ========================================================= */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: planId } = await params; // ✅ FIX

    const plan = await Plan.findById(planId)
      .populate("uploadedBy projectId");

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: plan },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET PLAN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


/* =========================================================
   DELETE PLAN (ONLY NON-LATEST)
   ========================================================= */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: planId } = await params; // ✅ FIX

    const plan = await Plan.findById(planId);

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    if (plan.isLatest) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete the latest plan version",
        },
        { status: 400 }
      );
    }

    await Plan.deleteOne({ _id: planId });

    return NextResponse.json(
      {
        success: true,
        message: "Plan deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE PLAN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
