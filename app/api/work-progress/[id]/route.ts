import dbConnect from "@/lib/dbConnect";
import WorkProgress from "@/models/WorkProgress";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const session = await getSession(req as any);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    try {
        const entry = await WorkProgress.findById(id)
            .populate("createdBy", "name email")
            .populate("milestoneId", "title");
        if (!entry) return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: entry });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await req.json();
        const entry = await WorkProgress.findById(id);

        if (!entry) {
            return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
        }

        // Permissions: Only Admin, Manager, or the creator can edit
        const isCreator = entry.createdBy.toString() === session._id.toString();
        if (!isCreator && !canAccess(session.role, ["admin", "manager"])) {
            return NextResponse.json({ success: false, message: "Permission denied." }, { status: 403 });
        }

        // Check locking
        if (entry.isLocked && !canAccess(session.role, ["admin"])) {
            return NextResponse.json({ success: false, message: "This entry is locked and cannot be edited." }, { status: 400 });
        }

        // Update fields
        if (body.description) entry.description = body.description;
        if (body.progressPercent !== undefined) entry.progressPercent = body.progressPercent;
        if (body.photos) entry.photos = body.photos;
        if (body.issues) entry.issues = body.issues;
        if (body.isLocked !== undefined && canAccess(session.role, ["admin", "manager"])) {
            entry.isLocked = body.isLocked;
        }

        await entry.save();
        return NextResponse.json({ success: true, data: entry });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Update failed" }, { status: 400 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session || !canAccess(session.role, ["admin", "manager"])) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const deleted = await WorkProgress.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
        return NextResponse.json({ success: true, message: "Entry deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
    }
}
