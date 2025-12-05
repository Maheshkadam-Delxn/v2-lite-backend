import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { projectId } = await params;
console.log(projectId);
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing Project ID" },
        { status: 400 }
      );
    }

    // Fetch users assigned to this project
    const users = await User.find({
      assignedProjects: { $in: [projectId] }
    }).select("-password -resetToken -resetTokenExpire");

    return NextResponse.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
