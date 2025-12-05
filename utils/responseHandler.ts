import { NextResponse } from "next/server";

export function successResponse(data: any, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message = "Something went wrong", status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}
