import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendEmail } from "@/utils/email";
import crypto from "crypto";
import { NextResponse } from "next/server";
import Logger from "@/lib/logger";

export async function POST(req: Request) {
  await dbConnect();
  const { email } = await req.json();

  if (!email)
    return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  const tokenExpire = Date.now() + 15 * 60 * 1000;

  user.resetToken = resetToken;
  user.resetTokenExpire = tokenExpire;
  await user.save();

  const html = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>Click below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">Reset Password</a>
    <p>This link will expire in 15 minutes.</p>
  `;

  try {
    await sendEmail(user.email, "Password Reset Request", html);
    Logger.info("Password reset email sent", { email: user.email });
  } catch (err) {
    Logger.error("Email send failed", err);
  }

  return NextResponse.json({ success: true, message: "Password reset link sent to email" });
}
