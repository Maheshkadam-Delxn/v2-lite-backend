import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PlanFolder from "@/models/PlanAnnotaion";
import { getSession } from "@/lib/auth";

/* ================= ADD NEW VERSION ================= */
export async function POST(req, { params }) {
  try {
    await dbConnect();

    /* ---------- AUTH ---------- */
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, documentId } = await params;
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { message: "Image is required" },
        { status: 400 }
      );
    }

    /* ---------- FIND FOLDER ---------- */
    const folder = await PlanFolder.findById(id);
    if (!folder) {
      return NextResponse.json(
        { message: "Plan folder not found" },
        { status: 404 }
      );
    }

    /* ---------- FIND DOCUMENT ---------- */
    const document = folder.planDocuments.id(documentId);
    if (!document) {
      return NextResponse.json(
        { message: "Plan document not found" },
        { status: 404 }
      );
    }

    /* ---------- CALCULATE VERSION NUMBER ---------- */
    const versions = document.versions || [];

    const nextVersionNumber =
      versions.length > 0
        ? Math.max(...versions.map(v => v.versionNumber)) + 1
        : 1;

    /* ---------- CREATE NEW VERSION ---------- */
    const newVersion = {
      versionNumber: nextVersionNumber,
      image,
      status: "pending",        // ✅ auto
      approvedBy: null,         // ✅ auto
      annotations: [],          // ✅ empty
      createdAt: new Date(),    // ✅ auto
    };

    document.versions.push(newVersion);

    /* ---------- SAVE ---------- */
    await folder.save();

    /* ---------- RETURN CREATED VERSION ---------- */
    return NextResponse.json(
      {
        message: "New version added successfully",
        version: newVersion,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("ADD VERSION ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

