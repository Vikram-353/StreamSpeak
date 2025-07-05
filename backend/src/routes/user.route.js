import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptfriendRequest,
  getfriendRequest,
  getMyFriends,
  getOutgoingFriendRequest,
  getRecommendedUsers,
  sendfriendRequest,
} from "../controllers/user.controller.js";

const router = express.Router();

//apply auth middleware to all route
router.use(protectRoute);
router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.get("/friend-request/:id", sendfriendRequest);
router.put("/friend-request/:id/accept", acceptfriendRequest);

router.get("/friend-request", getfriendRequest);
router.get("/outgoing-friend-request", getOutgoingFriendRequest);

export default router;
