import React, { useState } from 'react';
import './cssfile/recentPosts.css';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
const RecentPosts = ({ posts }) => {

  const { authUser } = useAuthStore();
  const [hoveredPost, setHoveredPost] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="lp-recentPosts">
        <div className="lp-noPostsMessage">
          <p>No recent posts available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-recentPosts">
      <div className="lp-postsContainer">
        {posts.map((post, index) => {
          const hasImage = post.featuredImage?.url;
          return (
            <Link key={post._id || index} to={authUser ? `/viewPost/${post.slug}` : "/login"} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>
              <div
                className={`lp-postItem ${hoveredPost === post._id ? 'hover' : ''}`}
                onMouseEnter={() => setHoveredPost(post._id)}
                onMouseLeave={() => setHoveredPost(null)}
              >
                
                <div
                  className={`lp-postImage ${!hasImage ? 'lp-placeholderImage' : ''}`}
                  style={hasImage ? { backgroundImage: `url(${post.featuredImage.url})` } : {}}
                >
                  {!hasImage && 'IMG'}
                </div>
                <div className="lp-postContent">
                  <h3 className="lp-postTitle">{post.title || 'Untitled Post'}</h3>
                  <div className="lp-postMeta">{formatDate(post.createdAt)}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
    </div>
    
  );
};

export default RecentPosts;
