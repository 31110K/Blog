import React, { useState } from 'react';
import './cssfile/categoriesPosts.css';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
const CategoriesPosts = ({ cat_posts }) => {

  const { authUser } = useAuthStore();
    
  const postsData = cat_posts || [];
  // State for active category
  const [activeCategory, setActiveCategory] = useState('Travel');
  const activeCategoryObj = postsData.find(obj => obj.category === activeCategory);
  const activePosts = activeCategoryObj ? activeCategoryObj.posts : [];
  const featuredPost = activePosts[0];
  const sidebarPosts = activePosts.slice(1, 5); // Next 4 posts

  const categories = [ 'Food' , 'Busiiness' , 'Travel', 'Lifestyle' , 'ArtDesign' , 'Technology'];

  if (!postsData || Object.keys(postsData).length === 0) {
    return (
      <div className="categories-posts-container">
        <div className="categories-posts-no-posts-message">
          No posts available in any category.
        </div>
      </div>
    );
  }

  return (
    <div className="categories-posts-container">
      
      <nav className="categories-posts-nav">
        <div className="categories-posts-nav-container">
          <div className="categories-posts-nav-buttons">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={
                  activeCategory === category 
                    ? "categories-posts-nav-button-active" 
                    : "categories-posts-nav-button"
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="categories-posts-main-container">
        {!featuredPost ? (
          <div className="categories-posts-no-posts-message">
            No posts available in {activeCategory} category.
          </div>
        ) : (

          <div className="categories-posts-grid-container">
            <Link to={authUser ? `/viewPost/${featuredPost.slug}` : "/login"} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>

            {/* Featured Post */}
            <div className="categories-posts-featured-post-container">
              {/* Featured Image with Stylized Avatar Overlay */}
              <div className="categories-posts-featured-image-container">
                <img 
                  src={featuredPost.featuredImage?.url} 
                  alt={featuredPost.featuredImage?.credit}
                  className="categories-posts-featured-image"
                />
              </div>
              
              <div className="categories-posts-featured-content">
                <h1 className="categories-posts-featured-title">
                  {featuredPost.title}
                </h1>
                
                <div className="categories-posts-featured-meta">
                  <span>by {featuredPost.author?.name || 'Unknown'}</span>
                  <span>|</span>
                  <span>{featuredPost.createdAt}</span>
                  <span>|</span>
                  <span>{featuredPost.views} 💬</span>
                </div>
              </div>
            </div>
            </Link>

            {/* Sidebar Posts */}
            <div className="categories-posts-sidebar">
              {sidebarPosts.length === 0 ? (
                <div className="categories-posts-no-posts-message">
                  No additional posts in this category.
                </div>
              ) : (
                sidebarPosts.map((post, index) => (
                  <div 
                    key={index} 
                    className="categories-posts-sidebar-post"
                  >
                    <Link to={`/viewPost/${post.slug}`} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>

                    <div className="categories-posts-sidebar-post-content">
                      <div className="categories-posts-sidebar-image">
                        <img 
                          src={post.featuredImage?.url} 
                          alt={post.featuredImage?.credit || 'Post Image'}
                          className="categories-posts-sidebar-image-img"
                        />
                      </div>
                      
                      <div className="categories-posts-sidebar-text-content">
                        <h3 className="categories-posts-sidebar-title">
                          {post.title}
                        </h3>
                        
                        <div className="categories-posts-sidebar-meta">
                          <span>by {post.author?.name || 'Unknown'}</span>
                          <span>|</span>
                          <span>{post.updatedAt}</span>
                          <span>|</span>
                          <span className="categories-posts-category-tag">{activeCategory}</span>
                        </div>
                        <span>{post.views} 💬</span>
                      </div>
                    </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPosts;