import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

// CRITICAL: Import ALL models used in .populate()
import "@/models/Material";        // This registers the Material model
import "@/models/User";           // Also import User if not already registered
// OR if you export default: import Material from "@/models/Material";

await dbConnect();

// ✅ Get all transactions
export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"])) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const filter: any = {};

    if (searchParams.get("projectId")) filter.projectId = searchParams.get("projectId");
    if (searchParams.get("category")) filter.category = searchParams.get("category");
    if (searchParams.get("nature")) filter.nature = searchParams.get("nature");
    if (searchParams.get("status")) filter.status = searchParams.get("status");

    const transactions = await Transaction.find(filter)
      .populate("projectId createdBy approvedBy materialId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// ✅ Create new transaction
export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const requiredFields = ["projectId", "category", "nature", "direction", "amount"];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { success: false, message: `${field} is required` },
        { status: 400 }
      );
    }
  }

  const project = await Project.findById(body.projectId);
  if (!project) {
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
  }

  // 🔐 Business rules
  if (body.category === "material" && !body.materialId) {
    return NextResponse.json(
      { success: false, message: "materialId is required for material transactions" },
      { status: 400 }
    );
  }

  if (body.category === "payment" && !body.paymentMode) {
    return NextResponse.json(
      { success: false, message: "paymentMode is required for payment transactions" },
      { status: 400 }
    );
  }

  try {
    const transaction = await Transaction.create({
      projectId: body.projectId,
      category: body.category,
      nature: body.nature,
      direction: body.direction,
      amount: body.amount,
      currency: body.currency || "INR",

      materialId: body.materialId || null,

      vendorName: body.vendorName,
      invoiceNumber: body.invoiceNumber,
      invoiceDate: body.invoiceDate,

      paymentMode: body.paymentMode,
      paymentDate: body.paymentDate,
      referenceNumber: body.referenceNumber,

      items: body.items || [],
      documents: body.documents || [],
      remarks: body.remarks || "",

      createdBy: session._id,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE TRANSACTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
