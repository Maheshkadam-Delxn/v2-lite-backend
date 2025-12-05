import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendEmail } from "@/utils/email";
import { getSession } from "@/lib/auth";
import { isAdmin, isManager } from "@/utils/permissions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const inviter = await getSession(req as any);
  if (!inviter || (!isAdmin(inviter.role) && !isManager(inviter.role)))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { email, role } = await req.json();
  const existing = await User.findOne({ email });
  if (existing)
    return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?invite=${Buffer.from(email).toString("base64")}`;

  await sendEmail(
    email,
    "You're Invited - Construction Management Portal",
    `
      <h2>Invitation</h2>
      <p>You have been invited to join as a <strong>${role}</strong>.</p>
      <a href="${inviteLink}" target="_blank">Click here to join</a>
    `
  );

  return NextResponse.json({ success: true, message: "Invitation sent successfully" });
}
