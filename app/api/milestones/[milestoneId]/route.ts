import dbConnect from "@/lib/dbConnect";
import Milestone from "@/models/Milestone";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";


export async function GET(
  req: Request,
  { params }: { params: { milestoneId: string } }
) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const milestone = await Milestone.findById(params.milestoneId)
      .populate("projectId")
      .populate("subtasks.assignedTo")
      .populate("createdby");

    if (!milestone) {
      return NextResponse.json(
        { success: false, message: "Milestone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: milestone });
  } catch (error: any) {
    console.error("GET milestone by id error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch milestone" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { milestoneId: string } }
) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const {
      projectId,
      title,
      description,
      subtasks,
    } = await req.json();

    const milestone = await Milestone.findById(params.milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { success: false, message: "Milestone not found" },
        { status: 404 }
      );
    }

    if (projectId) milestone.projectId = projectId;
    if (title) milestone.title = title;
    if (description !== undefined) milestone.description = description;

    if (Array.isArray(subtasks)) {
      milestone.subtasks = subtasks.map((subtask: any) => ({
        title: subtask.title,
        desription: subtask.desription,
        startDate: subtask.startDate,
        endDate: subtask.endDate,
        assignedTo: subtask.assignedTo,
        isCompleted: subtask.isCompleted,
        attachments: subtask.attachments,
      }));
    }

    await milestone.save(); // 🔥 recalculates progress & status

    return NextResponse.json({
      success: true,
      message: "Milestone updated successfully",
      data: milestone,
    });
  } catch (error: any) {
    console.error("Update milestone error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { milestoneId: string } }
) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const milestone = await Milestone.findByIdAndDelete(params.milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { success: false, message: "Milestone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Milestone deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete milestone error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
