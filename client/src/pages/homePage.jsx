import { useEffect, useState } from 'react';
import RandomPosts from '../components/randomPosts.jsx';
import RecentPosts from '../components/recentPosts.jsx';
import CategoriesPosts from '../components/categoriesPosts.jsx';
// import { loginPart } from '../components/loginPart.jsx';
import Footer from '../components/footer.jsx';
import './cssfile/home.css';

const Home = () => {
  const RANDOM_PAGE_SIZE = 9;
  const RANDOM_FETCH_LIMIT = 70;
  const [latestPosts, setLatestPosts] = useState([]);
  const [randomPosts, setRandomPosts] = useState([]);
  const [randomPage, setRandomPage] = useState(1);
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [isLatestLoading, setIsLatestLoading] = useState(true);
  const [isRandomLoading, setIsRandomLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching home data...");

      const fetchLatestPosts = async () => {
        try {
          const latestRes = await fetch('https://blogging-82kn.onrender.com/api/home/latestPosts', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          const latestData = await latestRes.json();
          if (!latestData.success) throw new Error('Failed to fetch latest posts');
          setLatestPosts(latestData.latestPosts);
        } catch (error) {
          console.error("Error fetching latest posts:", error);
        } finally {
          setIsLatestLoading(false);
        }
      };

      const fetchRandomPosts = async () => {
        try {
          const randomRes = await fetch(`https://blogging-82kn.onrender.com/api/home/randomPosts?limit=${RANDOM_FETCH_LIMIT}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          const randomData = await randomRes.json();
          if (!randomData.success) throw new Error('Failed to fetch random posts');
          setRandomPosts(randomData.randomPosts);
          setRandomPage(1);
        } catch (error) {
          console.error("Error fetching random posts:", error);
        } finally {
          setIsRandomLoading(false);
        }
      };

      const fetchCategoryPosts = async () => {
        try {
          const categoryRes = await fetch('https://blogging-82kn.onrender.com/api/home/categoryPosts', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          const categoryData = await categoryRes.json();
          if (!categoryData.success) throw new Error('Failed to fetch category posts');
          setCategoryPosts(categoryData.categoryPosts);
        } catch (error) {
          console.error("Error fetching category posts:", error);
        } finally {
          setIsCategoryLoading(false);
        }
      };

      await Promise.all([fetchLatestPosts(), fetchRandomPosts(), fetchCategoryPosts()]);
    };

    fetchData();
  }, []);

  const totalRandomPages = Math.ceil(randomPosts.length / RANDOM_PAGE_SIZE);
  const paginatedRandomPosts = randomPosts.slice(
    (randomPage - 1) * RANDOM_PAGE_SIZE,
    randomPage * RANDOM_PAGE_SIZE
  );

  return (
    <div className="home-root">
      <div className="home-flex-row">
        <section className="home-random-section">
          {isRandomLoading ? (
            <div className="home-loading-random">
              <div className="home-skeleton home-random-top-row"></div>
              <div className="home-skeleton home-random-main-row"></div>
              <div className="home-skeleton home-random-bottom-row"></div>
            </div>
          ) : (
            <div className="home-random-content">
              <RandomPosts posts={paginatedRandomPosts}/>
              {totalRandomPages > 1 && (
                <div className="home-random-pagination">
                  <button
                    type="button"
                    className="home-random-page-btn"
                    onClick={() => setRandomPage((prev) => Math.max(prev - 1, 1))}
                    disabled={randomPage === 1}
                    aria-label="Previous random posts page"
                  >
                    {'<'}
                  </button>
                  {Array.from({ length: totalRandomPages }).map((_, index) => {
                    const pageNo = index + 1;
                    return (
                      <button
                        type="button"
                        key={pageNo}
                        className={`home-random-page-btn ${randomPage === pageNo ? 'active' : ''}`}
                        onClick={() => setRandomPage(pageNo)}
                        aria-label={`Random posts page ${pageNo}`}
                      >
                        {pageNo}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="home-random-page-btn"
                    onClick={() => setRandomPage((prev) => Math.min(prev + 1, totalRandomPages))}
                    disabled={randomPage === totalRandomPages}
                    aria-label="Next random posts page"
                  >
                    {'>'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="home-latest-section">
          {isLatestLoading ? (
            <div className="home-loading-latest">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="home-loading-latest-item">
                  <div className="home-skeleton home-loading-latest-image"></div>
                  <div className="home-loading-latest-text">
                    <div className="home-skeleton home-loading-latest-title"></div>
                    <div className="home-skeleton home-loading-latest-date"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <RecentPosts posts={latestPosts}/>
          )}
        </section>
      </div>

      <section className="home-category-section">
        {isCategoryLoading ? (
          <div className="home-loading-category">
            <div className="home-loading-category-tabs">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="home-skeleton home-loading-category-tab"></div>
              ))}
            </div>
            <div className="home-loading-category-content">
              <div className="home-skeleton home-loading-category-featured"></div>
              <div className="home-loading-category-sidebar">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="home-skeleton home-loading-category-side-item"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <CategoriesPosts cat_posts={categoryPosts}/>
        )}
      </section>
      <Footer />
      
      
    </div>
  );
};

export default Home;
