import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  getMyFriends,
  getRecommendedUsers,
  sendFriendRequest,
  getFriendRequests,
  getOutgoingFriendReqs,
} from "../controllers/user.controller.js";

const router = express.Router();

// All routes here require auth
router.use(protectRoute);

// 🔍 User discovery
router.get("/", getRecommendedUsers);

// 👥 Friends
router.get("/friends", getMyFriends);

// 🤝 Friend requests
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.put("/friend-request/:id/reject", rejectFriendRequest); // ✅ fixed
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutingFriendReqs);

export default router;
