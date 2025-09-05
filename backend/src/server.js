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

// ----------------- MIDDLEWARE -----------------
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// ✅ CORS (allow Vercel + localhost + credentials)
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
  })
);

// ----------------- API ROUTES -----------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// ----------------- SERVE FRONTEND -----------------
if (process.env.NODE_ENV === "production") {
  // Try Vite build folder first
  let frontendPath = path.join(__dirname, "../frontend/dist");
  
  // Fallback to CRA build folder
  if (!require("fs").existsSync(frontendPath)) {
    frontendPath = path.join(__dirname, "../frontend/build");
  }

  app.use(express.static(frontendPath));

  app.get("*", (req, res) =>
    res.sendFile(path.join(frontendPath, "index.html"))
  );
}

// ----------------- GLOBAL ERROR HANDLER -----------------
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ Failed to connect to DB:", err));
