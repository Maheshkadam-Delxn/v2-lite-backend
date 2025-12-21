import dbConnect from "@/lib/dbConnect";
import MaterialReceived from "@/models/MaterialReceived";
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

  const materialreceived = await MaterialReceived.find({ projectId:projectId }).populate("materialId vendorId");

  if (!materialreceived)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });
const dataofm={
  materialreceived
}
console.log("materialreceived",dataofm);
  return NextResponse.json({ success: true, data: dataofm });
}
