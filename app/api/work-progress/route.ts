import dbConnect from "@/lib/dbConnect";
import WorkProgress from "@/models/WorkProgress";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function POST(req: Request) {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // Permissions: Admin, Manager, Engineer (Site roles)
    if (!canAccess(session.role, ["admin", "manager", "engineer"])) {
        return NextResponse.json({ success: false, message: "Permission denied. Only site roles can log progress." }, { status: 403 });
    }

    try {
        const body = await req.json();

        // 1️⃣ Validate required fields
        if (!body.projectId || !body.date || !body.description || body.progressPercent === undefined) {
            return NextResponse.json(
                { success: false, message: "Missing required fields (projectId, date, description, progressPercent)" },
                { status: 400 }
            );
        }

        // 2️⃣ Create Work Progress entry
        const newEntry = await WorkProgress.create({
            ...body,
            date: new Date(body.date),
            createdBy: session._id,
        });

        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating work progress:", error.message);

        // Handle Duplicate Key Error (One entry per project per day)
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "A progress entry already exists for this project on this date." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!projectId) {
        return NextResponse.json({ success: false, message: "projectId is required" }, { status: 400 });
    }

    // Build Query
    const query: any = { projectId };
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    try {
        const entries = await WorkProgress.find(query)
            .populate("createdBy", "name email")
            .populate("milestoneId", "title")
            .sort({ date: -1 });

        return NextResponse.json({ success: true, data: entries });
    } catch (error: any) {
        console.error("Error fetching work progress:", error.message);
        return NextResponse.json({ success: false, message: "Failed to load entries" }, { status: 500 });
    }
}
