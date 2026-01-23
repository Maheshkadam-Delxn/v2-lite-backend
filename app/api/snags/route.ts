import dbConnect from "@/lib/dbConnect";
import Snag from "@/models/Snag";
import ActivityLog from "@/models/ActivityLog";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // 1️⃣ Validate required fields
    if (!body.projectId || !body.title || !body.location || !body.category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (projectId, title, location, category)" },
        { status: 400 }
      );
    }

    // 2️⃣ Create Snag
    const newSnag = await Snag.create({
      ...body,
      reportedBy: session._id,
      status: "open", // Force Open on create
      // severity default is 'medium'
    });

    // 3️⃣ Log Activity
    await ActivityLog.create({
      userId: session._id,
      projectId: body.projectId,
      action: "Snag Created",
      description: `Snag '${newSnag.title}' created in ${newSnag.location}`,
      entityType: "snag",
      entityId: newSnag._id,
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data: newSnag }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating snag:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error while creating snag", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const status = searchParams.get("status");
  const assignedTo = searchParams.get("assignedTo");

  // Build Query
  const query: any = {};
  if (projectId) query.projectId = projectId;

  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  try {
    const snags = await Snag.find(query)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: snags });
  } catch (error: any) {
    console.error("Error fetching snags:", error.message);
    return NextResponse.json({ success: false, message: "Failed to load snags" }, { status: 500 });
  }
}
