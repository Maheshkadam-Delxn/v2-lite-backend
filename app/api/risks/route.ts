import dbConnect from "@/lib/dbConnect";
import Risk from "@/models/Risk";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";
import { sendAlertNotification, sendPushNotification } from "@/utils/pushNotification";
import { emitRiskAlert } from "@/utils/socketEmit";

// POST: Create a new risk
export async function POST(req: Request) {
    await dbConnect();
    const session = await getSession(req as any);

    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 403 }
        );
    }

    try {
        const body = await req.json();
        const {
            projectId,
            title,
            description,
            category,
            severity,
            likelihood,
            impact,
            assignedTo,
        } = body;

        // Required validation
        if (!projectId || !title) {
            return NextResponse.json(
                { success: false, message: "projectId and title are required" },
                { status: 400 }
            );
        }

        // Get project for notifications
        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json(
                { success: false, message: "Project not found" },
                { status: 404 }
            );
        }

        // Validate User Allocation
        if (assignedTo) {
            const isManager = project.manager?.toString() === assignedTo;
            const isEngineer = project.engineers?.some(
                (eng: any) => eng.toString() === assignedTo
            );


        }

        const risk = await Risk.create({
            projectId,
            title,
            description,
            category,
            severity,
            likelihood,
            impact,
            assignedTo, // If null/undefined, it stays null
            createdBy: session._id,
            // score calculated in pre-save
            // status defaults to 'Open'
        });

        // 🔔 Send push notifications for high severity risks
        const isHighSeverity = severity === "High" || severity === "Critical";

        // Notify project manager for High/Critical risks
        if (isHighSeverity && project.manager) {
            const managerId = project.manager.toString();
            if (managerId !== session._id.toString()) {
                sendAlertNotification(
                    managerId,
                    `${severity} Risk Identified`,
                    `${title}`,
                    {
                        type: "alert",
                        screen: "RiskDetail",
                        params: { riskId: risk._id.toString() }
                    }
                ).catch(err => console.error("[Risk] Push error:", err));

                // 🔔 Socket Toast
                emitRiskAlert(
                    managerId,
                    risk._id.toString(),
                    title,
                    severity
                );
            }
        }

        // Notify assigned user
        if (assignedTo && assignedTo !== session._id.toString()) {
            sendPushNotification(
                assignedTo,
                "⚠️ Risk Assigned",
                `You've been assigned to: "${title}"`,
                {
                    type: "alert",
                    screen: "RiskDetail",
                    params: { riskId: risk._id.toString() }
                }
            ).catch(err => console.error("[Risk] Push error:", err));

            // 🔔 Socket Toast
            emitRiskAlert(
                assignedTo,
                risk._id.toString(),
                title,
                severity
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Risk created successfully",
                data: risk,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating risk:", error.message);
        return NextResponse.json(
            { success: false, message: "Server error while creating risk" },
            { status: 500 }
        );
    }
}

