// import dbConnect from "@/lib/dbConnect";
// import Survey from "@/models/Survey";
// import Project from "@/models/Project";
// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";

// export async function GET(
//   req: Request,
//   context: { params: { projectId: string } }
// ) {
//   await dbConnect();

//   const session = await getSession(req as any);
//   if (!session)
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 403 }
//     );

//   // 🚀 FIXED — no await here
//   const { projectId } =await context.params;
// console.log(projectId);
//   // Fetch surveys by projectId
//   const surveys = await Survey.findOne({projectId })
//     .populate("requestedBy")
//     .populate("approvedBy")
//     .populate("projectId")
//     .sort({ createdAt: -1 });

//   return NextResponse.json({ success: true, survey: surveys });
// }
import dbConnect from "@/lib/dbConnect";
import Survey from "@/models/Survey";
import Project from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  await dbConnect();

  const session = await getSession(req as any);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  // ✅ Next.js 16: params must be awaited
  const { projectId } = await params;
  console.log(projectId);

  // Fetch surveys by projectId
  const survey = await Survey.findOne({ projectId })
    .populate("requestedBy")
    .populate("approvedBy")
    .populate("projectId")
    .sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,
    survey,
  });
}
