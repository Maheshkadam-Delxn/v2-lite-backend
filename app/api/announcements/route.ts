import dbConnect from "@/lib/dbConnect";
import Announcement from "@/models/Announcement";
import User from "@/models/User";
import { sendEmail } from "@/utils/email";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();

  const announcements = await Announcement.find()
    .populate("createdBy", "name email role")
    .sort({ pinned: -1, createdAt: -1 });

  return NextResponse.json({ success: true, data: announcements });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { title, message, sendToAll } = await req.json();

  const announcement = await Announcement.create({
    title,
    message,
    createdBy: session._id,
    pinned: false,
    visible: true,
  });

  // Optional broadcast via email
  if (sendToAll) {
    const users = await User.find({}, "email");
    const subject = `📢 ${title}`;
    const html = `<h3>${title}</h3><p>${message}</p>`;

    await Promise.all(users.map((u) => sendEmail(u.email, subject, html)));
  }

  return NextResponse.json({
    success: true,
    message: "Announcement created successfully",
    data: announcement,
  });
}
