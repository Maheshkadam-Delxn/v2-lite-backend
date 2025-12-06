import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // Step 1: Find roles that have any siteSurveys permission
    const roles = await Role.find({
      $or: [
        { "permissions.siteSurvey.view": true },
        { "permissions.siteSurvey.create": true },
        { "permissions.siteSurvey.update": true },
        { "permissions.siteSurvey.delete": true },
      ],
    });

    if (roles.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        message: "No roles have site survey permissions.",
      });
    }

    // Extract role names from role documents
    const roleNames = roles.map((r) => r.name);

    // Step 2: Find users who belong to these roles
    const users = await User.find({ role: { $in: roleNames } }).select("-password");

    return NextResponse.json({
      success: true,
      roleNames,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users with site survey permissions:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
