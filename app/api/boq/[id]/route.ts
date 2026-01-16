

// import dbConnect from "@/lib/dbConnect";
// import BOQ from "@/models/Boq";
// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";

// export async function PATCH(
//   req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   await dbConnect();

//   const session = await getSession(req as any);
//   if (!session) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   const { id } = await context.params;
//   const body = await req.json();

//   const { contractorApproval, versionNumber, rejectionReason } = body;

//   /* ---------------- VALIDATION ---------------- */
//   if (!status || versionNumber === undefined) {
//     return NextResponse.json(
//       { success: false, message: "status and versionNumber are required" },
//       { status: 400 }
//     );
//   }

//   const allowedStatus = ["draft", "approved", "rejected"];
//   if (!allowedStatus.includes(status)) {
//     return NextResponse.json(
//       { success: false, message: "Invalid status value" },
//       { status: 400 }
//     );
//   }

//   if (
//     status === "rejected" &&
//     (!rejectionReason || !rejectionReason.trim())
//   ) {
//     return NextResponse.json(
//       { success: false, message: "Rejection reason is required" },
//       { status: 400 }
//     );
//   }

//   /* ---------------- FETCH BOQ ---------------- */
//   const boq = await BOQ.findById(id);
//   if (!boq) {
//     return NextResponse.json(
//       { success: false, message: "BOQ not found" },
//       { status: 404 }
//     );
//   }

//   /* ---------------- UPDATE ONLY SELECTED VERSION ---------------- */
//   const version = boq.boqVersion.find(
//     (v: any) => v.versionNumber === versionNumber
//   );

//   if (!version) {
//     return NextResponse.json(
//       { success: false, message: "BOQ version not found" },
//       { status: 404 }
//     );
//   }

//   version.status = status;
//   version.rejectionReason =
//     status === "rejected" ? rejectionReason : "";

//   /* ---------------- UPDATE BOQ ROOT ---------------- */
//   boq.status = status;
//   boq.updatedBy = session._id;

//   await boq.save();

//   return NextResponse.json({
//     success: true,
//     message: `BOQ v${versionNumber} updated to ${status}`,
//     data: boq,
//   });
// }



import dbConnect from "@/lib/dbConnect";
import BOQ from "@/models/Boq";
import { NextResponse ,NextRequest} from "next/server";
import { getSession } from "@/lib/auth";

export async function PATCH(
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

  const { id } =await context.params;
  const body = await req.json();

  const {
    versionNumber,
    clientApproval,
    contractorApproval,
    rejectionReason,
  } = body;

  /* ---------------- VALIDATION ---------------- */
  if (!versionNumber) {
    return NextResponse.json(
      { success: false, message: "versionNumber is required" },
      { status: 400 }
    );
  }

  const allowedApproval = ["pending", "approved", "rejected"];

  if (
    (clientApproval && !allowedApproval.includes(clientApproval)) ||
    (contractorApproval && !allowedApproval.includes(contractorApproval))
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid approval value" },
      { status: 400 }
    );
  }

  /* ---------------- FETCH BOQ ---------------- */
  const boq = await BOQ.findById(id);
  if (!boq) {
    return NextResponse.json(
      { success: false, message: "BOQ not found" },
      { status: 404 }
    );
  }

  const version = boq.boqVersion.find(
    (v: any) => v.versionNumber === versionNumber
  );

  if (!version) {
    return NextResponse.json(
      { success: false, message: "BOQ version not found" },
      { status: 404 }
    );
  }

  /* ---------------- UPDATE APPROVALS ---------------- */
  if (clientApproval) version.clientApproval = clientApproval;
  if (contractorApproval) version.contractorApproval = contractorApproval;

  /* ---------------- STATUS LOGIC ---------------- */
  if (
    version.clientApproval === "rejected" ||
    version.contractorApproval === "rejected"
  ) {
    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required" },
        { status: 400 }
      );
    }

    version.status = "rejected";
    version.rejectionReason = rejectionReason;
  } else if (
    version.clientApproval === "approved" &&
    version.contractorApproval === "approved"
  ) {
    version.status = "approved";
    version.rejectionReason = "";
  } else {
    version.status = "draft";
    version.rejectionReason = "";
  }

  /* ---------------- ROOT BOQ STATUS ---------------- */
  boq.status = version.status;
  boq.updatedBy = session._id;

  await boq.save();

  return NextResponse.json({
    success: true,
    message: `BOQ v${versionNumber} updated successfully`,
    data: boq,
  });
}
