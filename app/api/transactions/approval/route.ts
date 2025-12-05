import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { transactionId, action, remarks } = await req.json();
  const transaction = await Transaction.findById(transactionId);
  if (!transaction)
    return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });

  if (action === "approve") {
    transaction.status = "approved";
    transaction.approvedBy = session._id;
    transaction.approvedAt = new Date();
  } else if (action === "reject") {
    transaction.status = "rejected";
    transaction.remarks = remarks;
  }

  await transaction.save();
  return NextResponse.json({ success: true, message: `Transaction ${action}d successfully`, data: transaction });
}
