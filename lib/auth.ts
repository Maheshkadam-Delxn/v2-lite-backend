import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import dbConnect from "./dbConnect";
import User from "@/models/User";

export async function getSession(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("⚠️ No authorization header found");
      return null;
    }

    const token = authHeader.split(" ")[1];
    console.log("🪪 Token received:", token);

    const decoded = await verifyToken(token);
    if (!decoded) return null;

    // 🧩 Extract and normalize userId
    let userId = (decoded as any)._id;
    console.log("🔍 Raw userId from token:", userId);

    // Case 1: userId is a simple string (normal)
    if (typeof userId === "string") {
      console.log("✅ userId is a string");
    }

    // Case 2: userId = { buffer: { 0: 105, 1: 14, ... } }
    else if (userId && typeof userId === "object" && userId.buffer) {
      const bufferValues = Object.values(userId.buffer);
      const buffer = Buffer.from(bufferValues as number[]);
      userId = buffer.toString("hex");
      console.log("🧠 Converted buffer userId →", userId);
    }

    // Case 3: userId = { type: 'Buffer', data: [105, 14, 40, ...] }
    else if (userId && userId.type === "Buffer" && Array.isArray(userId.data)) {
      const buffer = Buffer.from(userId.data);
      userId = buffer.toString("hex");
      console.log("🧠 Converted data userId →", userId);
    }

    // Case 4: Invalid format
    else {
      console.warn("⚠️ Unknown userId format, decoded:", userId);
      return null;
    }

    // ✅ Ensure DB connection
    await dbConnect();

    // ✅ Try fetching user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.warn("❌ No user found with ID:", userId);
      return null;
    }

    console.log("👤 Authenticated User:", user.email || user.name);
    return user;
  } catch (error: any) {
    console.error("❌ Error in getSession:", error.message);
    return null;
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await getSession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return user;
}
