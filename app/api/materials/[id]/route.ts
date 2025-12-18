import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";
import BOQ from "@/models/Boq";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const material = await Material.findById(id).populate(
    "projectId addedBy approvedBy boqItemId"
  );

  if (!material) {
    return NextResponse.json(
      { success: false, message: "Material not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: material });
}


export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const { id } = await context.params;
  const updates = await req.json();

  const material = await Material.findById(id);
  if (!material)
    return NextResponse.json(
      { success: false, message: "Material not found" },
      { status: 404 }
    );

  const isOwner = material.addedBy?.toString() === session._id.toString();
  const isAdminOrManager = canAccess(session.role, ["admin", "manager"]);

  if (!isAdminOrManager && !isOwner)
    return NextResponse.json(
      { success: false, message: "Permission denied" },
      { status: 403 }
    );

  // 🔒 LOCK APPROVED MATERIAL
  if (material.status === "approved") {
    // Allow ONLY remarks update (optional rule)
    if (
      Object.keys(updates).some((key) => key !== "remarks") ||
      !isAdminOrManager
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Approved material cannot be modified",
        },
        { status: 400 }
      );
    }
  }

  // ⛔ Prevent manual status change
  delete updates.status;
  delete updates.approvedBy;
  delete updates.approvedAt;

  Object.assign(material, updates);
  await material.save();

  return NextResponse.json({
    success: true,
    message: "Material updated successfully",
    data: material,
  });
}



export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role)) {
    return NextResponse.json(
      { success: false, message: "Only admin can delete materials" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const deleted = await Material.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Material not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Material deleted successfully",
  });
}

