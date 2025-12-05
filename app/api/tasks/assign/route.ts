import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { taskId, userId } = await req.json();
  const task = await Task.findById(taskId);
  if (!task)
    return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });

  const user = await User.findById(userId);
  if (!user)
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

  task.assignedTo = userId;
  await task.save();

  return NextResponse.json({ success: true, message: "Task assigned successfully", data: task });
}
