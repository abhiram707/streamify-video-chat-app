import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Read token from cookies or Authorization header (helps in Vercel/serverless envs)
    const token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded?.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    // Fetch user without password
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Error in protectRoute middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
  }
};
