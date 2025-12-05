import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { userId, locked } = await req.json();

  const user = await User.findById(userId);
  if (!user)
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

  user.locked = locked;
  await user.save();

  return NextResponse.json({
    success: true,
    message: `User ${locked ? "locked" : "unlocked"} successfully`,
    data: user,
  });
}
