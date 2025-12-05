import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { taskId, text } = await req.json();
  const task = await Task.findById(taskId);
  if (!task)
    return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });

  task.comments.push({ userId: session._id, text, date: new Date() });
  await task.save();

  return NextResponse.json({ success: true, message: "Comment added successfully", data: task });
}
