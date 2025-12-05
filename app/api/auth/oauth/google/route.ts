import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { email, name, image } = await req.json();

  if (!email)
    return NextResponse.json({ success: false, message: "Google login failed: missing email" }, { status: 400 });

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      profileImage: image,
      role: "engineer",
      password: "google_oauth_placeholder",
    });
  }

  const token = signToken({ _id: user._id, role: user.role });
  await createSession(user._id.toString());

  return NextResponse.json({
    success: true,
    message: "Google login successful",
    data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
  });
}
