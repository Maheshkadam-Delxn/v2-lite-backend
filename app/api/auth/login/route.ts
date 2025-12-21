// import dbConnect from "@/lib/dbConnect";
// import User from "@/models/User";
// import bcrypt from "bcryptjs";
// import { signToken } from "@/lib/jwt";
// import { createSession } from "@/lib/session";
// import { loginSchema } from "@/lib/validation";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   await dbConnect();
//   const body = await req.json();

//   const parsed = loginSchema.safeParse(body);
//   if (!parsed.success)
//     return NextResponse.json(
//       { success: false, message: "Invalid credentials" },
//       { status: 400 }
//     );

//   const { email, password } = parsed.data;

//   // ✅ Find user
//   const user = await User.findOne({ email });
//   if (!user)
//     return NextResponse.json(
//       { success: false, message: "User not found" },
//       { status: 404 }
//     );

//   // ✅ Check if email is verified
//   if (!user.isEmailVerified) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Please verify your email before logging in.",
//       },
//       { status: 403 }
//     );
//   }

//   // ✅ Validate password
//   const valid = await bcrypt.compare(password, user.password);
//   if (!valid)
//     return NextResponse.json(
//       { success: false, message: "Incorrect password" },
//       { status: 401 }
//     );

//   // ✅ Create JWT and session
//   const token = await signToken({ _id: user._id, role: user.role });
//   await createSession(user._id.toString());

//   // ✅ Update last login
//   user.lastLogin = new Date();
//   await user.save();

//   // ✅ Send success response
//   return NextResponse.json({
//     success: true,
//     message: "Login successful",
//     data: {
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     },
//   });
// }
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Role from "@/models/Role";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  console.log("Body",body);

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 400 }
    );

  const { email, password } = parsed.data;

  // ------------------------------
  // FIND USER
  // ------------------------------
  const user: any = await User.findOne({ email });
  if (!user)
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );

  // ------------------------------
  // CHECK EMAIL VERIFIED
  // ------------------------------
  if (!user.isEmailVerified) {
    return NextResponse.json(
      {
        success: false,
        message: "Please verify your email before logging in.",
        status:403
      },
      { status: 403 }
    );
  }
   if (user.newpassRequired) {
    return NextResponse.json(
      {
        success: false,
        message: "Update Password",
      },
      { status: 403 }
    );
  }


  // ------------------------------
  // CHECK PASSWORD
  // ------------------------------
  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return NextResponse.json(
      { success: false, message: "Incorrect password" },
      { status: 401 }
    );

  // ------------------------------
  // CREATE TOKEN + SESSION
  // ------------------------------
  const token = await signToken({ _id: user._id, role: user.role });
  await createSession(user._id.toString());

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // ------------------------------
  // ROLE-BASED PERMISSIONS
  // ------------------------------
  let permissions = null;

  // ❌ No permissions for admin and client
  if (user.role !== "admin" && user.role !== "client") {
    const roleDoc = await Role.findOne({ name: user.role });

    if (!roleDoc) {
      return NextResponse.json(
        {
          success: false,
          message: `Role '${user.role}' not found in Role schema`,
        },
        { status: 500 }
      );
    }

    permissions = roleDoc.permissions;
  }

  // ------------------------------
  // FINAL RESPONSE
  // ------------------------------
  return NextResponse.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions, // null for admin/client, object for other roles
      },
    },
  });
}
