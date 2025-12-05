import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

// ✅ GET all tasks
export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"])) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const tasks = await Task.find()
    .populate("projectId assignedTo createdBy")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: tasks });
}

// ✅ CREATE new task
export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"])) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  // Validation
  if (!body.title || !body.projectId) {
    return NextResponse.json({ success: false, message: "Title and projectId are required" }, { status: 400 });
  }

  // Verify project exists
  const project = await Project.findById(body.projectId);
  if (!project) {
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
  }

  // ✅ Create task with session user as creator
  const task = await Task.create({
    title: body.title,
    description: body.description || "",
    projectId: body.projectId,
    assignedTo: body.assignedTo || null,
    startDate: body.startDate || null,
    dueDate: body.dueDate || null,
    status: body.status || "todo",
    progress: body.progress || 0,
    attachments: body.attachments || [],
    createdBy: session._id, // ✅ store session user ID
  });

  // ✅ Populate references before returning
  const populated = await Task.findById(task._id)
    .populate("projectId assignedTo createdBy");

  return NextResponse.json({
    success: true,
    message: "Task created successfully",
    data: populated,
  });
}
