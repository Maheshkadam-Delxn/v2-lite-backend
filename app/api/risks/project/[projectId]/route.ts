import dbConnect from "@/lib/dbConnect";
import Risk from "@/models/Risk";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 403 }
        );
    }

    try {
        const { projectId } = await params;

        const risks = await Risk.find({ projectId })
            .populate("assignedTo", "name email profileImage")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: risks,
        });
    } catch (error: any) {
        console.error("Error fetching risks:", error.message);
        return NextResponse.json(
            { success: false, message: "Failed to fetch risks" },
            { status: 500 }
        );
    }
}
