import dbConnect from "@/lib/dbConnect";
import Document from "@/models/Document";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Activity from "@/models/Activity";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("documentId");
  if (!documentId)
    return NextResponse.json({ success: false, message: "Document ID is required" }, { status: 400 });

  const document = await Document.findById(documentId);
  if (!document)
    return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });

  await Activity.create({
    userId: session._id,
    action: "download",
    entityType: "Document",
    entityId: document._id,
    description: `Downloaded document: ${document.name}`,
  });

  return NextResponse.redirect(document.url);
}
