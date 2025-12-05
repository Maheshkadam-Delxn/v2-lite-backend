import dbConnect from "@/lib/dbConnect";
import Snag from "@/models/Snag";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const snags = await Snag.find()
    .populate("projectId reportedBy resolvedBy surveyId")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: snags });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await Project.findById(body.projectId);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  const snag = await Snag.create({
    ...body,
    reportedBy: session._id,
    status: "open",
  });

  return NextResponse.json({
    success: true,
    message: "Snag reported successfully",
    data: snag,
  });
}
