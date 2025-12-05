import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import mongoose from "mongoose";

// =====================
// PUT /api/vendors/:id
// =====================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params; // ✅ REQUIRED IN NEXT.JS 15+

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid vendor ID" },
        { status: 400 }
      );
    }

    const updates = await req.json();

    const allowed = ["name", "email", "vendorcode", "gstinno", "address"];
    const filtered: Record<string, any> = {};

    allowed.forEach((field) => {
      if (updates[field] !== undefined) {
        filtered[field] = updates[field];
      }
    });

    const updatedVendor = await Vendor.findByIdAndUpdate(id, filtered, {
      new: true,
      runValidators: true,
    });

    if (!updatedVendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Vendor updated", data: updatedVendor },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/vendors/:id error:", error);

    // Duplicate key error
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyValue || {}).join(", ");
      return NextResponse.json(
        { success: false, message: `Duplicate value for: ${duplicateKey}` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ========================
// DELETE /api/vendors/:id
// ========================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params; // ✅ REQUIRED IN NEXT.JS 15+

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid vendor ID" },
        { status: 400 }
      );
    }

    const removedVendor = await Vendor.findByIdAndDelete(id);

    if (!removedVendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Vendor deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
