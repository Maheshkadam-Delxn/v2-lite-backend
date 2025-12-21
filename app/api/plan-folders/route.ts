import dbConnect from "@/lib/dbConnect";
import PlanFolder from "@/models/PlanAnnotaion";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { name, parentFolder, projectId } = await req.json();

  if (!name || !projectId)
    return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });

  const folder = await PlanFolder.create({
    name,
    parentFolder: parentFolder || null,
    projectId,
    createdBy: session._id,
  });

  return NextResponse.json({
    success: true,
    message: "Folder created",
    data: folder,
  });
}
