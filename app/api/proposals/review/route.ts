import dbConnect from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { proposalId, action, remarks } = await req.json();
  const proposal = await Proposal.findById(proposalId);
  if (!proposal)
    return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });

  if (action === "approve") {
    proposal.status = "approved";
    proposal.reviewedBy = session._id;
    proposal.reviewedAt = new Date();
  } else if (action === "reject") {
    proposal.status = "rejected";
    proposal.remarks = remarks;
  }

  await proposal.save();
  return NextResponse.json({ success: true, message: `Proposal ${action}d successfully`, data: proposal });
}
