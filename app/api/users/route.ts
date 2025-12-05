import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess, isAdmin, isManager } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const users = await User.find().select("-password");
  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: Request) {
  await dbConnect();
  const admin = await getSession(req as any);
  if (!admin || !isAdmin(admin.role))
    return NextResponse.json({ success: false, message: "Only admin can create users" }, { status: 403 });

  const body = await req.json();
  const existing = await User.findOne({ email: body.email });
  if (existing)
    return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });

  const user = await User.create(body);
  return NextResponse.json({ success: true, message: "User created", data: user });
}
