import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap promise

  const material = await Material.findById(id).populate("projectId addedBy approvedBy");
  if (!material)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: material });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap promise

  const updates = await req.json();
  const material = await Material.findById(id);
  if (!material)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });

  if (
    !canAccess(session.role, ["admin", "manager"]) &&
    material.addedBy.toString() !== session._id.toString()
  )
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  Object.assign(material, updates);
  await material.save();

  return NextResponse.json({
    success: true,
    message: "Material updated successfully",
    data: material,
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json(
      { success: false, message: "Only admin can delete materials" },
      { status: 403 }
    );

  const { id } = await context.params; // ✅ unwrap promise

  const deleted = await Material.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });

  return NextResponse.json({
    success: true,
    message: "Material deleted successfully",
  });
}
