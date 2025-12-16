import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Plan from "@/models/Plan";
import Project from "@/models/Project";

/* =========================================================
   GET PLANS
   ========================================================= */
export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const filter: any = { isArchived: false };
  if (projectId) filter.projectId = projectId;

  const plans = await Plan.find(filter)
    .populate("uploadedBy projectId")
    .sort({ uploadedAt: -1 });

  return NextResponse.json({ success: true, data: plans });
}

/* =========================================================
   CREATE PLAN
   ========================================================= */
export async function POST(req: Request) {

  console.log("Req",req);
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const { projectId, name, fileUrl, fileType } = await req.json();

  if (!projectId || !name)
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );

  const project = await Project.findById(projectId);
  if (!project)
    return NextResponse.json(
      { success: false, message: "Project not found" },
      { status: 404 }
    );

  const plan = await Plan.create({
    projectId,
    name,
    fileUrl, 
    fileType,
    uploadedBy: session._id,
    versions: [
      {
        versionNumber: 1,
        createdBy: session._id,
        annotations: []
      }
    ],
    currentVersion: 1
  });

  return NextResponse.json({
    success: true,
    message: "Plan created successfully",
    data: plan
  });
}
