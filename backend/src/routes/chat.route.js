// src/routes/chat.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const router = express.Router();

// 🎟️ Generate Stream token (protected)
router.get("/token", protectRoute, getStreamToken);

export default router;
