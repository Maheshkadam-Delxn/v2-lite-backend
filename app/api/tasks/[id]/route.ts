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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Unwrap async params (Next.js App Router fix)
    const { id } = await context.params;

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // 🔐 Permission Check
    const isAdminOrManager = canAccess(session.role, ["admin", "manager"]);
    const isAssignedUser = task.assignedTo.some(
      (userId:any) => userId.toString() === session._id.toString()
    );

    if (!isAdminOrManager && !isAssignedUser) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      );
    }

    const updates = await req.json();

    /* ==========================
       CONTROLLED FIELD UPDATES
       ========================== */
    const allowedFields = [
      "title",
      "description",
      "assignedTo",
      "startDate",
      "dueDate",
      "status",
      "progress",
      "attachments",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        (task as any)[field] = updates[field];
      }
    });

    /* ==========================
       AUTO STATUS ↔ PROGRESS SYNC
       ========================== */
    if (typeof task.progress === "number") {
      if (task.progress === 0) task.status = "todo";
      else if (task.progress > 0 && task.progress < 100)
        task.status = "inprogress";
      else if (task.progress === 100) task.status = "done";
    }

    await task.save();

    const populatedTask = await Task.findById(task._id).populate(
      "projectId assignedTo createdBy comments.userId"
    );

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      data: populatedTask,
    });
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
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
