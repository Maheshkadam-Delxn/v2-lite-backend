import dbConnect from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const proposals = await Proposal.find()
    .populate("projectId submittedBy reviewedBy")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: proposals });
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

  const proposal = await Proposal.create({
    ...body,
    submittedBy: session._id,
    status: "submitted",
  });

  return NextResponse.json({
    success: true,
    message: "Proposal submitted successfully",
    data: proposal,
  });
}
