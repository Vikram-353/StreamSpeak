import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMyFriends,
  getRecommendedUsers,
  sendfriendRequest,
} from "../controllers/user.controller.js";

const router = express.Router();

//apply auth middleware to all route
router.use(protectRoute);
router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.get("/friend-request/:id", sendfriendRequest);

export default router;
