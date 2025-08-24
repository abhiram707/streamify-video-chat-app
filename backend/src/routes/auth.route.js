import express from "express";
import { login, logout, signup, onboard } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔑 Auth Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// 🚀 Onboarding (protected)
router.post("/onboarding", protectRoute, onboard);

// 👤 Get logged-in user details
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user, // `req.user` is set in middleware
  });
});

export default router;
