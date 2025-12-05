import dbConnect from "@/lib/dbConnect";
import Activity from "@/models/Activity";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap the promise safely

  const activity = await Activity.findById(id).populate("userId", "name email role");
  if (!activity)
    return NextResponse.json({ success: false, message: "Activity not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: activity });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete activity logs" }, { status: 403 });

  const { id } = await context.params; // ✅ unwrap the promise safely

  const deleted = await Activity.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Activity not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Activity log deleted successfully" });
}
