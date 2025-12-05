import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import Material from "@/models/Material";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const [approved, pending, rejected] = await Promise.all([
    Transaction.aggregate([{ $match: { status: "approved" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Transaction.aggregate([{ $match: { status: "pending" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Transaction.aggregate([{ $match: { status: "rejected" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  const materialCost = await Material.aggregate([{ $group: { _id: null, total: { $sum: "$cost" } } }]);

  const data = {
    approvedExpenses: approved[0]?.total || 0,
    pendingRequests: pending[0]?.total || 0,
    rejectedExpenses: rejected[0]?.total || 0,
    materialExpenditure: materialCost[0]?.total || 0,
    overallBudgetUsed:
      (approved[0]?.total || 0) + (materialCost[0]?.total || 0),
  };

  return NextResponse.json({ success: true, data });
}
