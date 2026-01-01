import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import WorkProgress from "@/models/WorkProgress";

export async function PATCH(
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

    const progress = await WorkProgress.findByIdAndUpdate(
      id,
      { isLocked: true },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Progress locked",
      data: progress,
    });
  } catch (error) {
    console.error("LOCK PROGRESS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
