import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import { sendEmail } from "@/utils/email";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { reportId, recipients, shareVia } = await req.json();
  const report = await Report.findById(reportId).populate("projectId createdBy");
  if (!report)
    return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });

  if (shareVia === "email") {
    const subject = `Shared Report: ${report.title}`;
    const html = `
      <h3>${report.title}</h3>
      <p>Project: ${report.projectId.name}</p>
      <p>Type: ${report.reportType}</p>
      <p>${report.content}</p>
    `;
    await Promise.all(recipients.map((email: string) => sendEmail(email, subject, html)));
  }

  report.sharedWith.push(...recipients);
  report.sharedVia = shareVia;
  await report.save();

  return NextResponse.json({ success: true, message: "Report shared successfully", data: report });
}
