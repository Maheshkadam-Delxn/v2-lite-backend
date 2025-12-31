import dbConnect from "@/lib/dbConnect";
import BOQ from "@/models/Boq";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
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
  const body = await req.json();
  const { materials, laborCost } = body;

  /* ---------------- BASIC VALIDATION ---------------- */
  if (!Array.isArray(materials) || materials.length === 0) {
    return NextResponse.json(
      { success: false, message: "Materials are required" },
      { status: 400 }
    );
  }

  if (laborCost === undefined || laborCost < 0) {
    return NextResponse.json(
      { success: false, message: "Valid laborCost is required" },
      { status: 400 }
    );
  }

  /* ---------------- FETCH BOQ ---------------- */
  const boq = await BOQ.findById(id);
  if (!boq) {
    return NextResponse.json(
      { success: false, message: "BOQ not found" },
      { status: 404 }
    );
  }

  if (!boq.boqVersion || boq.boqVersion.length === 0) {
    return NextResponse.json(
      { success: false, message: "No previous version exists" },
      { status: 400 }
    );
  }

  /* ---------------- CHECK PREVIOUS VERSION STATUS ---------------- */
  const latestVersion = boq.boqVersion.reduce((latest: any, current: any) =>
    current.versionNumber > latest.versionNumber ? current : latest
  );

  if (latestVersion.status !== "approved") {
    return NextResponse.json(
      {
        success: false,
        message:
          "New version can be created only after the latest version is approved",
      },
      { status: 400 }
    );
  }

  /* ---------------- CALCULATE NEXT VERSION NUMBER ---------------- */
  const nextVersionNumber = latestVersion.versionNumber + 1;

  /* ---------------- ADD NEW VERSION ---------------- */
  boq.boqVersion.push({
    versionNumber: nextVersionNumber,
    materials: materials.map((m: any) => ({
      name: m.name,
      qty: Number(m.qty),
      unit: m.unit,
      rate: Number(m.rate),
    })),
    laborCost: Number(laborCost),
    status: "draft",
    rejectionReason: "",
  });

  boq.updatedBy = session._id;
  boq.status="draft";

  await boq.save(); // triggers pre("save") calculations

  return NextResponse.json({
    success: true,
    message: `BOQ version v${nextVersionNumber} created`,
    versionNumber: nextVersionNumber,
    data: boq,
  });
}
