import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query: any = {};
  if (type) query.type = type;
  if (status) query.status = status;
  if (from && to) query.date = { $gte: new Date(from), $lte: new Date(to) };

  const transactions = await Transaction.find(query)
    .populate("projectId createdBy materialId approvedBy")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: transactions });
}
