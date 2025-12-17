import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Annotation from "@/models/Annotation";

/* =========================================================
   UPDATE / RESOLVE ANNOTATION
   ========================================================= */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const updateData = await req.json();

    const annotation = await Annotation.findById(id);
    if (!annotation) {
      return NextResponse.json(
        { success: false, message: "Annotation not found" },
        { status: 404 }
      );
    }

    // Auto set resolvedAt
    if (updateData.status === "resolved") {
      updateData.resolvedAt = new Date();
    }

    Object.assign(annotation, updateData);
    await annotation.save();

    return NextResponse.json(
      {
        success: true,
        message: "Annotation updated successfully",
        data: annotation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE ANNOTATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE ANNOTATION
   ========================================================= */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const annotation = await Annotation.findById(id);
    if (!annotation) {
      return NextResponse.json(
        { success: false, message: "Annotation not found" },
        { status: 404 }
      );
    }

    await Annotation.deleteOne({ _id: id });

    return NextResponse.json(
      {
        success: true,
        message: "Annotation deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE ANNOTATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}