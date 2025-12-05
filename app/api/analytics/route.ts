import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import User from "@/models/User";
import Snag from "@/models/Snag";
import Material from "@/models/Material";
import Task from "@/models/Task";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const [projects, users, snags, materials, tasks, transactions] = await Promise.all([
    Project.countDocuments(),
    User.countDocuments(),
    Snag.countDocuments(),
    Material.countDocuments(),
    Task.countDocuments(),
    Transaction.countDocuments(),
  ]);

  const data = {
    totalProjects: projects,
    totalUsers: users,
    totalSnags: snags,
    totalMaterials: materials,
    totalTasks: tasks,
    totalTransactions: transactions,
  };

  return NextResponse.json({ success: true, data });
}
