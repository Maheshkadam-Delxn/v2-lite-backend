import { NextResponse } from "next/server";
import { verifyToken, signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const body = await req.json();
  const { token } = body;

  if (!token)
    return NextResponse.json({ success: false, message: "Token required" }, { status: 400 });

  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });

  const newToken = signToken({ _id: (decoded as any)._id, role: (decoded as any).role });
  return NextResponse.json({ success: true, message: "Token refreshed", token: newToken });
}
