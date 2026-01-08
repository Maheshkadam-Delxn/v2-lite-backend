// api/milestones/route.js - Fixed spelling in POST mapping
import dbConnect from "@/lib/dbConnect";
import Milestone from "@/models/Milestone";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";


// ✅ CREATE Milestone (ALL FIELDS)
export async function GET(req: Request,context: { params: Promise<{ projectId: string }> }) {
  await dbConnect();
const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  console.log("Session in milestone POST:", session);

   const { projectId } = await context.params; 

 
 

  try {
   

    const milestones = await Milestone.find({ projectId: projectId });

    if (!milestones) {
      return NextResponse.json(
        { success: false, message: "No milestones found for this project" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Milestones fetched successfully",
      data: milestones,
    });

    // ✅ Create milestone (schema controls progress & status)
  

   
  } catch (error: any) {
    console.error("Error creating milestone:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching milestone",
      },
      { status: 500 }
    );
  }
}
