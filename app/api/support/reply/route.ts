import dbConnect from "@/lib/dbConnect";
import Support from "@/models/Support";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendPushNotification } from "@/utils/pushNotification";
import { emitNotification } from "@/utils/socketEmit";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { ticketId, message } = await req.json();

  const ticket = await Support.findById(ticketId);
  if (!ticket)
    return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });

  ticket.replies.push({
    userId: session._id,
    message,
    timestamp: new Date(),
  });

  ticket.lastUpdated = new Date();
  await ticket.save();

  // 🔔 Notify ticket creator about the reply
  const ticketCreatorId = ticket.userId?.toString() || ticket.createdBy?.toString();
  if (ticketCreatorId && ticketCreatorId !== session._id.toString()) {
    sendPushNotification(
      ticketCreatorId,
      "💬 Support Reply",
      `New reply on your ticket: "${ticket.subject || 'Support Ticket'}"`,
      {
        type: "info",
        screen: "CustomerSupport",
        params: { ticketId: ticket._id.toString() }
      }
    ).catch(err => console.error("[Support] Push error:", err));

    // 🔔 Socket Toast
    emitNotification(
      ticketCreatorId,
      "💬 Support Reply",
      `New reply on your ticket: "${ticket.subject || 'Support Ticket'}"`,
      "info",
      { screen: "CustomerSupport", params: { ticketId: ticket._id.toString() } }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Reply added successfully",
    data: ticket,
  });
}

