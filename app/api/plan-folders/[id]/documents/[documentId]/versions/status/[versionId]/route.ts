import dbConnect from "@/lib/dbConnect";
import PlanFolder from "@/models/PlanAnnotaion";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }:{
    params: Promise<{
      id: string;
      documentId: string;
      versionId: string;
    }>;
  }
) {
  await dbConnect();

  const session = await getSession(req as any);
  const { id, documentId, versionId } = await params;
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { status, rejectionReason } = await req.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    return NextResponse.json(
      { message: "Rejection reason is required" },
      { status: 400 }
    );
  }

  const folder = await PlanFolder.findById(id);
  if (!folder) {
    return NextResponse.json({ message: "Folder not found" }, { status: 404 });
  }

  const document = folder.planDocuments.id(documentId);
  if (!document) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  const version = document.versions.id(versionId);
  if (!version) {
    return NextResponse.json({ message: "Version not found" }, { status: 404 });
  }

  // 🔐 Update status
  version.status = status;

  if (status === "approved") {
    version.approvedBy = session._id;
    version.approvedAt = new Date();
    version.rejectedBy = null;
    version.rejectionReason = null;
    version.rejectedAt = null;
  }

  if (status === "rejected") {
    version.rejectedBy = session._id;
    version.rejectedAt = new Date();
    version.rejectionReason = rejectionReason;
    version.approvedBy = null;
    version.approvedAt = null;
  }

  await folder.save();

  return NextResponse.json({
    message: `Version ${status} successfully`,
    version,
  });
}
