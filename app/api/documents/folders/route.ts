import dbConnect from "@/lib/dbConnect";
import Folder from "@/models/Folder";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const query: any = { createdBy: session._id };
  if (projectId) query.projectId = projectId;

  const folders = await Folder.find(query)
    .populate("projectId createdBy")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: folders });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { name, projectId, parentFolderId,fileUrls } = await req.json();
console.log(projectId)
  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project)
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
  }

  const folder = await Folder.create({
    name,
    projectId,
    parentFolderId: parentFolderId || null,
    createdBy: session._id,
    fileUrls
  });

  return NextResponse.json({ success: true, message: "Folder created successfully", data: folder });
}
