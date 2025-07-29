import express from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  toggleLikePost,
  commentOnPost,
  getPostComments,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllPosts);
router.post("/", protectRoute, createPost);
router.put("/:id", protectRoute, updatePost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, toggleLikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.get("/comment/:id", getPostComments);

export default router;
