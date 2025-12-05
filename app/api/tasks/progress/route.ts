import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { taskId, progress, remarks } = await req.json();
  const task = await Task.findById(taskId);
  if (!task)
    return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });

  if (task.assignedTo.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "You can only update your own tasks" }, { status: 403 });

  task.progress = progress;
  task.lastUpdated = new Date();
  task.remarks = remarks;

  if (progress >= 100) {
    task.status = "completed";
    task.completedAt = new Date();
  }

  await task.save();

  return NextResponse.json({ success: true, message: "Task progress updated", data: task });
}
