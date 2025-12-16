import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Plan from "@/models/Plan";
import { Types } from "mongoose";

/* =========================================================
   GET SINGLE PLAN
   ========================================================= */
export async function GET(
  req: Request,
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

  // Validate ObjectId
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid Plan ID" },
      { status: 400 }
    );
  }

  const plan = await Plan.findOne({ _id: id, isArchived: false })
    .populate("uploadedBy projectId")
    .sort({ uploadedAt: -1 });

  if (!plan) {
    return NextResponse.json(
      { success: false, message: "Plan not found" },
      { status: 404 }
    );
  }

  // Optionally populate current version details (e.g., annotations if needed)
  const currentVersion = plan.versions.find(
    (v: any) => v.versionNumber === plan.currentVersion
  );
  if (currentVersion) {
    // Filter out deleted annotations if displaying them
    currentVersion.annotations = currentVersion.annotations.filter(
      (ann: any) => !ann.isDeleted
    );
  }

  return NextResponse.json({ success: true, data: { ...plan.toObject(), currentVersion } });
}

/* =========================================================
   UPDATE PLAN / ANNOTATIONS
   ========================================================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  console.log("REQ", req);
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const body = await req.json();
  const { action } = body;

  const { id } = await context.params;
  const plan = await Plan.findById(id);

  console.log("Plan", plan);
  if (!plan)
    return NextResponse.json(
      { success: false, message: "Plan not found" },
      { status: 404 }
    );

  const version = plan.versions.find(
    (v: any) => v.versionNumber === plan.currentVersion
  );

  if (!version)
    return NextResponse.json(
      { success: false, message: "Invalid plan version" },
      { status: 400 }
    );

  /* =====================================================
     UPDATE PLAN META
     ===================================================== */
  if (action === "UPDATE_PLAN") {
    plan.name = body.name ?? plan.name;
    await plan.save();

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
      data: plan
    });
  }

  /* =====================================================
     ADD ANNOTATION
     ===================================================== */
  if (action === "ADD_ANNOTATIONS") {
    for (const ann of body.annotations) {
      version.annotations.push({
        _id: new Types.ObjectId(),
        type: ann.type,
        position: ann.position,
        payload: ann.payload,
        createdBy: session._id,
        createdAt: new Date()
      });
    }

    await plan.save();

    return NextResponse.json({
      success: true,
      message: "Annotations added successfully",
      data: version.annotations
    });
  }

  /* =====================================================
     UPDATE ANNOTATION
     ===================================================== */
  if (action === "UPDATE_ANNOTATION") {
    const annotation = version.annotations.id(body.annotationId);
    if (!annotation)
      return NextResponse.json(
        { success: false, message: "Annotation not found" },
        { status: 404 }
      );

    if (body.position) annotation.position = body.position;
    if (body.payload) annotation.payload = body.payload;
    annotation.updatedAt = new Date();

    await plan.save();

    return NextResponse.json({
      success: true,
      message: "Annotation updated successfully",
      data: annotation
    });
  }

  /* =====================================================
     DELETE ANNOTATION (SOFT DELETE)
     ===================================================== */
  if (action === "DELETE_ANNOTATION") {
    const annotation = version.annotations.id(body.annotationId);
    if (!annotation)
      return NextResponse.json(
        { success: false, message: "Annotation not found" },
        { status: 404 }
      );

    annotation.isDeleted = true;
    annotation.updatedAt = new Date();

    await plan.save();

    return NextResponse.json({
      success: true,
      message: "Annotation deleted successfully"
    });
  }

  /* =====================================================
     INVALID ACTION
     ===================================================== */
  return NextResponse.json(
    { success: false, message: "Invalid action" },
    { status: 400 }
  );
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession(req as any);

  const { id } = await context.params;

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Validate ObjectId
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid Plan ID" },
      { status: 400 }
    );
  }

  const plan = await Plan.findById(id);

  if (!plan) {
    return NextResponse.json(
      { success: false, message: "Plan not found" },
      { status: 404 }
    );
  }

  await Plan.findByIdAndDelete(id);

  return NextResponse.json({
    success: true,
    message: "Plan deleted successfully"
  });
}