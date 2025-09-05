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

// -------------------- Middleware --------------------
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// ✅ CORS setup - Updated for separate deployments
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // CRA dev server (if needed)
      "https://streamify-video-chat-app-pr1x.vercel.app", // Your Vercel deployment
      "https://*.vercel.app" // All Vercel preview deployments
    ],
    credentials: true, // allow cookies
  })
);

// -------------------- API Routes --------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// -------------------- Health Check --------------------
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Backend is running!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// -------------------- Remove Frontend Serving --------------------
// Since frontend is deployed on Vercel, we don't serve it from backend

// -------------------- Global Error Handler --------------------
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => console.error("❌ Failed to connect to DB:", err));
