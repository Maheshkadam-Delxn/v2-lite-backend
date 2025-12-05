import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Task from "@/models/Task";
import Snag from "@/models/Snag";
import Survey from "@/models/Survey";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const users = await User.find({ role: { $in: ["engineer", "manager"] } }).select("name role email");

  const teamStats = await Promise.all(
    users.map(async (user) => {
      const [tasks, snags, surveys] = await Promise.all([
        Task.countDocuments({ assignedTo: user._id }),
        Snag.countDocuments({ reportedBy: user._id }),
        Survey.countDocuments({ requestedBy: user._id }),
      ]);

      return {
        userId: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        assignedTasks: tasks,
        reportedSnags: snags,
        submittedSurveys: surveys,
      };
    })
  );

  return NextResponse.json({ success: true, data: teamStats });
}
