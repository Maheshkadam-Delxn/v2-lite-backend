import dbConnect from "@/lib/dbConnect";
import Snag from "@/models/Snag";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { snagId, resolutionNotes } = await req.json();
  const snag = await Snag.findById(snagId);
  if (!snag)
    return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });

  if (!canAccess(session.role, ["admin", "manager"]) && snag.reportedBy.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  snag.status = "resolved";
  snag.resolutionNotes = resolutionNotes;
  snag.resolvedBy = session._id;
  snag.resolvedAt = new Date();

  await snag.save();

  return NextResponse.json({ success: true, message: "Snag marked as resolved", data: snag });
}
