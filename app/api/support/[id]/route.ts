import dbConnect from "@/lib/dbConnect";
import Support from "@/models/Support";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess, isAdmin } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const ticket = await Support.findById(id).populate("userId assignedTo replies.userId");
  if (!ticket)
    return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });

  if (
    !canAccess(session.role, ["admin", "manager"]) &&
    ticket.userId.toString() !== session._id.toString()
  )
    return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });

  return NextResponse.json({ success: true, data: ticket });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const { status, assignedTo, remarks } = await req.json();
  const ticket = await Support.findById(id);

  if (!ticket)
    return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });

  if (!canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  if (status) ticket.status = status;
  if (assignedTo) ticket.assignedTo = assignedTo;
  if (remarks) ticket.remarks = remarks;

  await ticket.save();

  return NextResponse.json({
    success: true,
    message: "Ticket updated successfully",
    data: ticket,
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json(
      { success: false, message: "Only admin can delete tickets" },
      { status: 403 }
    );

  const { id } = await context.params; // ✅ unwrap Promise

  const deleted = await Support.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });

  return NextResponse.json({
    success: true,
    message: "Ticket deleted successfully",
  });
}
