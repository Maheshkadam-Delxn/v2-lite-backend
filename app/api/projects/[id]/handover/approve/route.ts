import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req as any);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;



    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // ❌ No handover request
    if (!project.handover?.handoverRequested) {
      return NextResponse.json(
        { message: "Handover not requested yet" },
        { status: 400 }
      );
    }

    // ❌ Already approved
    if (project.handover?.handoverAccepted) {
      return NextResponse.json(
        { message: "Handover already approved" },
        { status: 400 }
      );
    }

    // ✅ Approve handover
    project.handover.handoverAccepted = true;
    project.handover.handoverAcceptedDate = new Date();
    project.handover.handoverAcceptedBy = session._id;

    // ✅ Optional: Update project status
    project.status = "completed";

    await project.save();

    return NextResponse.json({
      message: "Handover approved successfully",
      handover: project.handover,
    });
  } catch (error) {
    console.error("Handover approval error:", error);
    return NextResponse.json(
      { message: "Failed to approve handover" },
      { status: 500 }
    );
  }
}
