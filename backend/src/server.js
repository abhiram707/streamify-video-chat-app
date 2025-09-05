import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";

const app = express();
const __dirname = path.resolve();

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://streamify-video-chat-app.vercel.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
  );
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start server with correct port for Render
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ Failed to connect to DB:", err));
