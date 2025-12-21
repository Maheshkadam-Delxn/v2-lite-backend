import dbConnect from "@/lib/dbConnect";
import MaterialReceived from "@/models/MaterialReceived";
import Material from "@/models/Material";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();

  const session = await getSession(req as any);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const { projectId, materialId, quantity } = body;

  if (!projectId || !materialId || !quantity) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return NextResponse.json(
      { success: false, message: "Project not found" },
      { status: 404 }
    );
  }

  // ✅ Create MaterialReceived entry
  const materialReceived = await MaterialReceived.create({
    ...body,
    addedBy: session._id,
    status: "Received",
  });

  // 🔁 UPDATE MATERIAL QUANTITY
  const updatedMaterial = await Material.findByIdAndUpdate(
    materialId,
    { $inc: { quantity: Number(quantity) } },
    { new: true }
  );

  if (!updatedMaterial) {
    return NextResponse.json(
      { success: false, message: "Material not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Material received and stock updated successfully",
    data: {
      materialReceived,
      material: updatedMaterial,
    },
  });
}
