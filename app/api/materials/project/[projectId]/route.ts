import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import Project from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";


export async function GET(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { projectId } = await context.params; // ✅ unwrap promise

  const material = await Material.find({ projectId:projectId });
  if (!material)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: material });
}
