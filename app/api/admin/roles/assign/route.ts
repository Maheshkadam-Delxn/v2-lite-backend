import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Role from "@/models/Role";
import mongoose from "mongoose";

export async function PUT(req: NextRequest) {
  const { userId, roleId } = await req.json();

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roleId))
    return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  await dbConnect();
  const role = await Role.findById(roleId);
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  const user = await User.findByIdAndUpdate(
    userId,
    { roleId: role._id, role: role.slug || role.name.toLowerCase() },
    { new: true }
  ).populate("roleId");

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    message: `Role '${role.name}' assigned to ${user.name}`,
    user,
  });
}