import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

// ✅ Cache type
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// ✅ Extend global object safely
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// ✅ Initialize cache (guaranteed)
const globalCache = globalThis.mongooseCache || {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = globalCache;

export default async function dbConnect(): Promise<typeof mongoose> {
  // ✅ Now guaranteed to be defined
  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "constructionApp",
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
