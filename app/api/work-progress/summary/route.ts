import dbConnect from "@/lib/dbConnect";
import WorkProgress from "@/models/WorkProgress";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: Request) {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const range = searchParams.get("range") || "daily"; // daily, weekly, monthly

    if (!projectId) {
        return NextResponse.json({ success: false, message: "projectId is required" }, { status: 400 });
    }

    try {
        const matchStage = {
            projectId: new mongoose.Types.ObjectId(projectId),
        };

        let groupStage: any = {
            _id: null,
            totalProgress: { $sum: "$progressPercent" },
            avgProgress: { $avg: "$progressPercent" },
            entries: { $push: "$$ROOT" },
            count: { $sum: 1 }
        };

        if (range === "daily") {
            groupStage._id = {
                $dateToString: { format: "%Y-%m-%d", date: "$date" }
            };
        } else if (range === "weekly") {
            groupStage._id = {
                year: { $year: "$date" },
                week: { $week: "$date" }
            };
        } else if (range === "monthly") {
            groupStage._id = {
                year: { $year: "$date" },
                month: { $month: "$date" }
            };
        }

        const summary = await WorkProgress.aggregate([
            { $match: matchStage },
            { $sort: { date: 1 } },
            { $group: groupStage },
            {
                $project: {
                    totalProgress: { $min: ["$totalProgress", 100] },
                    avgProgress: 1,
                    entries: 1,
                    count: 1
                }
            },
            { $sort: { "_id": -1 } }
        ]);

        return NextResponse.json({
            success: true,
            range,
            data: summary
        });
    } catch (error: any) {
        console.error("Error generating summary:", error.message);
        return NextResponse.json(
            { success: false, message: "Failed to generate summary", error: error.message },
            { status: 500 }
        );
    }
}
