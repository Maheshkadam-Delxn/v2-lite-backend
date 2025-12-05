import dbConnect from "@/lib/dbConnect";
import Announcement from "@/models/Announcement";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess, isAdmin } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const { id } = await context.params; // ✅ unwrap params

  const announcement = await Announcement.findById(id).populate("createdBy", "name email");
  if (!announcement)
    return NextResponse.json({ success: false, message: "Announcement not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: announcement });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { id } = await context.params; // ✅ unwrap params
  const updates = await req.json();
  const updated = await Announcement.findByIdAndUpdate(id, updates, { new: true });

  if (!updated)
    return NextResponse.json({ success: false, message: "Announcement not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Announcement updated", data: updated });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete announcements" }, { status: 403 });

  const { id } = await context.params; // ✅ unwrap params
  const deleted = await Announcement.findByIdAndDelete(id);

  if (!deleted)
    return NextResponse.json({ success: false, message: "Announcement not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Announcement deleted successfully" });
}
