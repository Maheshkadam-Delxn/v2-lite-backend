import { NextRequest } from "next/server";
import Milestone from "@/models/Milestone";
import Risk from "@/models/Risk";
import Snag from "@/models/Snag";
import Transaction from "@/models/NewTransaction";
import "@/models/Material"
import MaterialRequest from "@/models/MaterialRequest";
import MaterialPurchase from "@/models/MaterialPurchase";
import MaterialReceived from "@/models/MaterialReceived";
import MaterialUsed from "@/models/MaterialUsed";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

/* ======================================================
   GET /api/audit
====================================================== */

interface AuditLogEntry {
    id: any;
    module: string;
    title: string;
    performedBy: string;
    role: string;
    time: any;
    details: string;
}

export async function GET(req: NextRequest) {
    await dbConnect();
      const session = await getSession(req as any);
    
      console.log("Session in milestone POST:", session);
    
      // 🔐 Authorization
      if (!session ) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return Response.json(
                { success: false, message: "projectId is required" },
                { status: 400 }
            );
        }

        /* ===============================
           FETCH ALL MODULE DATA
        =============================== */

        const [
            milestones,
            risks,
            snags,
            transactions,
            requests,
            purchases,
            received,
            used,
        ] = await Promise.all([
            Milestone.find({ projectId: projectId }).populate("createdby", "name role"),
            Risk.find({ projectId: projectId }).populate("createdBy", "name role"),
            Snag.find({ projectId: projectId }).populate("reportedBy assignedTo", "name role"),
            Transaction.find({ projectId: projectId }).populate("createdBy", "name role"),
            MaterialRequest.find({ projectId: projectId }).populate("addedBy materialId", "materialName ,name,role"),
            MaterialPurchase.find({ projectId: projectId }).populate("createdBy materialId", "materialName ,name,role"),
            MaterialReceived.find({ projectId }).populate("addedBy materialId", "materialName ,name,role"),
            MaterialUsed.find({ projectId }).populate("addedBy materialId", "materialName ,name,role"),
        ]);
        const mil = await Milestone.find({ projectId: projectId }).populate("createdby", "name role");
        console.log("milestones", mil);

        /* ===============================
           NORMALIZE TO AUDIT EVENTS
        =============================== */

        const audit: AuditLogEntry[] = [];

        // Milestones
        milestones.forEach((m) => {
            audit.push({
                id: m._id,
                module: "milestone",
                title: `Milestone "${m.title}" updated`,
                performedBy: m.createdby?.name || "System",
                role: m.createdby?.role || "Admin",
                time: m.updatedAt,
                details: `Status: ${m.status}, Progress: ${m.progress}%`,
            });
        });

        // Risks
        risks.forEach((r) => {
            audit.push({
                id: r._id,
                module: "risk",
                title: `Risk "${r.title}" (${r.severity})`,
                performedBy: r.createdBy?.name || "System",
                role: r.createdBy?.role || "Admin",
                time: r.updatedAt,
                details: `Status: ${r.status}`,
            });
        });

        // Snags
        snags.forEach((s) => {
            audit.push({
                id: s._id,
                module: "snag",
                title: `Snag "${s.title}" (${s.status})`,
                performedBy: s.reportedBy?.name || "System",
                role: s.reportedBy?.role || "User",
                time: s.updatedAt,
                details: `Severity: ${s.severity}, Location: ${s.location}`,
            });
        });

        // Transactions
        transactions.forEach((t) => {
            audit.push({
                id: t._id,
                module: "transaction",
                title: `Transaction recorded`,
                performedBy: t.createdBy?.name || "Admin",
                role: t.createdBy?.role || "Admin",
                time: t.createdAt,
                details: `₹${t.amount} • ${t.category || t.type}`,
            });
        });

        // Material Requests
        requests.forEach((r) => {
            console.log("asdf", r),
                audit.push({
                    id: r._id,
                    module: "material",
                    title: "Material requested",
                    performedBy: r.addedBy?.name || "Site",
                    role: r.addedBy?.role || "User",
                    time: r.createdAt,

                    details: `${r.materialId?.materialName} × ${r.quantity}`,
                });
        });

        // Material Purchases
        purchases.forEach((p) => {
            console.log("asdfeasdf", p),
                audit.push({
                    id: p._id,
                    module: "material",
                    title: "Material purchased",
                    performedBy: p.createdBy?.name || "Admin",
                    role: p.createdBy?.role || "Admin",
                    time: p.createdAt,
                    details: `${p.materialId?.materialName} × ${p.quantity}`,
                });
        });

        // Material Received
        received.forEach((r) => {
            console.log("asdfeasdf", r),
            audit.push({
                id: r._id,
                module: "material",
                title: "Material received",
                performedBy: r.addedBy?.name || "Store",
                role: r.addedBy?.role || "User",
                time: r.createdAt,
                details: `${r.materialId?.materialName} × ${r.quantity}`,
            });
        });

        // Material Used
        used.forEach((u) => {
            audit.push({
                id: u._id,
                module: "material",
                title: "Material used",
                performedBy: u.addedBy?.name || "Site",
                role: u.addedBy?.role || "User",
                time: u.createdAt,
                details: `${u.materialId?.materialName} × ${u.quantity}`,
            });
        });

        /* ===============================
           SORT & RESPOND
        =============================== */

        audit.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return Response.json({
            success: true,
            data: audit,
        });
    } catch (error) {
        console.error("Audit API Error:", error);
        return Response.json(
            { success: false, message: "Failed to fetch audit data" },
            { status: 500 }
        );
    }
}
