import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";

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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const updates = await req.json();

  const transaction = await Transaction.findById(id);
  if (!transaction) {
    return NextResponse.json(
      { success: false, message: "Transaction not found" },
      { status: 404 }
    );
  }

  const isAdminOrManager = canAccess(session.role, ["admin", "manager"]);
  const isCreator = transaction.createdBy.toString() === session._id.toString();

  if (!isAdminOrManager && !isCreator) {
    return NextResponse.json(
      { success: false, message: "Permission denied" },
      { status: 403 }
    );
  }

  // 🔒 Lock approved transactions
  if (transaction.status === "approved" && !isAdminOrManager) {
    return NextResponse.json(
      { success: false, message: "Approved transactions cannot be modified" },
      { status: 400 }
    );
  }

  // 🔐 Controlled updates
  const editableFields = [
    "vendorName",
    "invoiceNumber",
    "invoiceDate",
    "paymentMode",
    "paymentDate",
    "referenceNumber",
    "documents",
    "remarks",
    "items",
  ];

  editableFields.forEach((field) => {
    if (updates[field] !== undefined) {
      (transaction as any)[field] = updates[field];
    }
  });

  // 🔑 Approval flow (admin/manager only)
  if (isAdminOrManager && updates.status) {
    if (!["approved", "rejected"].includes(updates.status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status update" },
        { status: 400 }
      );
    }

    transaction.status = updates.status;
    transaction.approvedBy = session._id;
    transaction.approvedAt = new Date();
  }

  await transaction.save();

  const populated = await Transaction.findById(transaction._id).populate(
    "projectId createdBy approvedBy materialId"
  );

  return NextResponse.json({
    success: true,
    message: "Transaction updated successfully",
    data: populated,
  });
}


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role)) {
    return NextResponse.json(
      { success: false, message: "Only admin can delete transactions" },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const transaction = await Transaction.findById(id);

  if (!transaction) {
    return NextResponse.json(
      { success: false, message: "Transaction not found" },
      { status: 404 }
    );
  }

  if (transaction.status === "approved") {
    return NextResponse.json(
      { success: false, message: "Approved transactions cannot be deleted" },
      { status: 400 }
    );
  }

  await transaction.deleteOne();

  return NextResponse.json({
    success: true,
    message: "Transaction deleted successfully",
  });
}

