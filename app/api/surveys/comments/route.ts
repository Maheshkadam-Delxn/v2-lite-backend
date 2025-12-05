import dbConnect from "@/lib/dbConnect";
import Survey from "@/models/Survey";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { surveyId, text } = await req.json();
  const survey = await Survey.findById(surveyId);
  if (!survey)
    return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

  survey.comments.push({ userId: session._id, text });
  await survey.save();

  return NextResponse.json({ success: true, message: "Comment added successfully", data: survey });
}
