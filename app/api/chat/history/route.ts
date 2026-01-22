import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

  return NextResponse.json(messages);
}
