import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/fwric-dev";

let connection: ReturnType<typeof mongoose.connect> | null = null;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;

  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  mongoose.set("strictQuery", true);

  connection ??= mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000, connectTimeoutMS: 4000 });
  try { await connection; } catch (error) { connection = null; throw error; }
}
