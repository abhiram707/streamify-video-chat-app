import mongoose from "mongoose";

let isConnected = false; // track the connection

export const connectDB = async () => {
  if (isConnected) {
    // Use existing connection
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "streamify", // optional: force DB name
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw new Error("MongoDB connection failed");
  }
};
