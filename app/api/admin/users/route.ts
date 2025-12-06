import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";
import Role from "@/models/Role";
import bcrypt from "bcryptjs";
export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  console.log(session);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can create users" }, { status: 403 });

  const { name, email, roleId, password, assignedProjects } = await req.json();

  const existing = await User.findOne({ email });
  if (existing)
    return NextResponse.json({ success: false, message: "User already exists" }, { status: 409 });
  const roledata = await Role.findById(roleId);
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name, email, role: roledata.name, password: hashedPassword, assignedProjects,
    isEmailVerified: true
  });
  console.log("user data", user);
  return NextResponse.json({ success: true, message: "User created successfully", data: user });
}
