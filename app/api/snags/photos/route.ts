import dbConnect from "@/lib/dbConnect";
import Snag from "@/models/Snag";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { snagId, photoUrls } = await req.json();
  const snag = await Snag.findById(snagId);
  if (!snag)
    return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });

  snag.photos.push(...photoUrls);
  await snag.save();

  return NextResponse.json({ success: true, message: "Photos added successfully", data: snag });
}
