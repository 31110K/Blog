import { Link } from 'react-router-dom';
import './cssfile/randomPosts.css';
import { useAuthStore } from '../store/useAuthStore';

const RandomPosts = ({ posts }) => {

    const { authUser } = useAuthStore();

  const categoryStyles = {
    'ARTDESIGN': 'rp-artDesignTag',
    'BUSSINESS': 'rp-natureTag',
    'TRAVEL': 'rp-travelTag',
    'LIFESTYLE': 'rp-friendsTag',
    'FOOD': 'rp-peopleTag',
    'TECHNOLOGY': 'rp-techTag'
  };

  const getCategoryClass = (category) => {
    const upper = category?.toUpperCase();
    return categoryStyles[upper] || 'rp-artDesignTag';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  };

  const renderPostCard = (post, index, size = 'small') => {
    const cardKey = `${post._id}-${index}`;
    const isLarge = size === 'large';
    const hasImage = post.featuredImage;

    return (
        
      <div
        key={cardKey}
        className={`rp-postCard ${isLarge ? 'large' : 'small'}`}
      >
        <Link to={authUser ? `/viewPost/${post.slug}` : "/login"} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>
          <div
            className={`rp-postImage ${isLarge ? 'large' : 'small'} ${!hasImage ? 'placeholder' : ''}`}
            style={hasImage ? { backgroundImage: `url(${post.featuredImage.url})` } : {}}
          >
            {!hasImage && 'Image Placeholder'}
          </div>

          <div className={`rp-postContent ${isLarge ? 'large' : 'small'}`}>
            <div className={`rp-categoryTag ${getCategoryClass(post.categories?.[0])}`}>
              {(post.categories && post.categories[0]?.toUpperCase()) || 'ART & DESIGN'}
            </div>

            <h3 className={`rp-postTitle ${isLarge ? 'large' : 'small'}`}>
              {post.title || 'Untitled Post'}
            </h3>

            <p className={`rp-postExcerpt ${isLarge ? 'large' : 'small'}`}>
              {post.excerpt?.slice(0, isLarge ? 200 : 130) || 'No content available.'}...
            </p>

            <div className="rp-postMeta">
              <span className="rp-authorName">{post.author.name || 'xyz'}</span>
              <span>|</span>
              <span className="rp-postDate">{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </Link>
      </div>
      
    );
  };

  if (!posts || posts.length === 0) {
    return <div className="rp-randomPosts noPosts">No random posts available.</div>;
  }

  return (
    <div className="rp-randomPosts">
      <div className="rp-postsContainer">
        <div className="rp-firstRow">
          {posts.slice(0, 3).map((post, idx) => renderPostCard(post, idx, 'small'))}
        </div>
        <div className="rp-secondRow">
          {posts.slice(3, 5).map((post, idx) => renderPostCard(post, idx + 3, 'large'))}
        </div>
        <div className="rp-thirdRow">
          {posts.slice(5, 9).map((post, idx) => renderPostCard(post, idx + 5, 'small'))}
        </div>
      </div>
    </div>
    
  );
};

export default RandomPosts;
