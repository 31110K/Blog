import express from "express";
import Post from "../models/post.js";
import { protectRoute } from "../middlewares/auth_middleware.js";
import mongoose from "mongoose";

const createPost_router = express.Router();
const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

createPost_router.post(
  "/createPost",
  protectRoute,
  async (req, res) => {
    try {

      const {
        author,
        title,
        content,
        excerpt,
        featuredImage,
        categories,
        tags,
        status,
        publishedAt,
        scheduledAt,
        visibility,
        metaTitle,
        metaDescription,
        isCommentable,
      } = req.body;

      let featuredImageUrl = featuredImage?.url || "";
      let featuredImageCredit = featuredImage?.credit || "";

      if (featuredImageUrl && !/^https?:\/\//.test(featuredImageUrl)) {
        featuredImageUrl = "";
      }

      const post = new Post({
        author,
        title,
        content,
        excerpt,
        featuredImage: {
          url: featuredImageUrl,
          credit: featuredImageCredit,
        },
        categories,
        tags,
        status,
        publishedAt,
        scheduledAt,
        visibility,
        metaTitle,
        metaDescription,
        isCommentable,
      });

      await post.save();

      // 🔥 If post is published → send to recommender API
      if (status === "publish") {

        try {

          const payload = {
            post_id: post._id.toString(),
            title: title,
            meta_description: metaDescription || "",
            tag: Array.isArray(tags) ? tags.join(" ") : tags || "",
          };

          const response = await fetch(`${pythonServiceUrl}/store`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          console.log("Vector API response:", data);

        } catch (apiError) {

          console.error("Vector API error:", apiError);

        }
      }

      return res.status(201).json({
        success: true,
        message: "Post created successfully!",
      });

    } catch (error) {

      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map(
          (err) => err.message
        );

        return res.status(400).json({
          success: false,
          errors: messages,
        });
      }

      console.error("Post creation error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error while creating post.",
      });
    }
  }
);

export default createPost_router;
