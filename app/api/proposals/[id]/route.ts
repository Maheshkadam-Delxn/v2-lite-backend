import dbConnect from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const proposal = await Proposal.findById(id)
    .populate("projectId submittedBy reviewedBy");

  if (!proposal)
    return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: proposal });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const updates = await req.json();
  const proposal = await Proposal.findById(id);

  if (!proposal)
    return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });

  if (
    !canAccess(session.role, ["admin", "manager"]) &&
    proposal.submittedBy.toString() !== session._id.toString()
  )
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  Object.assign(proposal, updates);
  await proposal.save();

  return NextResponse.json({
    success: true,
    message: "Proposal updated successfully",
    data: proposal,
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json(
      { success: false, message: "Only admin can delete proposals" },
      { status: 403 }
    );

  const { id } = await context.params; // ✅ unwrap Promise

  const deleted = await Proposal.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });

  return NextResponse.json({
    success: true,
    message: "Proposal deleted successfully",
  });
}
