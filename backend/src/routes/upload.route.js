import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadFile } from "../controllers/uploadFile.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", protectRoute, upload.single("file"), uploadFile);

export default router;
