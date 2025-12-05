import dbConnect from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { proposalId, documents } = await req.json();
  const proposal = await Proposal.findById(proposalId);
  if (!proposal)
    return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });

  if (proposal.submittedBy.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "You can only submit your own proposals" }, { status: 403 });

  proposal.documents.push(...documents);
  proposal.status = "submitted";
  await proposal.save();

  return NextResponse.json({ success: true, message: "Proposal submitted successfully", data: proposal });
}
