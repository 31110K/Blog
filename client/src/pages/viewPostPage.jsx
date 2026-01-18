import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./cssfile/viewPost.css";
import { ExternalLink } from "lucide-react";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

const ViewPost = () => {
  const { postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false); // New state for toggling comments

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://blogging-82kn.onrender.com/api/viewPost/${postSlug}`);
      const result = await res.json();

      // Debug: Log the entire response
      console.log("API Response:", result);
      console.log("Comments data:", result.data?.comments);
      setComments(result.data?.comments || []);

      if (result.success) setPost(result.data);
      else setPost(null);
    } catch (err) {
      console.error("Error fetching post:", err);
      setPost(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (postSlug) fetchPost();
  }, [postSlug]);

  const saveComment = async (e) => {
    e.preventDefault();
    if (!name || !email || !comment) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const res = await fetch(
        `https://blogging-82kn.onrender.com/api/viewPost/${postSlug}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, comment }),
          credentials: "include",
        }
      );

      const result = await res.json();
      if (result.success) {
        toast.success("Comment saved successfully!");
        setName("");
        setEmail("");
        setComment("");
        setComments((prevComments) => [
          ...prevComments,
          {
            commenter_name: name,
            commenter_email: email,
            comment: comment,
          },
        ]);
      } else {
        toast.error("Failed to save comment. try again!");
      }
    } catch (err) {
      console.error("Error saving comment:", err);
      toast.error("An error occurred while saving your comment.");
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <>
      <ToastContainer position="top" autoClose={1000} />
      <div className="vp-post-wrapper-flex">
        <div className="vp-post-wrapper">
          {post.featuredImage?.url && (
            <div
              className="vp-parallax-bg"
              style={{
                backgroundImage: `url(${post.featuredImage?.url})`,
                backgroundAttachment: "fixed",
                backgroundPosition: "center center",
                backgroundSize: "cover",
                minHeight: "320px",
                width: "100%",
              }}
            >
              <div className="vp-bg-overlay"></div>
            </div>
          )}

          <div
            className="vp-parallax-space"
            style={{
              backgroundImage: `url(${post.featuredImage?.url})`,
              backgroundAttachment: "fixed",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              minHeight: "320px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <a href="post.featuredImageUrl">
            <ExternalLink className="vp-external-link" />
          </a>

          <article className="vp-post-content">
            <h1 className="vp-post-title">{post.title}</h1>
            <p className="vp-post-excerpt">{post.excerpt}</p>

            <div className="vp-post-meta">
              <span>
                <strong>Published:</strong> {formatDate(post.publishedAt)}
              </span>
              <span>
                <strong>Views:</strong> {post.views}
              </span>
            </div>

            <div className="vp-post-tags">
              {post.tags?.map((tag, i) => (
                <span key={i} className="vp-tag">
                  {tag}
                </span>
              ))}
            </div>

            <div
              className="vp-post-html"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <footer className="vp-author-footer">
              <div className="vp-author-info">
                <img
                  src={
                    post.authorProfilePic || "https://via.placeholder.com/70"
                  }
                  alt={post.authorName}
                  className="vp-author-img"
                />
                <div>
                  <p className="vp-author-name">{post.authorName}</p>
                  <p className="vp-author-email">{post.authorEmail}</p>
                </div>
              </div>
            </footer>

            {post.isCommentable && (
              <>
                <div className="vp-comment-section">
                  <h2>Leave a Comment</h2>
                  <form onSubmit={saveComment}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <textarea
                      rows="3"
                      placeholder="Your Comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    <button type="submit">Post Comment</button>
                  </form>
                </div>

                <div className="vp-comment-list">
                  <h3 className="comment-vp-heading">
                    Comments
                    {Array.isArray(comments) ? ` (${comments.length})` : ""}
                  </h3>
                  {Array.isArray(comments) && comments.length > 0 ? (
                    <>
                      {(showAllComments
                        ? comments.slice().reverse()
                        : comments.slice(-5).reverse()
                      ).map((comment, idx) => (
                        <div key={idx} className="vp-comment-item-box">
                          <div className="vp-comment-header">
                            <span className="vp-commenter-name">
                              {comment.commenter_name}
                            </span>
                            <span className="vp-commenter-email">
                              ({comment.commenter_email})
                            </span>
                            <span className="vp-comment-date">
                              {comment.commentedAt
                                ? new Date(
                                    comment.commentedAt
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : ""}
                            </span>
                          </div>
                          <div className="vp-comment-text">
                            {comment.comment}
                          </div>
                        </div>
                      ))}
                      {comments.length > 5 && !showAllComments && (
                        <button
                          className="vp-show-more-comments"
                          onClick={() => setShowAllComments(true)}
                        >
                          Show More
                        </button>
                      )}
                      {comments.length > 5 && showAllComments && (
                        <button
                          className="vp-show-more-comments"
                          onClick={() => setShowAllComments(false)}
                        >
                          Show Less
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="vp-no-comments">No comments yet.</p>
                  )}
                </div>
              </>
            )}
          </article>
        </div>

        {/* Right: Similar Posts */}
        <aside className="vp-similar-posts">
          <div>
            <h3>Similar Posts</h3>
            {1 == 2 ? (
              post.similarPosts.map((item, idx) => (
                <a
                  key={idx}
                  href={`/view/${item.slug}`}
                  className="vp-similar-item-anchor"
                >
                  <div className="vp-similar-item">
                    <div className="vp-similar-img-wrap">
                      <img
                        src={
                          item.featuredImageurl ||
                          "https://via.placeholder.com/80x60?text=No+Image"
                        }
                        alt={item.title}
                        className="vp-similar-img"
                      />
                    </div>
                    <div className="vp-similar-info">
                      <h4 className="vp-similar-title">{item.title}</h4>
                      <p className="vp-similar-date">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p>No similar posts available.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default ViewPost;
