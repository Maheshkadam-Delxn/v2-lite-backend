// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { verifyToken } from "@/lib/jwt";

// const PUBLIC_PATHS = [
//   "/api/auth/login",
//   "/api/auth/register",
//   "/api/auth/refresh-token",
//   "/api/auth/password/forgot",
//   "/api/auth/password/reset",
//   "/api/utils/health",
// ];

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Allow public routes without auth
//   const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
//   if (isPublic) return NextResponse.next();

//   // Get token from Authorization header or cookie
//   const authHeader = req.headers.get("authorization");
//   const cookieToken = req.cookies.get("app_session")?.value;
//   const token = authHeader?.startsWith("Bearer ")
//     ? authHeader.split(" ")[1]
//     : cookieToken;

//   if (!token) {
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//   }

//   const decoded = await verifyToken(token);
//   if (!decoded) {
//     return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
//   }

//   // 🛠 Fix for ObjectId with binary buffer structure
//   let userId = (decoded as any)._id;
//   if (userId && typeof userId === "object" && userId.buffer) {
//     const byteArray = Object.values(userId.buffer) as number[]; // ✅ Explicitly cast
//     userId = Buffer.from(byteArray).toString("hex"); // ✅ Works perfectly now
//   }

//   console.log("✅ Decoded userId:", userId);
//   console.log("✅ Role:", (decoded as any).role);

//   // Allow the request to continue
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/api/:path*"],
// };


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh-token",
  "/api/auth/password/forgot",
  "/api/auth/password/reset",
  "/api/utils/health",
  "/api/auth/verify-email"
];
//sample
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("🌐 Incoming request to:", pathname);
  // ✅ Allow all CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // allow all origins
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "*", // allow all headers
  };

  // ✅ Handle OPTIONS requests (CORS preflight)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // ✅ Skip authentication for public routes
  const isPublic = PUBLIC_PATHS.some((path) =>{ 
    console.log(path)
   return pathname===path || pathname.startsWith(path + "/")});
  if (isPublic) {
    const res = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => res.headers.set(key, value));
    return res;
  }
  console.log(isPublic)
  // ✅ Extract token
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("app_session")?.value;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : cookieToken;

  if (!token) {
    return new NextResponse(JSON.stringify({ success: false, message: "Unauthorized data" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // ✅ Verify JWT
  const decoded = await verifyToken(token);
  if (!decoded) {
    return new NextResponse(JSON.stringify({ success: false, message: "Invalid or expired token" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // 🧩 Optional: Fix ObjectId buffer issue
  let userId = (decoded as any)._id;
  if (userId && typeof userId === "object" && userId.buffer) {
    const byteArray = Object.values(userId.buffer) as number[];
    userId = Buffer.from(byteArray).toString("hex");
  }

  console.log("✅ Authenticated user:", userId, "Role:", (decoded as any).role);

  // ✅ Continue with full CORS headers applied
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
