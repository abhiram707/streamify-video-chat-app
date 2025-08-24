import mongoose from "mongoose";

let isConnected = false; // Track connection state

export const connectDB = async () => {
  if (isConnected) {
    // Reuse existing DB connection
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "streamify", // Ensure DB name consistency
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    throw new Error("MongoDB connection failed");
  }
};
