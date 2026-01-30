import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Milestone from "@/models/Milestone";
import Snag from "@/models/Snag";
import Project from "@/models/Project";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } =   await params;

    /* ============================
       0️⃣ Validate Project Exists
    ============================ */
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    /* ============================
       1️⃣ Milestone Completion Check
    ============================ */
    const totalMilestones = await Milestone.countDocuments({projectId:id});

    const incompleteMilestones = await Milestone.countDocuments({
      projectId:id,
      status: { $ne: "completed" },
    });
    console.log("Total milestones:", totalMilestones);
    console.log("Incomplete milestones:", incompleteMilestones);

    const milestonesCompleted =
      totalMilestones > 0 && incompleteMilestones === 0;

      console.log("Milestones completed:", milestonesCompleted);

    /* ============================
       2️⃣ Snag Closure Check
    ============================ */
    const openSnags = await Snag.countDocuments({
      projectId:id,
      status: { $ne: "closed" },
    });

    const snagsClosed = openSnags === 0;

    /* ============================
       3️⃣ Final Readiness
    ============================ */
    console.log("Snags closed:", snagsClosed);
    const handoverReady = milestonesCompleted && snagsClosed;
    console.log("Handover ready:", handoverReady);
    return NextResponse.json({
      projectId:id ,
      milestones: {
        total: totalMilestones,
        incomplete: incompleteMilestones,
        completed: milestonesCompleted,
      },
      snags: {
        open: openSnags,
        closed: snagsClosed,
      },
      handoverReady,
    });
  } catch (error) {
    console.error("Handover check error:", error);
    return NextResponse.json(
      { message: "Failed to perform handover checks" },
      { status: 500 }
    );
  }
}
