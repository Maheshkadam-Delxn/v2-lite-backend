// app/api/milestones/[milestoneId]/route.ts
import dbConnect from "@/lib/dbConnect";
import Milestone from "@/models/Milestone";

// Temporarily comment out these imports & populates to isolate the issue
// import Project from "@/models/Project";
// import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";
import mongoose from "mongoose";
import { emitNotification } from "@/utils/socketEmit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  await dbConnect();
  const session = await getSession(req as any);

  const { milestoneId } = await params;
  console.log("GET milestoneId:", milestoneId);
  console.log("Is valid ObjectId?", mongoose.isValidObjectId(milestoneId));  // 🔍 New: Validate ID

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    // First, test raw findById without populate
    const milestone = await Milestone.findById(milestoneId);
    console.log("Raw findById result:", milestone ? "Found (raw)" : "Not found");  // 🔍 Debug: Raw query
    console.log("Raw milestone _id:", milestone?._id?.toString());  // 🔍 Compare IDs

    if (!milestone) {
      return NextResponse.json(
        { success: false, message: "Milestone not found" },
        { status: 404 }
      );
    }

    // If raw works, try populate step-by-step
    let populatedMilestone = milestone;
    try {
      populatedMilestone = await Milestone.findById(milestoneId)
        .populate("projectId")  // Test Project first
        .populate("createdby")  // Then User for createdby
        .populate("subtasks.assignedTo");  // Then User for assignedTo (empty, so safe)

      console.log("Populate succeeded for all");  // 🔍 If here, good
    } catch (populateError: any) {
      console.error("Populate error details:", populateError.message);  // 🔍 Pinpoint which populate fails
      // Fallback to raw if populate fails
      populatedMilestone = milestone;
    }

    return NextResponse.json({ success: true, data: populatedMilestone });
  } catch (error: any) {
    console.error("GET milestone by id error:", error.message);
    console.error("Full error stack:", error.stack);  // 🔍 More details
    return NextResponse.json(
      { success: false, message: "Failed to fetch milestone" },
      { status: 500 }
    );
  }
}

// PUT and DELETE remain the same as last version (with merge logic & await params)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  await dbConnect();
  const session = await getSession(req as any);

  const { milestoneId } = await params;
  console.log("PUT milestoneId:", milestoneId);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    console.log("PUT body:", body);

    const {
      projectId,
      title,
      description,
      subtasks,
    } = body;

    const milestone = await Milestone.findById(milestoneId);

    console.log("Found milestone for update:", milestone ? "Yes" : "No");

    if (!milestone) {
      return NextResponse.json(
        { success: false, message: "Milestone not found" },
        { status: 404 }
      );
    }

    if (projectId !== undefined) milestone.projectId = projectId;
    if (title !== undefined) milestone.title = title;
    if (description !== undefined) milestone.description = description;

    // Track new assignees for notifications
    const newAssignees: { userId: string; subtaskTitle: string }[] = [];

    if (Array.isArray(subtasks) && subtasks.length > 0) {
      const existingSubtasks = milestone.subtasks || [];

      subtasks.forEach((incomingSubtask: any) => {
        const subId = incomingSubtask._id ? incomingSubtask._id : new mongoose.Types.ObjectId();
        const existingIndex = existingSubtasks.findIndex((s: any) => s._id.toString() === subId.toString());

        // Get existing assignees for this subtask
        const existingAssignees = existingIndex !== -1
          ? (existingSubtasks[existingIndex].assignedTo || []).map((a: any) => a.toString())
          : [];

        // Get new assignees
        const incomingAssignees = incomingSubtask.assignedTo || [];

        const updatedSubtask = {
          _id: subId,
          title: incomingSubtask.title || (existingIndex !== -1 ? existingSubtasks[existingIndex].title : 'Untitled Subtask'),
          description: incomingSubtask.description !== undefined ? incomingSubtask.description : (existingIndex !== -1 ? existingSubtasks[existingIndex].description : undefined),
          startDate: incomingSubtask.startDate !== undefined ? incomingSubtask.startDate : (existingIndex !== -1 ? existingSubtasks[existingIndex].startDate : undefined),
          endDate: incomingSubtask.endDate !== undefined ? incomingSubtask.endDate : (existingIndex !== -1 ? existingSubtasks[existingIndex].endDate : undefined),
          assignedTo: incomingSubtask.assignedTo !== undefined ? incomingSubtask.assignedTo : (existingIndex !== -1 ? existingSubtasks[existingIndex].assignedTo : []),
          isCompleted: incomingSubtask.isCompleted !== undefined ? incomingSubtask.isCompleted : (existingIndex !== -1 ? existingSubtasks[existingIndex].isCompleted : false),
          attachments: incomingSubtask.attachments !== undefined ? incomingSubtask.attachments : (existingIndex !== -1 ? existingSubtasks[existingIndex].attachments : []),
        };

        // Detect newly assigned users
        for (const userId of incomingAssignees) {
          if (userId && !existingAssignees.includes(userId.toString())) {
            newAssignees.push({
              userId: userId.toString(),
              subtaskTitle: updatedSubtask.title
            });
          }
        }

        if (existingIndex !== -1) {
          existingSubtasks[existingIndex] = updatedSubtask;
        } else {
          existingSubtasks.push(updatedSubtask);
        }
      });

      milestone.subtasks = existingSubtasks;
    }



    const updatedMilestone = await milestone.save();

    // 🔔 Notify newly assigned users
    for (const { userId, subtaskTitle } of newAssignees) {
      if (userId !== session._id.toString()) {
        emitNotification(
          userId,
          "📋 Subtask Assigned",
          `You've been assigned to subtask "${subtaskTitle}" in milestone "${milestone.title}"`,
          "info",
          {
            screen: "TaskScreen",
            params: { milestoneId: milestone._id.toString(), projectId: milestone.projectId.toString() }
          }
        );
      }
    }
    if (newAssignees.length > 0) {
      console.log(`[Milestones] Notified ${newAssignees.length} new assignee(s)`);
    }

    console.log("Updated milestone saved:", updatedMilestone._id);

    // Try populate on response, fallback to raw if fails
    let populated;
    try {
      populated = await Milestone.findById(updatedMilestone._id)
        .populate("projectId")
        .populate("subtasks.assignedTo")
        .populate("createdby");
    } catch (populateError: any) {
      console.error("Response populate error:", populateError.message);
      populated = updatedMilestone;
    }

    // 🔔 Notify manager/admin about milestone update
    if (populated && populated.projectId && (populated as any).projectId.manager) {
      const managerId = (populated as any).projectId.manager.toString();
      if (managerId !== session._id.toString()) {
        emitNotification(
          managerId,
          "🎯 Milestone Updated",
          `Milestone "${populated.title}" has been updated.`,
          "info",
          {
            screen: "TaskScreen",
            params: {
              milestoneId: populated._id.toString(),
              projectId: populated.projectId._id.toString()
            }
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Milestone updated successfully",
      data: populated,
    });
  } catch (error: any) {
    console.error("Update milestone error:", error.message);
    console.error("Full error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  await dbConnect();
  const session = await getSession(req as any);

  const { milestoneId } = await params;
  console.log("DELETE milestoneId:", milestoneId);

  if (!session || !isAdmin(session.role)) {
    return NextResponse.json(
      { success: false, message: "Only admin can delete milestones" },
      { status: 403 }
    );
  }

  try {
    const milestone = await Milestone.findByIdAndDelete(milestoneId);

    console.log("Deleted milestone:", milestone ? "Yes" : "No");

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