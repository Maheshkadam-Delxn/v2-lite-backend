"use server"; // ✅ Important for server action context

import { signToken, verifyToken } from "./jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TOKEN_NAME = "app_session";

// ✅ Create session and set token cookie
export async function createSession(userId: string) {
  const token = await signToken({ _id: userId });
  const cookieStore = await cookies(); // ✅ await required here

  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return token;
}

// ✅ Get session data from cookie
export async function getSession() {
  const cookieStore = await cookies(); // ✅ await here too
  const token = cookieStore.get(TOKEN_NAME)?.value;

  if (!token) return null;

  const decoded = await verifyToken(token);
  return decoded ? (decoded as any) : null;
}

// ✅ Destroy session (logout)
export async function destroySession() {
  const cookieStore = await cookies(); // ✅ same here
  cookieStore.delete(TOKEN_NAME);
}
