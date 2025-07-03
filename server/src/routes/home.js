import express from 'express';
import Post from '../models/post.js';
import Users from '../models/user.js';

const home_router = express.Router();

home_router.get('/latestPosts', async (req, res) => {
    console.log("Received request to fetch latest posts");
    try {
        // Fetch the latest 7 posts
        const latestPosts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(7)
            .populate('author', 'name profilePic email');

            console.log("Latest Posts:", latestPosts);
        res.status(200).json({
            success: true,
            latestPosts,
        });
    } catch (error) {
        console.error("Error fetching home latest post data:", error);
        res.status(500).json({ success: false, message: "Server error while fetching home latest posts data." });
    }
});

home_router.get('/randomPosts', async (req, res) => {
    try {
        // Fetch 9 random posts
        const randomPosts = await Post.aggregate([{ $sample: { size: 9 } }]);
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
        // Fetch posts grouped by categories
        const categoryPosts = await Post.aggregate([
            { $unwind: '$categories' },
            { $group: { _id: '$categories', posts: { $push: '$$ROOT' } } },
            { $project: { _id: 0, category: '$_id', posts: { $slice: ['$posts', 6] } } }
        ]);
        // Populate author for each post in each category
        for (const category of categoryPosts) {
            category.posts = await Post.populate(category.posts, { path: 'author', select: 'name profilePic email' });
        }
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


