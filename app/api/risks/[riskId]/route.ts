import dbConnect from "@/lib/dbConnect";
import Risk from "@/models/Risk";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// PUT: Update Risk (Status, Evidence, or Details)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ riskId: string }> }
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
        const { riskId } = await params;
        const body = await req.json();

        const risk = await Risk.findById(riskId);

        if (!risk) {
            return NextResponse.json(
                { success: false, message: "Risk not found" },
                { status: 404 }
            );
        }

        // Workflow Logic: If status is 'Pending Review', ensure evidence is provided
        // (This is a soft check as per request, but good practice)
        if (body.status === "Pending Review" && !body.evidence && !risk.evidence) {
            // If evidence not in body and not already in doc
            // UI should enforce this, but we can warn or require.
            // For now, allowing update but noting it could be enforced.
        }

        // Recalculate Score if likelihood or impact changes
        // (Handled by Pre-save, but we need to assign values first)

        if (body.assignedTo) {
            // Validate user is in project if reassigned
            // We need project ID, which is on the risk
            const project = await Project.findById(risk.projectId);
            if (project) {
                const isManager = project.manager?.toString() === body.assignedTo;
                const isEngineer = project.engineers?.some(
                    (eng: any) => eng.toString() === body.assignedTo
                );

                if (!isManager && !isEngineer) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                "Assigned user must be a manager or engineer on this project",
                        },
                        { status: 400 }
                    );
                }
            }
        }

        // Update fields
        const allowedUpdates = [
            "title",
            "description",
            "category",
            "severity",
            "likelihood",
            "impact",
            "status",
            "assignedTo",
            "evidence",
            "resolutionNotes",
        ];

        allowedUpdates.forEach((field) => {
            if (body[field] !== undefined) {
                risk[field] = body[field];
            }
        });

        // Save triggers pre-save hook for score recalc
        const updatedRisk = await risk.save();

        return NextResponse.json({
            success: true,
            message: "Risk updated successfully",
            data: updatedRisk,
        });
    } catch (error: any) {
        console.error("Error updating risk:", error.message);
        return NextResponse.json(
            { success: false, message: "Failed to update risk" },
            { status: 500 }
        );
    }
}

// DELETE: Remove Risk
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ riskId: string }> }
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
        const { riskId } = await params;
        const deletedRisk = await Risk.findByIdAndDelete(riskId);

        if (!deletedRisk) {
            return NextResponse.json(
                { success: false, message: "Risk not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Risk deleted successfully",
        });
    } catch (error: any) {
        console.error("Error deleting risk:", error.message);
        return NextResponse.json(
            { success: false, message: "Failed to delete risk" },
            { status: 500 }
        );
    }
}
