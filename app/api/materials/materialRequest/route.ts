import dbConnect from "@/lib/dbConnect";
import MaterialRequest from "@/models/MaterialRequest";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";



export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await Project.findById(body.projectId);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  const materialRequest = await MaterialRequest.create({
    ...body,
    addedBy: session._id,
    status:"Requested",
   
  });

  return NextResponse.json({
    success: true,
    message: "Material added successfully",
    data: materialRequest,
  });
}
