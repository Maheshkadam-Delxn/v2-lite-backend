import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { materialId, vendorName, invoiceUrl, purchaseDate, remarks } = await req.json();
  const material = await Material.findById(materialId);
  if (!material)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });

  Object.assign(material, {
    vendorName,
    invoiceUrl,
    purchaseDate,
    remarks,
    status: "approved",
    approvedBy: session._id,
    approvedAt: new Date(),
  });

  await material.save();

  return NextResponse.json({
    success: true,
    message: "Material purchase recorded successfully",
    data: material,
  });
}
