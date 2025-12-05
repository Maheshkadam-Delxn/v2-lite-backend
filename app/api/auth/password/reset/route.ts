import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { token, newPassword } = await req.json();

  if (!token || !newPassword)
    return NextResponse.json({ success: false, message: "Token and new password required" }, { status: 400 });

  const user = await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
  if (!user)
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400 });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;
  await user.save();

  return NextResponse.json({ success: true, message: "Password reset successfully" });
}
