import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"])) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  const { transactionId, action, remarks } = await req.json();

  if (!transactionId || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { success: false, message: "Invalid approval request" },
      { status: 400 }
    );
  }

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    return NextResponse.json(
      { success: false, message: "Transaction not found" },
      { status: 404 }
    );
  }

  // 🔒 Prevent double approval / rejection
  if (transaction.status !== "pending") {
    return NextResponse.json(
      {
        success: false,
        message: `Transaction already ${transaction.status}`,
      },
      { status: 400 }
    );
  }

  if (action === "approve") {
    transaction.status = "approved";
    transaction.approvedBy = session._id;
    transaction.approvedAt = new Date();
  }

  if (action === "reject") {
    if (!remarks) {
      return NextResponse.json(
        { success: false, message: "Remarks required for rejection" },
        { status: 400 }
      );
    }

    transaction.status = "rejected";
    transaction.remarks = remarks;
  }

  await transaction.save();

  const populated = await Transaction.findById(transaction._id).populate(
    "projectId createdBy approvedBy materialId"
  );

  return NextResponse.json({
    success: true,
    message: `Transaction ${action === "approve" ? "approved" : "rejected"} successfully`,
    data: populated,
  });
}
