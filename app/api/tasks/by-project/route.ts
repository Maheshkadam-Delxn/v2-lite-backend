import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  // 🛡️ Authentication
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//sample
  // ✅ Get projectId from query string
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId)
    return NextResponse.json({ success: false, message: "Project ID is required" }, { status: 400 });

  try {
    // 🧠 Restrict visibility (optional)
    if (!canAccess(session.role, ["admin", "manager"])) {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    // ✅ Fetch tasks for this project
    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    console.error("Error fetching tasks:", error.message);
    return NextResponse.json({ success: false, message: "Failed to load tasks" }, { status: 500 });
  }
}
