import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  await Message.create({
    roomId: body.roomId,
    senderId: body.senderId,
    message: body.message,
  });

  return NextResponse.json({ success: true });
}
