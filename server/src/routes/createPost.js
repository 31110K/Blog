import express from 'express';
import Post from '../models/post.js';
import{ protectRoute } from '../middlewares/auth_middleware.js' 
import mongoose from 'mongoose';
const createPost_router = express.Router();

createPost_router.post('/createPost', protectRoute, async (req, res) => {
    try {
      const {
        author, title, content, excerpt,
        featuredImageUrl, featuredImageCredit,
        categories, tags, status, publishedAt,
        scheduledPublish, visibility,
        metaTitle, metaDescription, isCommentable
      } = req.body;

      console.log("abcd",tags);
  
      const post = new Post({
        author,
        title,
        content,
        excerpt,
        featuredImage: {
          url: featuredImageUrl,
          credit: featuredImageCredit
        },
        categories,
        tags,
        status,
        publishedAt,
        scheduledPublish,
        visibility,
        metaTitle,
        metaDescription,
        isCommentable
      });
  
      await post.save();
  
      return res.status(201).json({ success: true, message: 'Post created successfully!' });
  
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        // Extract messages from all fields
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ success: false, errors: messages });
      }
  
      console.error("Post creation error:", error);
      return res.status(500).json({ success: false, message: "Server error while creating post." });
    }
  });


export default createPost_router;