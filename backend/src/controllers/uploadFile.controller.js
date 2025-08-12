import cloudinary from "../lib/cloudinary.js";
import fs from "fs";
import streamifier from "streamifier";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Determine media type
    const mimeType = req.file.mimetype;
    const isVideo = mimeType.startsWith("video/");
    const isImage = mimeType.startsWith("image/");

    if (!isVideo && !isImage) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const resourceType = isVideo ? "video" : "image";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "media",
        resource_type: resourceType,
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ error: "Cloudinary upload failed" });
        }

        // Optionally save to DB here
        // await MediaModel.create({ url: result.secure_url, type: resourceType });

        res.status(200).json({ url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export default uploadFile;
