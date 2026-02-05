import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    console.log(id);
    const { documentUrls } = await req.json();
    console.log(documentUrls);
    if (!Array.isArray(documentUrls) || documentUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: "No documents provided" },
        { status: 400 }
      );
    }

    const project = await Project.findById(id);
    console.log(project);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // ✅ PUSH URLs ONLY (matches schema)
    project.handoverDocuments.push(...documentUrls);

    await project.save();

    return NextResponse.json({
      success: true,
      message: "Handover documents uploaded successfully",
      documentsCount: project.handoverDocuments.length,
    });
  } catch (error) {
    console.error("Handover documents error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload documents" },
      { status: 500 }
    );
  }
}
