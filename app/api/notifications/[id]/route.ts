import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap promise

  const notification = await Notification.findById(id)
    .populate("sender", "name role")
    .populate("recipient", "name");

  if (!notification)
    return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });

  if (notification.recipient.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });

  return NextResponse.json({ success: true, data: notification });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap promise

  const deleted = await Notification.findOneAndDelete({
    _id: id,
    recipient: session._id,
  });

  if (!deleted)
    return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Notification deleted successfully" });
}
