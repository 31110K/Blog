import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { Calendar, User, Eye, Tag, ExternalLink } from 'lucide-react';
import './cssfile/myPosts.css';

const MyPosts = () => {
  const { authUser } = useAuthStore();
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/host/myPosts", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
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
    };

    if (authUser?._id) fetchMyPosts();
  }, [authUser]);

  // Generate gradient class names for cards
  const gradients = [
    'gradient-1',
    'gradient-2', 
    'gradient-3',
    'gradient-4',
    'gradient-5',
    'gradient-6'
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'status-published';
      case 'draft': return 'status-draft';
      case 'scheduled': return 'status-scheduled';
      default: return 'status-default';
    }
  };

  return (
    <div className="posts-container">
      <div className="posts-wrapper">
        <div className="posts-header">
          <h1 className="posts-title">My Posts</h1>
          <p className="posts-subtitle">Manage and view all your published content</p>
        </div>

        {myPosts.length > 0 ? (
          <div className="posts-grid">
            {myPosts.map((post, index) => (
              <div key={post._id} className="post-card">
                {/* Header with gradient background */}
                <div className={`post-header ${gradients[index % gradients.length]}`}>
                  <div className="post-header-overlay"></div>
                  <div className={`post-status ${getStatusClass(post.status)}`}>
                    {post.status || 'Draft'}
                  </div>
                  {post.featuredImage && (
                    <div className="external-link-icon">
                      <ExternalLink />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="post-content">
                  <div className="post-main">
                    <h3 className="post-title">
                      {post.title || 'Untitled Post'}
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
                          <span className="category-more">+{post.categories.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="post-excerpt">
                        {post.excerpt}
                      </p>
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
                        <span>{post.author?.slice(0, 8)}...</span>
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
                        <span>Scheduled: {formatDate(post.scheduledPublish)}</span>
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
                          <span className="tag-more">+{post.tags.length - 3}</span>
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
            <p className="empty-state-description">Start creating your first post to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;