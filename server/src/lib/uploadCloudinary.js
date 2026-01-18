import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";

dotenv.config();
const uploadRouter = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post("/upload", upload.single("image"), async (req, res) => {
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const streamUpload = (reqFileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(reqFileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);
    res.status(200).json({ success: true, files: [{ url: result.secure_url }] });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

export default uploadRouter;
