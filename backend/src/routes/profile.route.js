import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getProfilePosts,
  updateUserProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

router.patch("/update-profile/:id", protectRoute, updateUserProfile);
router.get("/profile-posts/:id", protectRoute, getProfilePosts);

export default router;
