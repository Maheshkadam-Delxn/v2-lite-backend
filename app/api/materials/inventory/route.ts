import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { materialId, quantity } = await req.json();
  const material = await Material.findById(materialId);
  if (!material)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });

  material.quantity = quantity;
  await material.save();

  return NextResponse.json({
    success: true,
    message: "Inventory updated successfully",
    data: material,
  });
}
