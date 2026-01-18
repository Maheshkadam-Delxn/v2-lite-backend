// import dbConnect from "@/lib/dbConnect";
// import Project from "@/models/Project";
// import { NextResponse, NextRequest } from "next/server";
// import { getSession } from "@/lib/auth";
// import { canAccess, isAdmin } from "@/utils/permissions";
// import BOQ from "@/models/Boq";
// export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session) {
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//   }

//   const { id } = await context.params;

//   try {
//     const project = await Project.findById(id).populate("manager engineers projectType");
//     if (!project) {
//       return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, data: project });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, message: "Invalid project ID" }, { status: 400 });
//   }
// }

// export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session) {
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//   }

//   const { id } = await context.params;


//   const updates = await req.json();



//   try {

//     const isNowApproved = updates.status === "Ongoing";
//     const project = await Project.findByIdAndUpdate(id, updates, { new: true }).populate("manager engineers projectType");

//     if (!project) {
//       return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
//     }
//     console.log("Received updates for project:", id, updates);
//     console.log("Project after update:", isNowApproved, project.projectType._id);
//     if (isNowApproved && project.projectType) {

//       const boqTemplates = await BOQ.find({
//         projectTypeId: project.projectType._id,
//         projectId: { $exists: false },
//       });
//       console.log(`Found ${boqTemplates.length} BOQ templates for project type`, JSON.stringify(boqTemplates, null, 2));
//      const boqTemplatesWithProjectId = boqTemplates.map(template => {
//   const templateObj = template.toObject();

//   return {
//     _id: templateObj._id,
//     boqName: templateObj.boqName,
//     projectId: project._id, // Add projectId here
//     projectTypeId: templateObj.projectTypeId,
//     builtUpArea: templateObj.builtUpArea,
//     structuralType: templateObj.structuralType,
//     foundationType: templateObj.foundationType,
//     boqVersion: templateObj.boqVersion.map(version => ({
//       versionNumber: version.versionNumber,
//       createdAt: version.createdAt,
//       materials: version.materials.map(material => ({
//         name: material.name,
//         qty: material.qty,
//         unit: material.unit,
//         rate: material.rate,
//         amount: material.amount,
//         _id: material._id
//       })),
//       status: version.status,
//       rejectionReason: version.rejectionReason,
//       clientApproval: version.clientApproval,
//       contractorApproval: version.contractorApproval,
//       laborCost: version.laborCost,
//       totalMaterialCost: version.totalMaterialCost,
//       totalCost: version.totalCost,
//       _id: version._id
//     })),
//     status: templateObj.status,
//     createdBy: templateObj.createdBy,
//     updatedBy: templateObj.updatedBy, // Add this field from schema
//     __v: templateObj.__v,
//     createdAt: templateObj.createdAt,
//     updatedAt: templateObj.updatedAt
//   };
// });

//       console.log(`Cloned BOQ templates with projectId:`, JSON.stringify(boqTemplatesWithProjectId, null, 2));
//       if (boqTemplatesWithProjectId.length > 0) {
//         await BOQ.insertMany(boqTemplatesWithProjectId);
//       }
//     }


//     return NextResponse.json({
//       success: true,
//       message: "Project updated successfully",
//       data: project,
//     });
//   } catch (error: any) {
//     console.error("Error updating project:", error.message);
//     return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
//   }
// }

// export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session || !isAdmin(session.role)) {
//     return NextResponse.json({ success: false, message: "Only admin can delete projects" }, { status: 403 });
//   }

//   const { id } = await context.params;

//   try {
//     const deleted = await Project.findByIdAndDelete(id);
//     if (!deleted) {
//       return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, message: "Project deleted successfully" });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
//   }
// }

import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess, isAdmin } from "@/utils/permissions";
import BOQ from "@/models/Boq";
import PlanFolder from "@/models/PlanAnnotaion";

import Survey from "@/models/Survey";

