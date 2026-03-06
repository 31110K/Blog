import express from "express";
import Post from "../models/post.js";
import Users from "../models/user.js";
import { protectRoute } from "../middlewares/auth_middleware.js";

const viewPost_router = express.Router();
const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

const isValidObjectIdString = (value) => /^[a-fA-F0-9]{24}$/.test(String(value));

// =======================
// GET SINGLE POST
// =======================
viewPost_router.get(
  "/viewPost/:postSlug",
  protectRoute, // ✅ ADDED (this fixes req.user issue)
  async (req, res) => {
    const { postSlug } = req.params;

    try {
      const post = await Post.findOne({ slug: postSlug });

      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      await Post.findByIdAndUpdate(post._id, {
        $inc: { views: 1 },
      });

      if (req.user) {
        await Users.findByIdAndUpdate(req.user._id, {
          $pull: { recent_viewed_posts: post._id },
        });

        await Users.findByIdAndUpdate(req.user._id, {
          $push: {
            recent_viewed_posts: {
              $each: [post._id],
              $slice: -5,
            },
          },
        });
      }
      const postAuthor = await Users.findById(post.author);

      const similarPosts = await Post.find({
        _id: { $ne: post._id },
        categories: { $in: post.categories },
      }).limit(5);

      const similarPostsData = similarPosts.map((similarPost) => ({
        title: similarPost.title,
        featuredImageurl: similarPost.featuredImage?.url,
        createdAt: similarPost.createdAt,
        slug: similarPost.slug,
      }));

      const responsePost = {
        ...post.toObject(),
        authorName: postAuthor?.name || "",
        authorProfilePic: postAuthor?.profilePic || "",
        authorEmail: postAuthor?.email || "",
        similarPosts: similarPostsData,
      };

      delete responsePost.password;
      delete responsePost.__v;
      delete responsePost.author;

      res.status(200).json({ success: true, data: responsePost });
    } catch (err) {
      console.error("Error fetching post:", err);
      res.status(500).json({ success: false, message: "Failed to fetch post" });
    }
  },
);

// =======================
// ADD COMMENT
// =======================
viewPost_router.post("/viewPost/:postSlug/comment", async (req, res) => {
  const { name, email, comment } = req.body;
  const { postSlug } = req.params;

  const commentData = {
    commenter_name: name,
    commenter_email: email,
    comment,
  };

  try {
    const post = await Post.findOneAndUpdate(
      { slug: postSlug },
      { $push: { comments: commentData } },
      { new: true, runValidators: true },
    );

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: post,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add comment from server side",
    });
  }
});

// =======================
// GET COMMENTS
// =======================
viewPost_router.get("/viewPost/:postSlug/comment", async (req, res) => {
  const { postSlug } = req.params;

  try {
    const post = await Post.findOne({ slug: postSlug }, "comments");

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, data: post.comments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch comments" });
  }
});

//----------------------
// GET SIMILAR POSTS
//----------------------
viewPost_router.get("/viewPost/:postSlug/similarPosts", async (req, res) => {
  const { postSlug } = req.params;

  try {
    const post = await Post.findOne({ slug: postSlug });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    let interestText =
      post.title + " " + post.tags.join(" ") + " " + post.categories.join(" ");

    let similarPosts = [];

    try {
      const response = await fetch(`${pythonServiceUrl}/similarPosts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interest_text: interestText,
        }),
      });

      if (!response.ok) {
        console.warn("Similar posts API returned non-OK:", response.status);
      } else {
        const data = await response.json();
        const similarPostsIds = (data.similar_posts_ids || []).filter((id) =>
          isValidObjectIdString(id),
        );

        if (similarPostsIds.length > 0) {
          similarPosts = await Post.find({
            _id: { $in: similarPostsIds },
            slug: { $ne: postSlug },
          })
            .select("title slug featuredImage tags createdAt")
            .populate("author", "name profilePic email")
            .limit(6);
        }
      }
    } catch (similarApiError) {
      console.error("Similar posts API error:", similarApiError);
    }

    if (similarPosts.length === 0) {
      similarPosts = await Post.find({
        _id: { $ne: post._id },
        categories: { $in: post.categories || [] },
        status: "publish",
      })
        .sort({ createdAt: -1 })
        .select("title slug featuredImage tags createdAt")
        .populate("author", "name profilePic email")
        .limit(6);
    }

    res.status(200).json({ success: true, data: similarPosts });
  } catch (err) {
    console.error("Error fetching similar posts:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch similar posts" });
  }
});

export default viewPost_router;
