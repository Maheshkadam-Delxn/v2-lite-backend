import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();
  const user = await getSession(req as any);
  if (!user)
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

  const freshUser = await User.findById(user._id).select("-password");
  return NextResponse.json({ success: true, data: freshUser });
}
