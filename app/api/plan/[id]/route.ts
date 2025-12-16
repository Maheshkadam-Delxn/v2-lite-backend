import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Plan from "@/models/Plan";
import { Types } from "mongoose";

/* =========================================================
   UPDATE PLAN / ANNOTATIONS
   ========================================================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  console.log("REQ",req);
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

  console.log("Plan",plan);
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
