import dbConnect from "@/lib/dbConnect";
import MaterialUsed from "@/models/MaterialUsed";
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

  // 🔎 Check current stock
  const material = await Material.findById(materialId);
  if (!material) {
    return NextResponse.json(
      { success: false, message: "Material not found" },
      { status: 404 }
    );
  }

  if (material.quantity < Number(quantity)) {
    return NextResponse.json(
      { success: false, message: "Insufficient material stock" },
      { status: 400 }
    );
  }

  // ✅ Create MaterialUsed entry
  const materialUsed = await MaterialUsed.create({
    ...body,
    addedBy: session._id,
    status: "Used",
  });

  // 🔻 REDUCE MATERIAL QUANTITY
  const updatedMaterial = await Material.findByIdAndUpdate(
    materialId,
    { $inc: { quantity: -Number(quantity) } }, // ✅ subtract
    { new: true }
  );

  return NextResponse.json({
    success: true,
    message: "Material used and stock reduced successfully",
    data: {
      materialUsed,
      material: updatedMaterial,
    },
  });
}
