import dbConnect from "@/lib/dbConnect";
import Activity from "@/models/Activity";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const activities = await Activity.find()
    .populate("userId", "name role email")
    .sort({ createdAt: -1 })
    .limit(200);

  return NextResponse.json({ success: true, data: activities });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { action, entityType, entityId, description } = await req.json();

  const log = await Activity.create({
    userId: session._id,
    action,
    entityType,
    entityId,
    description,
  });

  return NextResponse.json({
    success: true,
    message: "Activity logged successfully",
    data: log,
  });
}
