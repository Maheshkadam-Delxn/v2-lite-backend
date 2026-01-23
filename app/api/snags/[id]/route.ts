import dbConnect from "@/lib/dbConnect";
import Snag from "@/models/Snag";
import ActivityLog from "@/models/ActivityLog";
import "@/models/WorkProgress"; // ✅ Register model for population
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params; // ✅ Await params

  try {
    const snag = await Snag.findById(id)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")

      .populate("workProgressId");

    if (!snag) {
      return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: snag });
  } catch (error: any) {
    console.error("❌ Error fetching snag details:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params; // ✅ Await params

  try {
    const body = await req.json();
    const snag = await Snag.findById(id);

    if (!snag) {
      return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });
    }

    const { status, resolutionPhotos, assignedTo } = body;
    const currentStatus = snag.status;
    const userRole = session.role;
    const userId = session._id;

    // 🔒 1. Check Field Locking (Locked if fixed+)
    if (!status && ["fixed", "verified", "closed"].includes(currentStatus)) {
      if (body.title || body.description || body.category || body.location || body.severity) {
        return NextResponse.json({ success: false, message: "Snag fields are locked in this status." }, { status: 400 });
      }
    }

    let actionDescription = "Snag updated";

    // 🔄 2. Status Transition Logic
    if (status && status !== currentStatus) {
      switch (currentStatus) {
        case "open":
          if (status !== "assigned") throw new Error("Open snags can only move to 'assigned'.");
          if (!canAccess(userRole, ["admin", "manager"])) throw new Error("Only Admin/Manager can assign snags.");

          if (!assignedTo && !snag.assignedTo) throw new Error("Assignee required.");

          snag.status = "assigned";
          snag.assignedAt = new Date();
          if (assignedTo) snag.assignedTo = assignedTo;
          actionDescription = "Snag assigned";
          break;

        case "assigned":
          if (status !== "fixed") throw new Error("Assigned snags can only move to 'fixed'.");

          const isAssignee = snag.assignedTo?.toString() === userId.toString();
          if (!isAssignee && !canAccess(userRole, ["admin", "manager"])) {
            throw new Error("Only the assignee or Admin can mark as fixed.");
          }

          const hasPhotos = (body.resolutionPhotos && body.resolutionPhotos.length > 0) || (snag.resolutionPhotos && snag.resolutionPhotos.length > 0);
          if (!hasPhotos) throw new Error("Resolution photos are required to mark as fixed.");

          snag.status = "fixed";
          snag.fixedAt = new Date();
          if (body.resolutionPhotos) snag.resolutionPhotos = body.resolutionPhotos;
          actionDescription = "Snag marked as fixed";
          break;

        case "fixed":
          if (status !== "verified") throw new Error("Fixed snags can only move to 'verified'.");
          if (!canAccess(userRole, ["admin", "manager"])) throw new Error("Only Admin/Manager can verify snags.");

          snag.status = "verified";
          snag.verifiedAt = new Date();
          actionDescription = "Snag verified";
          break;

        case "verified":
          if (status !== "closed") throw new Error("Verified snags can only move to 'closed'.");
          if (!canAccess(userRole, ["admin"])) throw new Error("Only Admin can close snags.");

          snag.status = "closed";
          snag.closedAt = new Date();
          actionDescription = "Snag closed";
          break;

        case "closed":
          throw new Error("Closed snags cannot be reopened.");

        default:
          throw new Error("Invalid current status.");
      }
    } else {
      if (body.title) snag.title = body.title;
      if (body.description) snag.description = body.description;
      if (body.category) snag.category = body.category;
      if (body.location) snag.location = body.location;
      if (body.severity) snag.severity = body.severity;
      if (body.photos) snag.photos = body.photos;
      if (body.resolutionPhotos) snag.resolutionPhotos = body.resolutionPhotos;

      if (body.workProgressId) snag.workProgressId = body.workProgressId;
    }

    await snag.save();

    await ActivityLog.create({
      userId: userId,
      projectId: snag.projectId,
      action: status && status !== currentStatus ? "Snag Status Change" : "Snag Updated",
      description: `${actionDescription}: ${snag.title} is now ${snag.status}`,
      entityType: "snag",
      entityId: snag._id,
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data: snag });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Update failed" },
      { status: 400 }
    );
  }
}
