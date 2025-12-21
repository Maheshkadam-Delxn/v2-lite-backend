// import dbConnect from "@/lib/dbConnect";
// import PlanFolder from "@/models/PlanAnnotaion";
// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   await dbConnect(); // ✅ FIRST

//   const session = await getSession(req as any);
//   if (!session) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   const folderId = params.id;
//   console.log("Folder ID:", folderId);

//   const folder = await PlanFolder.findById({projectId:folderId})
//     .populate("planDocuments");

//   if (!folder) {
//     return NextResponse.json(
//       { success: false, message: "Folder not found" },
//       { status: 404 }
//     );
//   }

//   return NextResponse.json({
//     success: true,
//     data: folder, // ✅ SINGLE FOLDER
//   });
// }
import dbConnect from "@/lib/dbConnect";
import PlanFolder from '@/models/PlanAnnotaion';
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";


// ✅ GET Project Type by ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await context.params; // ✅ unwrap Promise
console.log("this is id",id);
  try {
    const type = await PlanFolder.find({projectId:id});
    if (!type)
      return NextResponse.json({ success: false, message: "Project type not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: type });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Invalid ID format" }, { status: 400 });
  }
}