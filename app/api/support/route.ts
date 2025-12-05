import dbConnect from "@/lib/dbConnect";
import Support from "@/models/Support";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const query: any = {};
  if (!canAccess(session.role, ["admin", "manager"]))
    query.userId = session._id;

  const tickets = await Support.find(query)
    .populate("userId assignedTo")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: tickets });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { category, subject, message, attachments } = await req.json();

  const ticket = await Support.create({
    userId: session._id,
    category,
    subject,
    message,
    attachments,
    status: "open",
  });

  return NextResponse.json({
    success: true,
    message: "Support request submitted successfully",
    data: ticket,
  });
}
