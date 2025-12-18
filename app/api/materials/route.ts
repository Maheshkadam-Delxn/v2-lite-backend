import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import Project from "@/models/Project";
import BOQ from "@/models/Boq";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager", "engineer"])) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  try {
    // ✅ Extract `projectId` from URL query params
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    // ✅ Build query conditionally
    const filter = projectId ? { projectId } : {};

    const materials = await Material.find(filter)
      .populate("projectId addedBy approvedBy")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { success: false, message: "Server error while fetching materials" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
   if (!session)
     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await Project.findById(body.projectId);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  if (!body.name || !body.quantity || !body.unit) {
  return NextResponse.json(
    { success: false, message: "name, quantity and unit are required" },
    { status: 400 }
  );
}

if (body.boqItemId) {
  const boq = await BOQ.findById(body.boqItemId);
  if (!boq || boq.projectId.toString() !== body.projectId) {
    return NextResponse.json(
      { success: false, message: "Invalid BOQ reference" },
      { status: 400 }
    );
  }
}


  const material = await Material.create({
    ...body,
    addedBy: session._id,
    status: "pending",
  });

  return NextResponse.json({
    success: true,
    message: "Material added successfully",
    data: material,
  });
}
