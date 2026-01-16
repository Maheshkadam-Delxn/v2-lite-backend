import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/NewTransaction";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";





export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await Project.findById(body.projectId);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  const material = await Transaction.create({
    ...body,
    createdBy: session._id,

  });

  // --- Budget Exceed Check ---
  try {
    const totalExpenseResult = await Transaction.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(body.projectId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpense = totalExpenseResult[0]?.total || 0;

    if (project.budget && totalExpense > project.budget) {
      // Create Notification for Manager
      await Notification.create({
        userId: project.manager,
        title: "Budget Exceeded Alert",
        message: `Project "${project.name}" has exceeded its budget. Total Spent: ${totalExpense}, Budget: ${project.budget}`,
        type: "alert",
        link: `/projects/${project._id}`
      });
      console.log("Budget exceed notification sent to manager:", project.manager);
    }
  } catch (err) {
    console.error("Error checking budget exceed:", err);
  }
  // ---------------------------

  return NextResponse.json({
    success: true,
    message: "Transaction added successfully",
    data: material,
  });
}
