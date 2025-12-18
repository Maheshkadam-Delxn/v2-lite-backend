import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

// // ✅ GET all tasks
// export async function GET(req: Request) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session || !canAccess(session.role, ["admin", "manager"])) {
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//   }

//   const tasks = await Task.find()
//     .populate("projectId assignedTo createdBy")
//     .sort({ createdAt: -1 });

//   return NextResponse.json({ success: true, data: tasks });
// }

// // ✅ CREATE new task
// export async function POST(req: Request) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session || !canAccess(session.role, ["admin", "manager"])) {
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//   }

//   const body = await req.json();

//   // Validation
//   if (!body.title || !body.projectId) {
//     return NextResponse.json({ success: false, message: "Title and projectId are required" }, { status: 400 });
//   }

//   // Verify project exists
//   const project = await Project.findById(body.projectId);
//   if (!project) {
//     return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
//   }

//   // ✅ Create task with session user as creator
//   const task = await Task.create({
//     title: body.title,
//     description: body.description || "",
//     projectId: body.projectId,
//     assignedTo: body.assignedTo || null,
//     startDate: body.startDate || null,
//     dueDate: body.dueDate || null,
//     status: body.status || "todo",
//     progress: body.progress || 0,
//     attachments: body.attachments || [],
//     createdBy: session._id, // ✅ store session user ID
//   });

//   // ✅ Populate references before returning
//   const populated = await Task.findById(task._id)
//     .populate("projectId assignedTo createdBy");

//   return NextResponse.json({
//     success: true,
//     message: "Task created successfully",
//     data: populated,
//   });
// }

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"])) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const filter: any = {};
  if (searchParams.get("projectId")) filter.projectId = searchParams.get("projectId");
  if (searchParams.get("annotationId")) filter.annotationId = searchParams.get("annotationId");
  if (searchParams.get("status")) filter.status = searchParams.get("status");

  const tasks = await Task.find(filter)
    .populate("projectId assignedTo createdBy")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: tasks });
}


export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"])) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.title || !body.projectId) {
    return NextResponse.json(
      { success: false, message: "Title and projectId are required" },
      { status: 400 }
    );
  }

  const project = await Project.findById(body.projectId);
  if (!project) {
    return NextResponse.json(
      { success: false, message: "Project not found" },
      { status: 404 }
    );
  }

  // 🧠 Business logic
  let taskType = "general";
  if (body.annotationId) taskType = "annotation";
  else if (body.planId) taskType = "plan";

  const task = await Task.create({
    title: body.title,
    description: body.description || "",
    projectId: body.projectId,
    planId: body.planId || null,
    planVersion: body.planVersion || null,
    annotationId: body.annotationId || null,
    taskType,
    priority: body.priority || "medium",
    assignedTo: Array.isArray(body.assignedTo) ? body.assignedTo : [],
    startDate: body.startDate || null,
    dueDate: body.dueDate || null,
    status: body.status || "todo",
    progress: body.progress || 0,
    attachments: body.attachments || [],
    createdBy: session._id,
  });

  const populated = await Task.findById(task._id)
    .populate("projectId assignedTo createdBy");

  return NextResponse.json(
    {
      success: true,
      message: "Task created successfully",
      data: populated,
    },
    { status: 201 }
  );
}
