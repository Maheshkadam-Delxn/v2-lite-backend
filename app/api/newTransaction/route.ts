import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/NewTransaction";
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

  const material = await Transaction.create({
    ...body,
    createdBy: session._id,
   
  });

  return NextResponse.json({
    success: true,
    message: "Transaction added successfully",
    data: material,
  });
}
