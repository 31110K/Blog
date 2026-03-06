import express from 'express';
import Post from '../models/post.js';
import Users from '../models/user.js';
import { protectRoute } from '../middlewares/auth_middleware.js';

const home_router = express.Router();
const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

const isValidObjectIdString = (value) => /^[a-fA-F0-9]{24}$/.test(String(value));

home_router.get('/latestPosts', protectRoute, async (req, res) => {
    try {
        const homePostFilter = { status: 'publish' };

        // Latest posts for homepage
        const latestPosts = await Post.find(homePostFilter)
            .sort({ createdAt: -1 })
            .limit(7)
            .populate('author', 'name profilePic email');

        let recommendedPosts = [];

        console.log("[DEBUG] Logged user:", req.user);

        if (req.user) {

            const user = await Users.findById(req.user._id);

            const recentPostIds = user?.recent_viewed_posts || [];

            if (recentPostIds.length > 0) {

                const posts = await Post.find({
                    _id: { $in: recentPostIds },
                    ...homePostFilter
                });

                // -------- BUILD WEIGHTED INTEREST TEXT --------
                let interestText = "";

                posts.forEach(post => {

                    const title = post.title || "";
                    const tags = (post.tags || []).join(" ");
                    const categories = (post.categories || []).join(" ");

                    interestText += `
                        ${title} ${title} ${title}
                        ${tags} ${tags}
                        ${categories}
                    `;
                });

                try {
                    const response = await fetch(`${pythonServiceUrl}/recommend`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            interest_text: interestText
                        })
                    });

                    if (!response.ok) {
                        console.warn("Recommendation API returned non-OK:", response.status);
                    } else {
                        const data = await response.json();
                        const recommendedIds = (data.recommendations || [])
                            .filter((id) => isValidObjectIdString(id));

                        if (recommendedIds.length > 0) {
                            recommendedPosts = await Post.find({
                                _id: { $in: recommendedIds },
                                ...homePostFilter
                            })
                                .limit(6)
                                .populate('author', 'name profilePic email');
                        }
                    }
                } catch (recommendationError) {
                    console.error("Recommendation fetch error:", recommendationError);
                }
            }
        }

        res.json({
            success: true,
            latestPosts,
            recommendedPosts
        });

    } catch (error) {

        console.error("Latest posts error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

home_router.get('/randomPosts', async (req, res) => {
    try {
        const requestedLimit = Number.parseInt(req.query.limit, 10);
        const sampleSize = Number.isFinite(requestedLimit)
            ? Math.max(1, Math.min(requestedLimit, 70))
            : 9;

        // Fetch random published posts
        const randomPosts = await Post.aggregate([
            { $match: { status: 'publish' } },
            { $sample: { size: sampleSize } }
        ]);
        // Populate author for each post manually since .populate() does not work on aggregate
        const populatedRandomPosts = await Post.populate(randomPosts, { path: 'author', select: 'name profilePic email' });
        res.status(200).json({
            success: true,
            randomPosts: populatedRandomPosts,
        });
    } catch (error) {
        console.error("Error fetching home random post data:", error);
        res.status(500).json({ success: false, message: "Server error while fetching home random posts data." });
    }
});

home_router.get('/categoryPosts', async (req, res) => {
    try {
        const categories = await Post.distinct('categories', { status: 'publish' });
        const categoryPosts = await Promise.all(
            categories.map(async (category) => {
                const posts = await Post.aggregate([
                    { $match: { status: 'publish', categories: category } },
                    { $sample: { size: 6 } }
                ]);

                const populatedPosts = await Post.populate(posts, {
                    path: 'author',
                    select: 'name profilePic email'
                });

                return {
                    category,
                    posts: populatedPosts
                };
            })
        );

        res.status(200).json({
            success: true,
            categoryPosts,
        });
    } catch (error) {
        console.error("Error fetching home category post data:", error);
        res.status(500).json({ success: false, message: "Server error while fetching home categories posts data." });
    }
}); 

home_router.get('/authors', async (req, res) => {
    try {
        const authors = await Users.find({ user_type: 'host' }, 'name profilePic email bio').limit(10);
        res.status(200).json({
            success: true,
            authors,
        });
    } catch (error) {
        console.error("Error fetching authors:", error);
        res.status(500).json({ success: false, message: "Server error while fetching authors." });
    }
});

export default home_router;


