import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Transaction from "@/models/Transaction";
import Material from "@/models/Material";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const [projectCount, completedProjects, taskStats, totalSpend] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: "completed" }),
    Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    Transaction.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const data = {
    totalProjects: projectCount,
    completedProjects,
    totalTasks: taskStats.reduce((a, b) => a + b.count, 0),
    taskBreakdown: taskStats,
    totalApprovedSpend: totalSpend[0]?.total || 0,
  };

  return NextResponse.json({ success: true, data });
}
