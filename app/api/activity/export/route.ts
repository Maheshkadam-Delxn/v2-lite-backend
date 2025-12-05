import dbConnect from "@/lib/dbConnect";
import Activity from "@/models/Activity";
import { Parser } from "json2csv";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  // ✅ Only admin and manager can export logs
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  // ✅ Parse URL params for filtering and format
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";
  const userId = searchParams.get("userId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // ✅ Build query
  const query: any = {};
  if (userId) query.userId = userId;
  if (from && to) query.createdAt = { $gte: new Date(from), $lte: new Date(to) };

  // ✅ Fetch activity logs
  const activities = await Activity.find(query)
    .populate("userId", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  // ✅ Return JSON
  if (format === "json") {
    return NextResponse.json({ success: true, data: activities });
  }

  // ✅ Convert to CSV for download
  const csvParser = new Parser({
    fields: [
      { label: "User Name", value: "userId.name" },
      { label: "User Email", value: "userId.email" },
      { label: "Role", value: "userId.role" },
      { label: "Action", value: "action" },
      { label: "Entity Type", value: "entityType" },
      { label: "Entity ID", value: "entityId" },
      { label: "Description", value: "description" },
      { label: "Date", value: "createdAt" },
    ],
  });

  const csv = csvParser.parse(activities);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="activity_logs.csv"',
    },
  });
}
