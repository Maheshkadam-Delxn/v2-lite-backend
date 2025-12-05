import dbConnect from "@/lib/dbConnect";
import Survey from "@/models/Survey";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { surveyId, action, reason } = await req.json();
  const survey = await Survey.findById(surveyId);
  if (!survey)
    return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

  if (action === "approve") {
    survey.status = "approved";
    survey.approvedBy = session._id;
    survey.approvedAt = new Date();
  } else if (action === "reject") {
    survey.status = "rejected";
    survey.rejectionReason = reason;
  }

  await survey.save();
  return NextResponse.json({ success: true, message: `Survey ${action}d successfully`, data: survey });
}
