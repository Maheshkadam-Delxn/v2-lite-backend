import dbConnect from "@/lib/dbConnect";
import Folder from "@/models/Folder";
import Document from "@/models/Document";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  if (!folderId)
    return NextResponse.json({ success: false, message: "Folder ID is required" }, { status: 400 });

  const [subfolders, documents] = await Promise.all([
    Folder.find({ parentFolderId: folderId }),
    Document.find({ folderId }),
  ]);

  return NextResponse.json({
    success: true,
    data: { subfolders, documents },
  });
}
