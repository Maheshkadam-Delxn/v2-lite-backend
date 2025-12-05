import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess, isAdmin } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap async params

  const task = await Task.findById(id).populate("projectId assignedTo createdBy comments.userId");
  if (!task)
    return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: task });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap async params

  const updates = await req.json();
  const task = await Task.findById(id);
  if (!task)
    return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });

  if (
    !canAccess(session.role, ["admin", "manager"]) &&
    task.assignedTo.toString() !== session._id.toString()
  )
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  Object.assign(task, updates);
  await task.save();

  return NextResponse.json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json(
      { success: false, message: "Only admin can delete tasks" },
      { status: 403 }
    );

  const { id } = await context.params; // ✅ unwrap async params

  const deleted = await Task.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });

  return NextResponse.json({
    success: true,
    message: "Task deleted successfully",
  });
}
