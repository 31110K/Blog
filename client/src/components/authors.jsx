import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./cssfile/authors.css";

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/home/authors", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to fetch authors");
        setAuthors(data.authors);
      } catch (err) {
        console.error("Error fetching authors:", err);
      }
    };
    fetchAuthors();
  }, []);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [authors]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = 220; // Card width + gap
      const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time
      
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleImageError = (e) => {
    // Fallback image or placeholder
    e.target.src = 'https://via.placeholder.com/200x250/f0f0f0/999999?text=No+Image';
  };

  const handleImageLoad = (e) => {
    // Ensure image maintains aspect ratio
    e.target.style.opacity = '1';
  };

  return (
    <div className="authors-wrapper">
      <div className="authors-header">
        <h2>Famous Authors</h2>
        <div className="scroll-controls">
          <button 
            onClick={() => scroll("left")} 
            className={`scroll-btn ${!canScrollLeft ? 'disabled' : ''}`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll("right")} 
            className={`scroll-btn ${!canScrollRight ? 'disabled' : ''}`}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="authors-scroll" ref={scrollRef}>
        {authors.slice(0, 10).map((author) => (
          <div className="author-card" key={author._id}>
            <div className="author-image-container">
              <img 
                src={author.profilePic} 
                alt={author.name}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
              />
            </div>
            <div className="author-info">
              <h3>{author.name}</h3>
              <p className="author-bio">{author.bio}</p>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};

export default Authors;