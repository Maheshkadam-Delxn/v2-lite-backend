import dbConnect from "@/lib/dbConnect";
import Risk from "@/models/Risk";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";

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

        // Validate Project and User Allocation
        if (assignedTo) {
            const project = await Project.findById(projectId);
            if (!project) {
                return NextResponse.json(
                    { success: false, message: "Project not found" },
                    { status: 404 }
                );
            }

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
