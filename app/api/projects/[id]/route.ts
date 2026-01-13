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

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const project = await Project.findById(id).populate("manager engineers projectType");
    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
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
    const project = await Project.findByIdAndUpdate(id, updates, { new: true }).populate("manager engineers projectType");

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    console.log("Received updates for project:", id, updates);
    console.log("Project after update:", isNowApproved, project.projectType._id);

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

  if (!session ) {
    return NextResponse.json({ success: false, message: "Only admin can delete projects" }, { status: 403 });
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