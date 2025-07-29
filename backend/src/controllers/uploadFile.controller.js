import cloudinary from "../lib/cloudinary.js";
import fs from "fs";

export const uploadFile = async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "media",
    });

    // Delete local file after upload
    fs.unlinkSync(filePath);

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

export default uploadFile;
