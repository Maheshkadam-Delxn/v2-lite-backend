import dbConnect from "@/lib/dbConnect";
import ProjectType from "@/models/ProjectType";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

// ✅ GET Project Type by ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await context.params; // ✅ unwrap Promise

  try {
    const type = await ProjectType.findById(id);
    if (!type)
      return NextResponse.json({ success: false, message: "Project type not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: type });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Invalid ID format" }, { status: 400 });
  }
}

// ✅ UPDATE Project Type
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req);
  const { id } = await context.params; // ✅ unwrap Promise

  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  try {
    const updates = await req.json();
    const updated = await ProjectType.findByIdAndUpdate(id, updates, { new: true });

    if (!updated)
      return NextResponse.json({ success: false, message: "Project type not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Project type updated", data: updated });
  } catch (error: any) {
    console.error("Error updating project type:", error.message);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

// ✅ DELETE Project Type
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req);
  const { id } = await context.params; // ✅ unwrap Promise

  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  try {
    const deleted = await ProjectType.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ success: false, message: "Project type not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Project type deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting project type:", error.message);
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}
