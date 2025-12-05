import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { projectId, reportType } = await req.json();
  const project = await Project.findById(projectId);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  const reportData = {
    title: `${reportType.toUpperCase()} Report for ${project.name}`,
    projectId,
    createdBy: session._id,
    reportType,
    content: `Auto-generated ${reportType} report for project ${project.name} (${project.projectCode}).`,
  };

  const report = await Report.create(reportData);
  return NextResponse.json({
    success: true,
    message: "Report generated successfully",
    data: report,
  });
}
