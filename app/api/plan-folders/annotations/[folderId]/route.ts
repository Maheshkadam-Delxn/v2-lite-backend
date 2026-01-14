// import { NextResponse,NextRequest } from "next/server";
// import mongoose from "mongoose";
// import dbConnect from "@/lib/dbConnect";
// import PlanFolder from "@/models/PlanAnnotaion";
// import { getSession } from "@/lib/auth";

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { folderId: string } }
// ) {
//   await dbConnect();

//   const session = await getSession(req as any);
//   if (!session) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   const { documentId, versionId, annotations } = await req.json();

//   if (
//     !mongoose.Types.ObjectId.isValid(documentId) ||
//     !mongoose.Types.ObjectId.isValid(versionId) ||
//     !Array.isArray(annotations)
//   ) {
//     return NextResponse.json(
//       { success: false, message: "Invalid payload" },
//       { status: 400 }
//     );
//   }
// const { folderId }= await params;
//   const folder = await PlanFolder.findById(folderId);
//   if (!folder) {
//     return NextResponse.json(
//       { success: false, message: "Folder not found" },
//       { status: 404 }
//     );
//   }

//   const document = folder.planDocuments.id(documentId);
//   if (!document) {
//     return NextResponse.json(
//       { success: false, message: "Document not found" },
//       { status: 404 }
//     );
//   }

//   const version = document.versions.id(versionId);
//   if (!version) {
//     return NextResponse.json(
//       { success: false, message: "Version not found" },
//       { status: 404 }
//     );
//   }

//   // 🔥 Replace annotations
//   version.annotations = annotations.map((a: any) => ({
//     x: a.x,
//     y: a.y,
//     text: a.text,
//     createdBy: session._id,
//   }));

//   await folder.save();

//   return NextResponse.json({
//     success: true,
//     message: "Annotations updated successfully",
//   });
// }




// export async function GET(
//   req: Request,
//   { params }: { params: { folderId: string } }
// ) {
//   await dbConnect();

//   const session = await getSession(req as any);
//   if (!session) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   const { searchParams } = new URL(req.url);
//   const documentId = searchParams.get("documentId");
//   const versionId = searchParams.get("versionId");

//   if (
//     !mongoose.Types.ObjectId.isValid(documentId || "") ||
//     !mongoose.Types.ObjectId.isValid(versionId || "")
//   ) {
//     return NextResponse.json(
//       { success: false, message: "Invalid documentId or versionId" },
//       { status: 400 }
//     );
//   }
//   const {folderId}= await params;

//   const folder = await PlanFolder.findById(folderId)
//     .populate("planDocuments.versions.annotations.createdBy", "name email");

//   if (!folder) {
//     return NextResponse.json(
//       { success: false, message: "Folder not found" },
//       { status: 404 }
//     );
//   }

//   const document = folder.planDocuments.id(documentId);
//   if (!document) {
//     return NextResponse.json(
//       { success: false, message: "Document not found" },
//       { status: 404 }
//     );
//   }

//   const version = document.versions.id(versionId);
//   if (!version) {
//     return NextResponse.json(
//       { success: false, message: "Version not found" },
//       { status: 404 }
//     );
//   }

//   return NextResponse.json({
//     success: true,
//     annotations: version.annotations || [],
//   });
// }



import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import PlanFolder from "@/models/PlanAnnotaion";
import { getSession } from "@/lib/auth";

/* ========================= PATCH ========================= */
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

  const { documentId, versionId, annotations } = await req.json();

  if (
    !mongoose.Types.ObjectId.isValid(documentId) ||
    !mongoose.Types.ObjectId.isValid(versionId) ||
    !Array.isArray(annotations)
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid payload" },
      { status: 400 }
    );
  }

  // ✅ unwrap params
  const { folderId } = await context.params;

  const folder = await PlanFolder.findById(folderId);
  if (!folder) {
    return NextResponse.json(
      { success: false, message: "Folder not found" },
      { status: 404 }
    );
  }

  const document = folder.planDocuments.id(documentId);
  if (!document) {
    return NextResponse.json(
      { success: false, message: "Document not found" },
      { status: 404 }
    );
  }

  const version = document.versions.id(versionId);
  if (!version) {
    return NextResponse.json(
      { success: false, message: "Version not found" },
      { status: 404 }
    );
  }
console.log(annotations);
  version.annotations = annotations.map((a: any) => ({
    x: a.x,
    y: a.y,
    text: a.text,
     imageUri: a.imageUri || null,
    audioUri: a.audioUri || null,
    audioDuration: a.audioDuration || 0,
    createdBy: session._id,
  }));

  await folder.save();

  return NextResponse.json({
    success: true,
    message: "Annotations updated successfully",
  });
}


/* ========================= GET ========================= */
export async function GET(
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

  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("documentId");
  const versionId = searchParams.get("versionId");

  if (
    !mongoose.Types.ObjectId.isValid(documentId || "") ||
    !mongoose.Types.ObjectId.isValid(versionId || "")
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid documentId or versionId" },
      { status: 400 }
    );
  }

  // ✅ unwrap params
  const { folderId } = await context.params;

  const folder = await PlanFolder.findById(folderId).populate(
    "planDocuments.versions.annotations.createdBy",
    "name email"
  );

  if (!folder) {
    return NextResponse.json(
      { success: false, message: "Folder not found" },
      { status: 404 }
    );
  }

  const document = folder.planDocuments.id(documentId);
  if (!document) {
    return NextResponse.json(
      { success: false, message: "Document not found" },
      { status: 404 }
    );
  }

  const version = document.versions.id(versionId);
  if (!version) {
    return NextResponse.json(
      { success: false, message: "Version not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    annotations: version.annotations || [],
  });
}