import Notification from "@/models/Notification";
import Transaction from "@/models/NewTransaction";
import mongoose from "mongoose";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const project = await Project.findById(id).populate("manager engineers projectType").lean();

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    // --- Calculate Total Expenses ---
    const totalExpenseResult = await Transaction.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = totalExpenseResult[0]?.total || 0;

    // --- Calculate Time Stats ---
    let daysElapsed = 0;
    let totalDuration = 0;

    const projectData = project as any; // Cast to any to avoid strict type checks on startDate/endDate

    if (projectData.startDate && projectData.endDate) {
      const start = new Date(projectData.startDate).getTime();
      const end = new Date(projectData.endDate).getTime();
      const now = Date.now();

      const oneDay = 1000 * 60 * 60 * 24;

      totalDuration = Math.ceil((end - start) / oneDay);
      daysElapsed = Math.ceil((now - start) / oneDay);

      // Clamping values
      if (daysElapsed < 0) daysElapsed = 0;
      if (typeof totalDuration === 'number' && totalDuration < 0) totalDuration = 0;
    }

    // Return enriched data
    return NextResponse.json({
      success: true,
      data: {
        ...project,
        totalExpenses,
        daysElapsed,
        totalDuration
      }
    });

  } catch (error: any) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ success: false, message: "Invalid project ID" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  const updates = await req.json();

  try {
    const isNowApproved = updates.status === "Ongoing";

    // Fetch original project to compare dates BEFORE update (or capture current state)
    // Actually, findByIdAndUpdate returns the *original* document by default unless {new: true} is passed.
    // But here {new: true} IS passed. So we need the original first or compare differently.
    // Let's rely on the fact that we need the OLD date.

    const existingProject = await Project.findById(id);
    const oldEndDate = existingProject?.endDate;

    const project = await Project.findByIdAndUpdate(id, updates, { new: true }).populate("manager engineers projectType");

    // --- Time Duration Extend Alert ---
    if (existingProject && updates.endDate) {
      const newEndDate = new Date(updates.endDate);
      const originalEndDate = new Date(oldEndDate);

      if (newEndDate > originalEndDate) {
        try {
          await Notification.create({
            userId: project.manager._id, // Assuming populated
            title: "Project Timeline Extended",
            message: `Project "${project.name}" timeline has been extended from ${originalEndDate.toDateString()} to ${newEndDate.toDateString()}.`,
            type: "alert",
            link: `/projects/${project._id}`
          });
          console.log("Time extension notification sent.");
        } catch (err) {
          console.error("Error sending time extension notification:", err);
        }
      }
    }
    // ----------------------------------

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    console.log("Received updates for project:", id, updates);
    // console.log("Project after update:", isNowApproved, project.projectType._id);

    function calculateEndDateFromISO(startDateISO: string, estimatedDays: number) {
  const startDate = new Date(startDateISO);

  if (isNaN(startDate.getTime())) {
    throw new Error("Invalid startDate");
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + estimatedDays);

  return endDate.toISOString();
}

if (
  isNowApproved &&
  project.startDate &&
  project.projectType?.estimated_days
) {
  const endDateISO = calculateEndDateFromISO(
    project.startDate,
    project.projectType.estimated_days
  );

  project.endDate = endDateISO;
  await project.save();

  console.log("Start Date:", project.startDate);
  console.log("End Date:", project.endDate);
}
    if (isNowApproved && project.projectType) {
      // Use .lean() for better performance and plain objects
      const boqTemplates = await BOQ.find({
        projectTypeId: project.projectType._id,
        projectId: { $exists: false },
      }).lean();

      console.log(`Found ${boqTemplates.length} BOQ templates for project type`);

      if (boqTemplates.length > 0) {
        const boqsToInsert = boqTemplates.map((template: any) => {
          // Deep clone the object to avoid reference issues
          const newBoq = JSON.parse(JSON.stringify(template));

          // Remove the _id to let MongoDB generate a new one
          delete newBoq._id;

          // Add the projectId
          newBoq.projectId = project._id;

          // Also remove _id from nested boqVersion array
          newBoq.boqVersion = newBoq.boqVersion.map((version: any) => {
            const newVersion = { ...version };
            delete newVersion._id;

            // Remove _id from materials array
            newVersion.materials = newVersion.materials.map((material: any) => {
              const newMaterial = { ...material };
              delete newMaterial._id;
              return newMaterial;
            });

            return newVersion;
          });

          // Update createdBy to current user
          newBoq.createdBy = session._id;

          // Remove timestamps to get new ones
          delete newBoq.createdAt;
          delete newBoq.updatedAt;

          // Remove version key
          delete newBoq.__v;

          return newBoq;
        });

        console.log(`Creating ${boqsToInsert.length} new BOQs for project ${project._id}`);

        // Insert the new BOQs
        const createdBOQs = await BOQ.insertMany(boqsToInsert);
        console.log(`Successfully created ${createdBOQs.length} BOQs`);
      }


      // 2. Clone PlanFolders (simplified - no hierarchy preservation)
      const planTemplates = await PlanFolder.find({
        projectTypeId: project.projectType._id,
        projectId: { $exists: false },
      }).lean();

      console.log(`Found ${planTemplates.length} PlanFolder templates for project type`);

      if (planTemplates.length > 0) {
        const plansToInsert = planTemplates.map((template: any) => {
          const newPlan = JSON.parse(JSON.stringify(template));

          // Remove main IDs
          delete newPlan._id;
          delete newPlan.createdAt;
          delete newPlan.updatedAt;
          delete newPlan.__v;

          // Add projectId
          newPlan.projectId = project._id;

          // Update createdBy
          newPlan.createdBy = session._id;

          // Reset parentFolder to null (flatten hierarchy)
          newPlan.parentFolder = null;

          // Remove IDs from planDocuments
          if (newPlan.planDocuments && Array.isArray(newPlan.planDocuments)) {
            newPlan.planDocuments.forEach((document: any) => {
              delete document._id;

              if (document.versions && Array.isArray(document.versions)) {
                document.versions.forEach((version: any) => {
                  delete version._id;

                  if (version.annotations && Array.isArray(version.annotations)) {
                    version.annotations.forEach((annotation: any) => {
                      delete annotation._id;
                      annotation.createdBy = session._id;
                      annotation.createdAt = new Date();
                    });
                  }
                });
              }
            });
          }

          return newPlan;
        });

        const createdPlans = await PlanFolder.insertMany(plansToInsert);
        console.log(`Successfully created ${createdPlans.length} PlanFolders`);
      }


      // 3. Clone Survey templates (keep everything as is from template)
      const surveyTemplates = await Survey.find({
        projectTypeId: project.projectType._id,
        projectId: { $exists: false },
      }).lean();

      console.log(`Found ${surveyTemplates.length} Survey templates for project type`);

      if (surveyTemplates.length > 0) {
        const surveysToInsert = surveyTemplates.map((template: any) => {
          const newSurvey = JSON.parse(JSON.stringify(template));

          // Remove main IDs and timestamps
          delete newSurvey._id;
          delete newSurvey.createdAt;
          delete newSurvey.updatedAt;
          delete newSurvey.__v;

          // Update project reference
          newSurvey.projectId = project._id;
          newSurvey.status = "completed"; // or whatever default status you want

          // Update createdBy if field exists (your schema doesn't have this field)
          // newSurvey.createdBy = session._id; // Only if your schema has createdBy field

          return newSurvey;
        });

        const createdSurveys = await Survey.insertMany(surveysToInsert);
        console.log(`Successfully created ${createdSurveys.length} Survey templates`);
      }




    }

    if (project.plans) {
      const planFolders = project.plans.map((plan: any) => ({
        name: plan.planName,          // ✅ folder name
        parentFolder: null,
        projectId: project._id,
       
        planDocuments: [
          {
            name: "Document",         // ✅ document name
            versions: [
              {
                versionNumber: 1,
                image: plan.planFileUrl,
                annotations: [],
                status: "approved",
                createdAt: new Date(),
              },
            ],
          },
        ],
        createdBy: session._id,
      }));

      await PlanFolder.insertMany(planFolders);
      console.log(`Inserted ${planFolders.length} plan folders for project ${project._id}`);


    }
    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error: any) {
    console.error("Error updating project:", error.message, error.stack);
    return NextResponse.json({
      success: false,
      message: "Update failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Permission Restricted" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}