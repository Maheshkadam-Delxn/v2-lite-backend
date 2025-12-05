import mongoose from "mongoose";
import os from "os";
import process from "process";
import dbConnect from "@/lib/dbConnect";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function GET(req: NextRequest) {
  await dbConnect();

  const session = await getSession(req as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  // ✅ Ensure DB connection and handle undefined safely
  const db = mongoose.connection.db;
  if (!db)
    return NextResponse.json({ success: false, message: "Database not initialized" }, { status: 500 });

  const dbStats = await db.stats();

  const data = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpuLoad: os.loadavg(),
    dbName: db.databaseName,
    collections: dbStats.collections,
    storageSize: dbStats.storageSize,
    dataSize: dbStats.dataSize,
    indexes: dbStats.indexes,
  };

  return NextResponse.json({ success: true, data });
}
