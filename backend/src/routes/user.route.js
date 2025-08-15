import express from  "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {acceptFriendRequest,getMyFriends,getRecommendedUsers, sendFriendRequest,getFriendRequests,getOutingFriendReqs } from "../controllers/user.controller.js";

const router=express.Router();

router.use(protectRoute);

router.get("/",getRecommendedUsers)
router.get("/friends",getMyFriends)

router.post("/friend-request/:id",sendFriendRequest);
router.put("/friend-request/:id/accept",acceptFriendRequest);
router.get("/friend-request/:id/reject",acceptFriendRequest)
router.get("/friend-requests",getFriendRequests)

router.get("/outgoing-friend-requests",getOutingFriendReqs);

export default router;