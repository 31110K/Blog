import express from 'express';
import Users from '../models/user.js';
import Posts from '../models/post.js';
import { protectRoute } from '../middlewares/auth_middleware.js';

const myPosts_router = express.Router();

myPosts_router.post('/myPosts', protectRoute, async (req, res) => {
  const { userId } = req.body;

  try {
    const posts = await Posts.find({ author: userId });
    console.log(posts);
    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
});

export default myPosts_router;
