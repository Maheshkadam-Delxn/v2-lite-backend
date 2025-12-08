import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { registerSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { success: false, message: "Invalid data", errors: parsed.error.issues },
      { status: 400 }
    );

  const { name, email, password, role } = parsed.data;
  const existingUser = await User.findOne({ email });

  if (existingUser)
    return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });

  // ✅ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  // ✅ Create user (unverified)
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    newpassRequired:false,
    role,
    emailVerificationToken,
  });

  // ✅ Send email
  await sendVerificationEmail(email, emailVerificationToken);

  return NextResponse.json(
    {
      success: true,
      message: "User registered successfully. Please verify your email.",
    },
    { status: 201 }
  );
}
