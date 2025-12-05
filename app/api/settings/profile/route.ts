import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const user = await User.findById(session._id).select("-password");
  return NextResponse.json({ success: true, data: user });
}

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  const updated = await User.findByIdAndUpdate(session._id, updates, { new: true }).select("-password");

  return NextResponse.json({ success: true, message: "Profile updated successfully", data: updated });
}
