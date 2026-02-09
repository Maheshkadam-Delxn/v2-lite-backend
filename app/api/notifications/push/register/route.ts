import dbConnect from "@/lib/dbConnect";
import PushToken from "@/models/PushToken";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * POST /api/notifications/push/register
 * Register or update push token for the authenticated user
 */
export async function POST(req: Request) {
    await dbConnect();

    const session = await getSession(req as any);
    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { pushToken, platform } = await req.json();

        if (!pushToken) {
            return NextResponse.json(
                { success: false, message: "Push token is required" },
                { status: 400 }
            );
        }

        // Upsert the push token (update if exists, create if not)
        const result = await PushToken.findOneAndUpdate(
            { userId: session._id },
            {
                userId: session._id,
                token: pushToken,
                platform: platform || "android",
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            message: "Push token registered successfully",
            data: { id: result._id },
        });
    } catch (error: any) {
        console.error("[Push Register] Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to register token" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/notifications/push/register
 * Remove push token for the authenticated user (logout/disable notifications)
 */
export async function DELETE(req: Request) {
    await dbConnect();

    const session = await getSession(req as any);
    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        await PushToken.deleteOne({ userId: session._id });

        return NextResponse.json({
            success: true,
            message: "Push token removed successfully",
        });
    } catch (error: any) {
        console.error("[Push Unregister] Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to remove token" },
            { status: 500 }
        );
    }
}
