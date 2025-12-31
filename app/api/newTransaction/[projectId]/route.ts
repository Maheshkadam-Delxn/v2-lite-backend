import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/NewTransaction";
import '@/models/Vendor';
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";
import MaterialPurchase from "@/models/MaterialPurchase";



export async function GET(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { projectId } = await context.params; // ✅ unwrap promise

  const transaction = await Transaction.find({ projectId:projectId }).populate("vendorId");

  const purchaseTransactions = await MaterialPurchase.find({ projectId: projectId }).populate("vendorId");

  if (!transaction)
    return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });

if (!purchaseTransactions)
    return NextResponse.json({ success: false, message: "purchaseTransactions not found" }, { status: 404 });
 const combinedData = [...transaction, ...purchaseTransactions];

  return NextResponse.json({ success: true, data: combinedData });
}
