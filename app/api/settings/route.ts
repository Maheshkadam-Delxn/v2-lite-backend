import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Preference from "@/models/Preference";
import NotificationPreference from "@/models/NotificationPreference";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const [user, preferences, notifications, organization] = await Promise.all([
    User.findById(session._id).select("-password"),
    Preference.findOne({ userId: session._id }),
    NotificationPreference.findOne({ userId: session._id }),
    Organization.findOne(),
  ]);

  return NextResponse.json({
    success: true,
    data: { user, preferences, notifications, organization },
  });
}
