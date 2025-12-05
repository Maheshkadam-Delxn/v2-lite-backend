import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const notifications = await Notification.find({ recipient: session._id })
    .populate("sender", "name email role")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: notifications });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { recipientId, title, message, type, link } = await req.json();
  const recipient = await User.findById(recipientId);
  if (!recipient)
    return NextResponse.json({ success: false, message: "Recipient not found" }, { status: 404 });

  const notification = await Notification.create({
    sender: session._id,
    recipient: recipientId,
    title,
    message,
    type,
    link,
    status: "unread",
  });

  return NextResponse.json({
    success: true,
    message: "Notification sent successfully",
    data: notification,
  });
}
