import dbConnect from "@/lib/dbConnect";
import Survey from "@/models/Survey";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";
import Project from "@/models/Project";
import ProjectType from "@/models/ProjectType";
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap the Promise

  const survey = await Survey.findById(id).populate("requestedBy approvedBy projectId");
  if (!survey)
    return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: survey });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap

  const updates = await req.json();
  const survey = await Survey.findById(id);
  if (!survey)
    return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

  if (survey.requestedBy.toString() !== session._id.toString())
    return NextResponse.json(
      { success: false, message: "You can only update your own survey" },
      { status: 403 }
    );

  Object.assign(survey, updates);
  await survey.save();

  return NextResponse.json({
    success: true,
    message: "Survey updated successfully",
    data: survey,
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json(
      { success: false, message: "Only admin can delete surveys" },
      { status: 403 }
    );

  const { id } = await context.params; // ✅ unwrap

  const deleted = await Survey.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Survey deleted successfully" });
}

// export async function PATCH(req: Request,  context: { params: Promise<{ id: string }>}) {
//   try {
//     await dbConnect();
//     const session = await getSession(req as any);
//     const { id } = await context.params;

//     if (!session) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const updateData = await req.json();
// console.log(updateData);
//     const updatedSurvey = await Survey.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true }
//     );

//     if (!updatedSurvey) {
//       return NextResponse.json(
//         { success: false, message: "Survey not found" },
//         { status: 404 }
//       );
//     }
//     if (updatedSurvey.projectId) {
//       await Project.findByIdAndUpdate(
//         updatedSurvey.projectId,
//         { status: "ongoing" },
//         { new: true }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Survey updated",
//       data: updatedSurvey
//     });

//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const session = await getSession(req as any);
    const { id } = await context.params;

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const updateData = await req.json();
    console.log("Survey Update:", updateData);

    // 1️⃣ Update Survey
    const updatedSurvey = await Survey.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedSurvey) {
      return NextResponse.json(
        { success: false, message: "Survey not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Update related project
    if (updatedSurvey.projectId) {
      const project = await Project.findById(updatedSurvey.projectId);

      if (project) {
        // 3️⃣ Fetch projectType for estimatedDays
        const projectType = await ProjectType.findById(project.projectType);

        let estimatedDays = projectType?.estimated_days || 0;

        // 4️⃣ Calculate start and end dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + estimatedDays);

        // 5️⃣ Update Project
        await Project.findByIdAndUpdate(
          updatedSurvey.projectId,
          {
            status: "ongoing",
            startDate: startDate,
            endDate: endDate,
          },
          { new: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Survey updated & project timeline updated",
      data: updatedSurvey
    });

  } catch (err: any) {
    console.log("PATCH ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
