// import dbConnect from "@/lib/dbConnect";
// import ProjectType from "@/models/ProjectType";
// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";
// import { isAdmin } from "@/utils/permissions";

// // ✅ CREATE Project Type
// export async function POST(req: Request) {
//   await dbConnect();
//   const session = await getSession(req as any);
//     console.log("Session in project type POST:", session);
//   if (!session || !isAdmin(session.role)) {
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//   }

//   try {
//     const { name, description, category,image } = await req.json();

//     if (!name) {
//       return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
//     }

//     const existing = await ProjectType.findOne({ name });
//     if (existing) {
//       return NextResponse.json({ success: false, message: "Project type already exists" }, { status: 409 });
//     }

//     const type = await ProjectType.create({
//       name,
//       description,
//       category,
//       image,
//       createdBy: session._id,
//     });

//     return NextResponse.json({ success: true, message: "Project type created", data: type }, { status: 201 });
//   } catch (error: any) {
//     console.error("Error creating project type:", error.message);
//     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//   }
// }

// // ✅ GET All Project Types
// export async function GET() {
//   await dbConnect();

//   try {
//     const types = await ProjectType.find().sort({ createdAt: -1 });
//     return NextResponse.json({ success: true, data: types });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, message: "Failed to fetch project types" }, { status: 500 });
//   }
// }
import dbConnect from "@/lib/dbConnect";
import ProjectType from "@/models/ProjectType";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

// ✅ CREATE Project Type
export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  console.log("Session in project type POST:", session);

  if (!session || !isAdmin(session.role)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const {
      projectTypeName,
      description,
      category,
      image,
      landArea,
      estimated_days,
      budgetMaxRange,
      budgetMinRange,
      material,
      isActive, // optional, can be omitted and default to true
    } = await req.json();

    if (!projectTypeName) {
      return NextResponse.json(
        { success: false, message: "Project type name is required" },
        { status: 400 }
      );
    }

    // Check if project type already exists by projectTypeName
    const existing = await ProjectType.findOne({ projectTypeName });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Project type already exists" },
        { status: 409 }
      );
    }

    const type = await ProjectType.create({
      projectTypeName,
      description,
      category,
      image,
      landArea,
      estimated_days,
      budgetMaxRange,
      budgetMinRange,
      material, // expecting array of { material_name, units, quantity }
      isActive, // if undefined, schema default (true) will apply
      createdBy: session._id,
      // ❌ no need to set createdAt manually because of { timestamps: true }
    });

    return NextResponse.json(
      { success: true, message: "Project type created", data: type },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating project type:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ GET All Project Types
export async function GET() {
  await dbConnect();

  try {
    // If you want only active:
    // const types = await ProjectType.find({ isActive: true }).sort({ createdAt: -1 });

    const types = await ProjectType.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: types });
  } catch (error: any) {
    console.error("Error fetching project types:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch project types" },
      { status: 500 }
    );
  }
}
