import dbConnect from "@/lib/dbConnect";
import MaterialRequest from "@/models/MaterialRequest";
import Project from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";
import Material from "@/models/Material";


export async function GET(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { projectId } = await context.params; // ✅ unwrap promise

  const materialrequest = await MaterialRequest.find({ projectId:projectId }).populate("materialId");

  if (!materialrequest)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });
const dataofm={
  materialrequest 
}
console.log("materialrequest",dataofm);
  return NextResponse.json({ success: true, data: dataofm });
}
