import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function GET() {
  await dbConnect();
  const org = await Organization.findOne();
  return NextResponse.json({ success: true, data: org });
}

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can update organization settings" }, { status: 403 });

  const body = await req.json();
  const updated = await Organization.findOneAndUpdate({}, body, { new: true, upsert: true });

  return NextResponse.json({ success: true, message: "Organization settings updated", data: updated });
}
