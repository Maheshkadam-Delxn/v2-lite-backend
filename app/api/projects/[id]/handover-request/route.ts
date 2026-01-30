import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import Project from "@/models/Project";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
    const { id } = await params;

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // ❌ Prevent duplicate handover request
    if (project.handover?.handoverRequested) {
      return NextResponse.json(
        { message: "Handover already requested" },
        { status: 400 }
      );
    }

    // ✅ Update embedded handover object
    project.handover = {
      handoverRequested: true,
      handoverDate: new Date(),
      handoverBy: session._id, 
      handoverAccepted: false,  
      handoverAcceptedDate: null,
      handoverAcceptedBy: null,
    };

    await project.save();

    return NextResponse.json({
      message: "Handover request sent successfully",
      handover: project.handover,
    });
  } catch (error) {
    console.error("Handover POST error:", error);
    return NextResponse.json(
      { message: "Failed to submit handover request" },
      { status: 500 }
    );
  }
}
