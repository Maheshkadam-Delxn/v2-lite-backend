import dbConnect from "@/lib/dbConnect";
import BOQ from "@/models/Boq";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
 const { id } = await context.params;
console.log(id);
  
//   console.log(boqId);// ✅ GET ID FROM URL /api/boq/:id
  const body = await req.json();
  const { status, rejectionReason } = body;

  if (!status) {
    return NextResponse.json(
      { success: false, message: "Status is required" },
      { status: 400 }
    );
  }

  const allowedStatus = ["draft", "pending", "approved", "rejected"];

  if (!allowedStatus.includes(status)) {
    return NextResponse.json(
      { success: false, message: "Invalid status value" },
      { status: 400 }
    );
  }

  // Rejection reason required only when rejecting
  if (status === "rejected" && (!rejectionReason || rejectionReason.trim() === "")) {
    return NextResponse.json(
      { success: false, message: "Rejection reason is required" },
      { status: 400 }
    );
  }

  const payload: any = {
    status,
    updatedBy: session._id,
  };

  if (status === "rejected") {
    payload.rejectionReason = rejectionReason;
  } else {
    payload.rejectionReason = "";
  }

  const updated = await BOQ.findByIdAndUpdate(id, payload, { new: true });

  if (!updated) {
    return NextResponse.json(
      { success: false, message: "BOQ not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `BOQ status updated to ${status}`,
    data: updated
  });
}
