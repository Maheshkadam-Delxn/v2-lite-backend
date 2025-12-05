import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";

export async function GET() {
  await dbConnect();
  const roles = await Role.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await dbConnect();

    const { name, slug, description, permissions, isSystem } = body;

    if (!name)
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });

    // Check if role already exists
    const existing = await Role.findOne({ name });
    if (existing)
      return NextResponse.json({ error: "Role with this name already exists" }, { status: 409 });

    const newRole = await Role.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description: description || "",
      permissions: permissions || [],
      isSystem: isSystem || false,
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error: any) {
    console.error("Role creation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
