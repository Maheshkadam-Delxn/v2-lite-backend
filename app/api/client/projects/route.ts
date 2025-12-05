import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  // Basic auth: Ensure user is logged in
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  try {
    // Fetch projects where clientEmail matches the logged-in user's email
    const projects = await Project.find({ clientEmail: session.email })
      .populate("manager engineers projectType")
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      data: projects 
    });
  } catch (error: any) {
    console.error("Error fetching client projects:", error.message);
    return NextResponse.json({ success: false, message: "Failed to load projects" }, { status: 500 });
  }
}