import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";
import { sendPushNotification, sendApprovalNotification } from "@/utils/pushNotification";
import { emitTransactionStatus } from "@/utils/socketEmit";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap params

  const transaction = await Transaction.findById(id).populate(
    "projectId createdBy materialId approvedBy"
  );
  if (!transaction)
    return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: transaction });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap params

  const updates = await req.json();
  const transaction = await Transaction.findById(id);
  if (!transaction)
    return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });

  if (
    !canAccess(session.role, ["admin", "manager"]) &&
    transaction.createdBy.toString() !== session._id.toString()
  )
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  const previousStatus = transaction.status;
  Object.assign(transaction, updates);
  await transaction.save();

  // 🔔 Send push notification when transaction is approved/rejected
  if (updates.status && updates.status !== previousStatus) {
    const creatorId = transaction.createdBy.toString();

    if (creatorId !== session._id.toString()) {
      const isApproved = updates.status === "approved";
      const isRejected = updates.status === "rejected";

      if (isApproved || isRejected) {
        sendPushNotification(
          creatorId,
          `💰 Transaction ${isApproved ? "Approved" : "Rejected"}`,
          `Your transaction of ₹${transaction.amount || 0} has been ${updates.status}`,
          {
            type: isApproved ? "success" : "error",
            screen: "TransactionModal",
            params: { transactionId: transaction._id.toString() }
          }
        ).catch(err => console.error("[Transaction] Push error:", err));

        // 🔔 Socket Toast
        emitTransactionStatus(
          creatorId,
          transaction._id.toString(),
          updates.status,
          transaction.amount || 0
        );
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: "Transaction updated successfully",
    data: transaction,
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json(
      { success: false, message: "Only admin can delete transactions" },
      { status: 403 }
    );

  const { id } = await context.params; // ✅ unwrap params

  const deleted = await Transaction.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Transaction deleted successfully" });
}
