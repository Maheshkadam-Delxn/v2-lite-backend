// import dbConnect from "@/lib/dbConnect";
// import SystemSetting from "@/models/SystemSetting";
// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";
// import { isAdmin } from "@/utils/permissions";

// export async function PUT(req: Request) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session || !isAdmin(session.role))
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

//   const { maintenanceMode, message } = await req.json();

//   const settings = await SystemSetting.findOneAndUpdate(
//     {},
//     { maintenanceMode, maintenanceMessage: message },
//     { upsert: true, new: true }
//   );

//   return NextResponse.json({
//     success: true,
//     message: `Maintenance mode ${maintenanceMode ? "enabled" : "disabled"}`,
//     data: settings,
//   });
// }
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ message: "Maintenance route is under construction." });
}