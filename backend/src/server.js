// server.js
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser"; 
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import { connectDB } from "./lib/db.js";
import chatRoutes from "./routes/chat.route.js";
const app = express();
const PORT = process.env.PORT || 5001;

const __dirname=path.resolve();

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))

// Middleware
app.use(express.json());
app.use(cookieParser()); // ✅ this must be before routes

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/chat",chatRoutes);
if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"../frontend/dist")));
  app.get("*",(req,res)=>{
    res.sendFile(path.join(__diirname,"../frontend","dist","index.html"));
  })
}
// Connect to database first, then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
  });
