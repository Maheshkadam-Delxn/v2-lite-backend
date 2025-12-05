import dbConnect from "@/lib/dbConnect";
import NotificationPreference from "@/models/NotificationPreference";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const prefs = await NotificationPreference.findOne({ userId: session._id });
  return NextResponse.json({ success: true, data: prefs });
}

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const updates = await req.json();

  const prefs = await NotificationPreference.findOneAndUpdate(
    { userId: session._id },
    { $set: updates },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, message: "Notification preferences updated", data: prefs });
}
