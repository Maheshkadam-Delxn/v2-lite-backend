import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { Parser } from "json2csv";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";

  const projects = await Project.find().populate("manager engineers").lean();

  if (format === "csv") {
    const parser = new Parser();
    const csv = parser.parse(projects);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="projects.csv"',
      },
    });
  }

  return NextResponse.json({ success: true, data: projects });
}
