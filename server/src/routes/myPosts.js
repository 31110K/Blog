import express from 'express';
import Users from '../models/user.js';
import Posts from '../models/post.js';
import { protectRoute } from '../middlewares/auth_middleware.js';

const myPosts_router = express.Router();
const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

myPosts_router.post('/myPosts', protectRoute, async (req, res) => {
  const { userId } = req.body;

  try {
    const posts = await Posts.find({ author: userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
});

myPosts_router.delete('/deletePost/:postId', protectRoute, async (req, res) => {
  try {
    const postId = req.params.postId;
    const output = await Posts.findByIdAndDelete(postId);
    
    if (!output) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error while deleting post:", err);
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
});

myPosts_router.get('/getPost/:postId', protectRoute, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Posts.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found", data: null });
    }

    return res.status(200).json({ success: true, message: "Post fetched successfully", data: post });
  } catch (err) {
    console.error("Error while fetching post in server from database:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch post in server" });
  }
});


myPosts_router.put('/updatePost/:postId', protectRoute, async (req, res) => {
  try {
    const { postId } = req.params;
    const updateData = req.body;

    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Update post fields
    Object.keys(updateData).forEach(key => {
      post[key] = updateData[key];
    });

    const updatedPost = await post.save();

    // Re-index published post after edits for recommendation search.
    if (updatedPost.status === "publish") {
      try {
        const title = updatedPost.title || "";
        const tagsText = Array.isArray(updatedPost.tags) ? updatedPost.tags.join(" ") : "";
        const categoriesText = Array.isArray(updatedPost.categories) ? updatedPost.categories.join(" ") : "";
        const weightedMetaDescription = `
          ${updatedPost.metaDescription || ""}
          ${title} ${title}
          ${categoriesText}
        `.trim();
        const weightedTag = `${tagsText} ${categoriesText}`.trim();

        const payload = {
          post_id: updatedPost._id.toString(),
          title,
          meta_description: weightedMetaDescription,
          tag: weightedTag,
        };

        const vectorRes = await fetch(`${pythonServiceUrl}/store`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const vectorData = await vectorRes.json();
        console.log("Vector API (edit) response:", vectorData);
      } catch (vectorError) {
        console.error("Vector API (edit) error:", vectorError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    console.error('Error updating post:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});





export default myPosts_router;
