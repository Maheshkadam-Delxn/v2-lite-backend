// app/api/vendors/route.ts
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { NextResponse } from "next/server";

// GET /api/vendors  -> fetch all vendors
export async function GET() {
  try {
    await dbConnect();
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: vendors }, { status: 200 });
  } catch (error) {
    console.error("GET /api/vendors error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/vendors -> create a vendor
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, vendorcode, gstinno, address } = body;

    if (!name || !email || !vendorcode || !gstinno || !address) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // check if vendor exists by email or vendorcode
    const existing = await Vendor.findOne({
      $or: [{ email: email }, { vendorcode: vendorcode }],
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Vendor with same email or vendorcode already exists" },
        { status: 400 }
      );
    }

    const vendor = await Vendor.create({ name, email, vendorcode, gstinno, address });
    return NextResponse.json({ success: true, message: "Vendor created", data: vendor }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/vendors error:", err);
    if (err.code === 11000) {
      const dup = Object.keys(err.keyValue || {}).join(", ");
      return NextResponse.json({ success: false, message: `Duplicate field(s): ${dup}` }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
