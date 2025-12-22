import { NextResponse,NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PlanFolder from "@/models/PlanAnnotaion";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ folderId: string }> }
) {
  await dbConnect();

  const session = await getSession(req as any);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  // ✅ unwrap params properly
  const { folderId } = await context.params;

  const { documentName, imageUrl } = await req.json();

  if (!documentName || !imageUrl) {
    return NextResponse.json(
      { success: false, message: "documentName and imageUrl are required" },
      { status: 400 }
    );
  }

  const folder = await PlanFolder.findById(folderId);
  if (!folder) {
    return NextResponse.json(
      { success: false, message: "Folder not found" },
      { status: 404 }
    );
  }

  const newDocument = {
    _id: new mongoose.Types.ObjectId(),
    name: documentName,
    versions: [
      {
        versionNumber: 1,
        image: imageUrl,
        createdAt: new Date(),
      },
    ],
  };

  folder.planDocuments.push(newDocument);
  await folder.save();

  return NextResponse.json({
    success: true,
    message: "Document created successfully",
    data: newDocument,
  });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ folderId: string }> }
) {
  await dbConnect();

  // ✅ unwrap params properly
  const { folderId } = await context.params;

  const folder = await PlanFolder.findById(folderId).select("planDocuments");

  if (!folder) {
    return NextResponse.json(
      { success: false, message: "Folder not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: folder.planDocuments || [],
  });
}
