import dbConnect from "@/lib/dbConnect";
import BOQ from "@/models/Boq";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await Project.findById(body.projectId);

  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  const boq = await BOQ.create({
    projectId: body.projectId,
    ...body,
    createdBy: session._id,
    status: "draft",
  });

  return NextResponse.json({
    success: true,
    message: "BOQ Draft created successfully",
    data: boq,
  });
}


export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId)
    return NextResponse.json({
      success: false,
      message: "Project ID is required",
    });

  const boqs = await BOQ.find({ projectId })
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: boqs });
}
