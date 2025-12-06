import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";

// // Optional: GET single role by ID (bonus for completeness)
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await context.params;
//     await dbConnect();
//     const role = await Role.findById(id).lean();
//     if (!role) {
//       return NextResponse.json({ error: "Role not found" }, { status: 404 });
//     }
//     return NextResponse.json(role);
//   } catch (error: any) {
//     console.error("Role fetch failed:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// PUT: Update role by ID
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    await dbConnect();

    // Optional: Verify auth token (add your middleware/logic here)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // const token = authHeader.split(" ")[1]; // Verify token...

    const { name, slug, description, permissions, isSystem } = body;

    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    // Find existing role
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Optional: Enforce name uniqueness (skip if updating to same name)
    if (name && name !== existingRole.name) {
      const nameExists = await Role.findOne({ name });
      if (nameExists) {
        return NextResponse.json({ error: "Role with this name already exists" }, { status: 409 });
      }
    }

    // Prevent updating system roles (optional safeguard)
    if (existingRole.isSystem) {
      return NextResponse.json({ error: "System roles cannot be modified" }, { status: 403 });
    }

    // Update role
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        name: name || existingRole.name,
        slug: slug || existingRole.slug,
        description: description !== undefined ? description : existingRole.description,
        permissions: permissions || existingRole.permissions,
        isSystem: isSystem !== undefined ? isSystem : existingRole.isSystem,
      },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json(updatedRole, { status: 200 });
  } catch (error: any) {
    console.error("Role update failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// Optional: DELETE role by ID (if needed)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json({ error: "System roles cannot be deleted" }, { status: 403 });
    }

    await Role.findByIdAndDelete(id);
    return NextResponse.json({ message: "Role deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Role deletion failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}