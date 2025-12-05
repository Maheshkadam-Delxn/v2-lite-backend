import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const report = await Report.findById(id).populate("projectId createdBy sharedWith");
  if (!report)
    return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: report });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const updates = await req.json();
  const report = await Report.findById(id);
  if (!report)
    return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });

  if (
    !canAccess(session.role, ["admin", "manager"]) &&
    report.createdBy.toString() !== session._id.toString()
  )
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  Object.assign(report, updates);
  await report.save();

  return NextResponse.json({
    success: true,
    message: "Report updated successfully",
    data: report,
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json(
      { success: false, message: "Only admin can delete reports" },
      { status: 403 }
    );

  const { id } = await context.params; // ✅ unwrap Promise

  const deleted = await Report.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Report deleted successfully" });
}
