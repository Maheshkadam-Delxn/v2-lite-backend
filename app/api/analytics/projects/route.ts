import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const [ongoing, completed, delayed] = await Promise.all([
    Project.countDocuments({ status: "ongoing" }),
    Project.countDocuments({ status: "completed" }),
    Project.countDocuments({ status: "delayed" }),
  ]);

  const avgTasks = await Task.aggregate([
    { $group: { _id: "$projectId", avgProgress: { $avg: "$progress" } } },
  ]);

  return NextResponse.json({
    success: true,
    data: {
      ongoing,
      completed,
      delayed,
      averageProgress: avgTasks.reduce((a, b) => a + b.avgProgress, 0) / (avgTasks.length || 1),
    },
  });
}
