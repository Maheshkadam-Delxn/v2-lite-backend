import dbConnect from "@/lib/dbConnect";
import Survey from "@/models/Survey";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";


export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const surveys = await Survey.find()
    .populate("requestedBy approvedBy projectId")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: surveys });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await Project.findById(body.projectId);
  console.log("body of this survey",body);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  const survey = await Survey.create({
    ...body,
    requestedBy: session._id,
    status: "pending",
  });
project.assignedSiteSurvey = session._id;  // <-- Add this field in schema
  await project.save();
  return NextResponse.json({
    success: true,
    message: "Survey request created successfully",
    data: survey,
  });
}
