// import dbConnect from "@/lib/dbConnect";
// import User from "@/models/User";
// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";
// import { canAccess, isAdmin, isManager } from "@/utils/permissions";

// export async function GET(req: Request) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session)
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

//   const users = await User.find().select("-password");
//   return NextResponse.json({ success: true, data: users });
// }

// export async function POST(req: Request) {
//   await dbConnect();
//   const admin = await getSession(req as any);
//   if (!admin || !isAdmin(admin.role))
//     return NextResponse.json({ success: false, message: "Only admin can create users" }, { status: 403 });

//   const body = await req.json();
//   const existing = await User.findOne({ email: body.email });
//   if (existing)
//     return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });

//   const user = await User.create(body);
//   return NextResponse.json({ success: true, message: "User created", data: user });
// }







// import dbConnect from "@/lib/dbConnect";
// import User from "@/models/User";
// import Role from "@/models/Role";
// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";
// import { isAdmin } from "@/utils/permissions";

// export async function GET(req: Request) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 403 }
//     );
//   }

//   // Fetch users without password
//   const users = await User.find().select("-password").lean();

//   // Attach permissions for non-admin & non-client
//   const usersWithPermissions = await Promise.all(
//     users.map(async (user: any) => {
//       if (user.role !== "admin" && user.role !== "client") {
//         const roleDoc = await Role.findOne({ name: user.role }).lean();
//         return {
//           ...user,
//           permissions: roleDoc?.permissions || null,
//         };
//       }

//       return {
//         ...user,
//         permissions: null,
//       };
//     })
//   );

//   return NextResponse.json({
//     success: true,
//     data: usersWithPermissions,
//   });
// }

// export async function POST(req: Request) {
//   await dbConnect();
//   const admin = await getSession(req as any);

//   if (!admin || !isAdmin(admin.role)) {
//     return NextResponse.json(
//       { success: false, message: "Only admin can create users" },
//       { status: 403 }
//     );
//   }

//   const body = await req.json();

//   const existing = await User.findOne({ email: body.email });
//   if (existing) {
//     return NextResponse.json(
//       { success: false, message: "User already exists" },
//       { status: 400 }
//     );
//   }

//   const user = await User.create(body);

//   return NextResponse.json({
//     success: true,
//     message: "User created",
//     data: user,
//   });
// }



import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Role from "@/models/Role";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

/* ----------------------------- */
/* Type for extended user object */
/* ----------------------------- */
interface IUserWithPermissions {
  _id: string;
  name?: string;
  email?: string;
  role: string;
  permissions: any | null;
  [key: string]: any;
}

/* ============================= */
/* GET USERS */
/* ============================= */
export async function GET(req: Request) {
  try {
    await dbConnect();

    const session = await getSession(req as any);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    /* Fetch users without password */
    const users = await User.find().select("-password").lean();

    /* Fetch all roles once */
    const roles = await Role.find().lean();

    /* Create role -> permissions map */
    const roleMap = roles.reduce((acc: any, role: any) => {
      acc[role.name] = role.permissions;
      return acc;
    }, {});

    /* Attach permissions */
    const usersWithPermissions: IUserWithPermissions[] = users.map(
      (user: any) => ({
        ...user,
        permissions:
          user.role !== "admin" && user.role !== "client"
            ? roleMap[user.role] || null
            : null,
      })
    );

    return NextResponse.json({
      success: true,
      data: usersWithPermissions,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* ============================= */
/* CREATE USER */
/* ============================= */
export async function POST(req: Request) {
  try {
    await dbConnect();

    const admin = await getSession(req as any);

    if (!admin || !isAdmin(admin.role)) {
      return NextResponse.json(
        { success: false, message: "Only admin can create users" },
        { status: 403 }
      );
    }

    const body = await req.json();

    /* Check existing user */
    const existing = await User.findOne({ email: body.email });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    /* Create user */
    const user = await User.create(body);

    /* Remove password before returning */
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: userObj,
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
