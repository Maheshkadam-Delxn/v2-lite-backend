import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  const projects = await Project.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { projectCode: { $regex: query, $options: "i" } },
    ],
  }).populate("manager engineers");

  return NextResponse.json({ success: true, data: projects });
}
