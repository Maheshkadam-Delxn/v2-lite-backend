import dbConnect from "@/lib/dbConnect";
import Document from "@/models/Document";
import User from "@/models/User";
import { sendEmail } from "@/utils/email";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { documentId, recipients, message } = await req.json();
  const document = await Document.findById(documentId).populate("uploadedBy projectId");
  if (!document)
    return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });

  await Promise.all(
    recipients.map(async (email: string) => {
      const user = await User.findOne({ email });
      if (user) document.sharedWith.push(user._id);

      await sendEmail(
        email,
        `Document Shared: ${document.name}`,
        `
          <h3>${document.name}</h3>
          <p>${message || "A document has been shared with you."}</p>
          <a href="${document.url}" target="_blank">View Document</a>
        `
      );
    })
  );

  await document.save();
  return NextResponse.json({ success: true, message: "Document shared successfully", data: document });
}
