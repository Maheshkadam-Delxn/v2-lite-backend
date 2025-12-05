import dbConnect from "@/lib/dbConnect";
import Snag from "@/models/Snag";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const snag = await Snag.findById(id).populate("projectId reportedBy resolvedBy surveyId");
  if (!snag)
    return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: snag });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const updates = await req.json();
  const snag = await Snag.findById(id);
  if (!snag)
    return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });

  if (
    !canAccess(session.role, ["admin", "manager"]) &&
    snag.reportedBy.toString() !== session._id.toString()
  )
    return NextResponse.json({ success: false, message: "You cannot edit this snag" }, { status: 403 });

  Object.assign(snag, updates);
  await snag.save();

  return NextResponse.json({
    success: true,
    message: "Snag updated successfully",
    data: snag,
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json(
      { success: false, message: "Only admin can delete snags" },
      { status: 403 }
    );

  const { id } = await context.params; // ✅ unwrap Promise

  const deleted = await Snag.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Snag deleted successfully" });
}
