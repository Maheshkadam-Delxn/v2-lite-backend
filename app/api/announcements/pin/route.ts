import dbConnect from "@/lib/dbConnect";
import Announcement from "@/models/Announcement";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { announcementId, pinned } = await req.json();

  const announcement = await Announcement.findById(announcementId);
  if (!announcement)
    return NextResponse.json({ success: false, message: "Announcement not found" }, { status: 404 });

  announcement.pinned = pinned;
  await announcement.save();

  return NextResponse.json({
    success: true,
    message: `Announcement ${pinned ? "pinned" : "unpinned"} successfully`,
    data: announcement,
  });
}
