// api/milestones/route.js - Fixed spelling in POST mapping
import dbConnect from "@/lib/dbConnect";
import Milestone from "@/models/Milestone";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";


// ✅ CREATE Milestone (ALL FIELDS)

//all changes are done here
export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  console.log("Session in milestone POST:", session);

  // 🔐 Authorization
  if (!session ) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const {
      // 🔹 Milestone fields
      projectId,
      title,
      description,
      subtasks,        // array of subtasks
      progress,        // optional (schema recalculates)
      status,          // optional (schema recalculates)
      createdAt,       // ignored by schema timestamps
      updatedAt,       // ignored by schema timestamps
    } = await req.json();

    // 🛑 Required validation
    if (!projectId || !title) {
      return NextResponse.json(
        {
          success: false,
          message: "projectId and title are required",
        },
        { status: 400 }
      );
    }

    // ✅ Create milestone (schema controls progress & status)
    const milestone = await Milestone.create({
      projectId,
      title,
      description,

      subtasks: subtasks?.map((subtask: any) => ({
        title: subtask.title,
        description: subtask.description,  // Fixed: Corrected spelling from "desription" to "description"
        startDate: subtask.startDate,
        endDate: subtask.endDate,
        assignedTo: subtask.assignedTo,
        isCompleted: subtask.isCompleted,
        attachments: subtask.attachments,
      })),

      // even if passed, schema hook recalculates these safely
      progress,
      status,
      createdby: session._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Milestone created successfully",
        data: milestone,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating milestone:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while creating milestone",
      },
      { status: 500 }
    );
  }
}


// ✅ GET Milestones
export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const milestoneId = searchParams.get("milestoneId");
    const projectId = searchParams.get("projectId");

    // 🔹 Get single milestone by ID
    if (milestoneId) {
      const milestone = await Milestone.findById(milestoneId)
        .populate("projectId")
        .populate("subtasks.assignedTo");

      if (!milestone) {
        return NextResponse.json(
          { success: false, message: "Milestone not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: milestone });
    }

    // 🔹 Get milestones by projectId
    if (projectId) {
      const milestones = await Milestone.find({ projectId })
        .sort({ createdAt: 1 })
        .populate("subtasks.assignedTo");

      return NextResponse.json({ success: true, data: milestones });
    }

    // 🔹 Get all milestones
    const milestones = await Milestone.find()
      .sort({ createdAt: -1 })
      .populate("subtasks.assignedTo");

    return NextResponse.json({ success: true, data: milestones });
  } catch (error: any) {
    console.error("Error fetching milestones:", error.message);

    return NextResponse.json(
      { success: false, message: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}