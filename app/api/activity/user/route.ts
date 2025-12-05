import dbConnect from "@/lib/dbConnect";
import Activity from "@/models/Activity";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || session._id;

  const logs = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(100);
  return NextResponse.json({ success: true, data: logs });
}
