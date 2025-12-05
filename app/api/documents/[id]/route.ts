import dbConnect from "@/lib/dbConnect";
import Document from "@/models/Document";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const document = await Document.findById(id).populate("uploadedBy projectId");
  if (!document)
    return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: document });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const document = await Document.findById(id);
  if (!document)
    return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });

  if (!isAdmin(session.role) && document.uploadedBy.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  await Document.findByIdAndDelete(id);

  return NextResponse.json({ success: true, message: "Document deleted successfully" });
}
