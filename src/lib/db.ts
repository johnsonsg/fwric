import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/fwric-dev";

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(MONGODB_URI);
  isConnected = true;
}
