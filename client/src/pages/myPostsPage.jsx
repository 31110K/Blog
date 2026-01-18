import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Calendar, User, Eye, Tag, ExternalLink, PanelBottomOpen } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ToastContainer , toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./cssfile/myPosts.css";


const MyPosts = () => {
  const { authUser } = useAuthStore();
  const [myPosts, setMyPosts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    const fetchMyPosts = async () => {
      try {
        const res = await fetch("https://blogging-82kn.onrender.com/api/host/myPosts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userId: authUser?._id }),
        });

        const result = await res.json();
        console.log(result);

        if (result.success) {
          setMyPosts(result.posts);
        }
      } catch (error) {
        console.error("Error while fetching posts from server", error);
      }
      finally{
        setIsLoading(false);
      }
    };

    if (authUser?._id) fetchMyPosts();
  }, [authUser]);

  

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "status-published";
      case "draft":
        return "status-draft";
      case "scheduled":
        return "status-scheduled";
      default:
        return "status-default";
    }
  };

  const navigate = useNavigate();
  const editHandler = (postId) => {
    navigate(`/editPost/${postId}`);
  };

  const viewPost = (postSlug) => {
    if (!postSlug) {
      toast.error("you cannot view draft post");
      return;
    }
    navigate(`/viewPost/${postSlug}`);
  };

  const deleteHandler = async (postId) => {
    setIsDeleting(true);

    try {
      const res = await fetch(
        `https://blogging-82kn.onrender.com/api/host/deletePost/${postId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await res.json();
      console.log("response:", result);

      if (result.success) {
        setMyPosts((prev) => prev.filter((post) => post._id !== postId));
        toast.success("Post successfully deleted");
      } else {
        toast.error("Problem deleting post, try again later");
      }
    } catch (error) {
      console.error("Server error while deleting", error);
      toast.error("Server error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
  return (
    <div className="loading-container">
    <div className="loading-spinner"></div>
    <div className="loading-text">Loading your posts...</div>
    </div>
  );
  }
  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
    <div className="posts-container">
      <div className="posts-wrapper">
        <div className="posts-header">
          <h1 className="posts-title">My Posts</h1>
          <p className="posts-subtitle">
            Manage and view all your published content
          </p>
        </div>

        {myPosts.length > 0 ? (
          <div className="posts-grid">
            {myPosts.map((post, index) => (
              <div key={post._id} className="post-card">
                <div
                  className={`post-header`}
                >
                  <div className="post-header-overlay"></div>
                  {post.featuredImage?.url && (
                    <img
                      src={post.featuredImage.url}
                      alt="Featured"
                      className="post-featured-image"
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                    />
                  )}
                  <div className={`post-status ${getStatusClass(post.status)}`}>
                    {post.status || "Draft"}
                  </div>
                  {post.featuredImage && (
                    <div className="external-link-icon">
                     <a href={post.featuredImage.url}><ExternalLink /></a> 
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="post-content">
                  <div className="post-main">
                    <h3 className="post-title">
                      {post.title || "Untitled Post"}
                    </h3>

                    {/* Categories */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="categories-container">
                        {post.categories.slice(0, 3).map((category, idx) => (
                          <span key={idx} className="category-tag">
                            <Tag />
                            {category}
                          </span>
                        ))}
                        {post.categories.length > 3 && (
                          <span className="category-more">
                            +{post.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="post-excerpt">{post.excerpt}</p>
                    )}

                    {/* Meta Description */}
                    {post.metaDescription && (
                      <p className="post-meta-description">
                        {post.metaDescription}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="post-footer">
                    <div className="post-meta-row">
                      <div className="meta-item">
                        <User />
                        <span>{authUser.name.slice(0, 10)}...</span>
                      </div>
                      <div className="meta-item">
                        <Eye />
                        <span>{post.views || 0}</span>
                      </div>
                    </div>

                    <div className="post-meta-row">
                      <div className="meta-item">
                        <Calendar />
                        <span>Created: {formatDate(post.createdAt)}</span>
                      </div>
                    </div>

                    {post.scheduledPublish && (
                      <div className="scheduled-info">
                        <Calendar />
                        <span>
                          Scheduled: {formatDate(post.scheduledPublish)}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="tags-container">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="tag-item">
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="tag-more">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Visibility indicator */}
                    {post.visibility && (
                      <div className="visibility-info">
                        Visibility: {post.visibility}
                      </div>
                    )}
                  </div>
                  <button className="edit-btn" onClick={() => editHandler(post._id)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => deleteHandler(post._id)}>
                    {isDeleting ? <div className="upload-spinner"></div> : "Delete"}
                  </button>
                  {post.status !== "draft" && post.slug && (<button className="view-btn" onClick={() => viewPost(post.slug)}>
                    <PanelBottomOpen/><span>View Post</span>
                  </button> )}
                  
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Tag />
            </div>
            <h3 className="empty-state-title">No posts found</h3>
            <p className="empty-state-description">
              Start creating your first post to see it here.
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default MyPosts;
