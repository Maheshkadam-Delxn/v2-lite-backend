// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_EXPIRY = "7d";

// export function signToken(payload: any) {

//   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
// }

// export function verifyToken(token: string) {
//   console.log("verify",token);
//   try {
//     const dd=jwt.verify(token, JWT_SECRET);
//     console.log("asdfe",dd);
//     return dd;
//   } catch {
//     return null;
//   }
// }

// export function decodeToken(token: string) {
//   return jwt.decode(token);
// }
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);


export async function signToken(payload: any) {

  const tt=await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return tt;
}

export async function verifyToken(token: string) {
  try {
    const cleanToken = token.replace(/^Bearer\s+/i, "");
    console.log(cleanToken)
    const { payload } = await jwtVerify(cleanToken, JWT_SECRET);
    console.log("✅ JWT verified:", payload);
    return payload;
  } catch (err: any) {
    console.error("❌ JWT verification failed:", err.message);
    return null;
  }
}
