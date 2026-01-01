import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import WorkProgress from "@/models/WorkProgress";

/* =========================================================
   GET SINGLE PROGRESS ENTRY
   ========================================================= */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const session = await getSession(req as any);
    if (!session) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const progress = await WorkProgress.findById(id).populate("reportedBy taskId");

    if (!progress) {
      return NextResponse.json(
        { success: false, message: "Progress not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    console.error("GET PROGRESS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================================================
   UPDATE SAME-DAY PROGRESS
   ========================================================= */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const session = await getSession(req as any);
    if (!session) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const progress = await WorkProgress.findById(id);
    if (!progress) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    if (progress.isLocked) {
      return NextResponse.json(
        { success: false, message: "Progress is locked" },
        { status: 400 }
      );
    }

    const updates = await req.json();
    Object.assign(progress, updates);
    await progress.save();

    return NextResponse.json({
      success: true,
      message: "Progress updated",
      data: progress,
    });
  } catch (error) {
    console.error("UPDATE PROGRESS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE PROGRESS (ADMIN ONLY)
   ========================================================= */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const session = await getSession(req as any);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    await WorkProgress.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Progress deleted",
    });
  } catch (error) {
    console.error("DELETE PROGRESS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
