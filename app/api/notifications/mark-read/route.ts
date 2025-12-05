import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { notificationId, markAll } = await req.json();

  if (markAll) {
    await Notification.updateMany({ recipient: session._id, status: "unread" }, { status: "read" });
    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  }

  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: session._id },
    { status: "read" },
    { new: true }
  );

  if (!updated)
    return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Notification marked as read", data: updated });
}
