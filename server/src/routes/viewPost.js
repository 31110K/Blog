import express from 'express';
import Post from '../models/post.js';
import Users from '../models/user.js';
const viewPost_router = express.Router();



viewPost_router.get('/viewPost/:postSlug', async (req, res) => {
    console.log("Received request to view post");
    const { postSlug } = req.params;
    console.log("Fetching post with slug:", postSlug);

    try {
        const post = await Post.findOne({ slug: postSlug });
        console.log("Post found:", post);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        post.views = (post.views || 0) + 1;
        await post.save();

        const postAuthor = await Users.findById(post.author);
        // Prepare a clean response object

        const similarPosts = await Post.find({
            _id: { $ne: post._id }, 
            categories: { $in: post.categories }, 
        }).limit(5); 

        const similarPostsData = similarPosts.map(similarPost => ({
            title: similarPost.title,
            featuredImageurl: similarPost.featuredImage.url,
            createdAt : similarPost.createdAt,
            slug: similarPost.slug,
        }));

        const responsePost = {
            ...post.toObject(),
            authorName: postAuthor?.name || '',
            authorProfilePic: postAuthor?.profilePic || '',
            authorEmail: postAuthor?.email || '',
            similarPosts: similarPostsData,
        };
        // Remove sensitive or auth fields if present
        delete responsePost.password;
        delete responsePost.__v;
        delete responsePost.author;

        res.status(200).json({ success: true, data: responsePost });
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ success: false, message: "Failed to fetch post" });
    }
});


viewPost_router.post('/viewPost/:postSlug/comment', async (req, res) => {

    const { name ,email , comment } = req.body;
    const { postSlug } = req.params;
    console.log( name, email , comment, postSlug);

    const commentData = {
        commenter_name:name,
        commenter_email:email,
        comment
    };

    try {
        const post = await Post.findOneAndUpdate({ slug: postSlug },
            { $push: { comments: commentData } },
            { new: true, runValidators: true }
        );

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        res.status(200).json({ success: true, message: "Comment added successfully", data: post });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ success: false, message: "Failed to add comment from server side" });
    }
            
})

viewPost_router.get('/viewPost/:postSlug/comment', async (req, res) => {

    const { postSlug } = req.params;
    console.log("Fetching comments for post with slug:", postSlug);

    try {
        const post = await Post.findOne({ slug: postSlug }, 'comments');
        console.log("Post found:", post);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.status(200).json({ success: true, data: post.comments });
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ success: false, message: "Failed to fetch comments" });
    }   

})


export default viewPost_router;
