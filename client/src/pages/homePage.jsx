import { useEffect, useState } from 'react';
import RandomPosts from '../components/randomPosts.jsx';
import RecentPosts from '../components/recentPosts.jsx';
import CategoriesPosts from '../components/categoriesPosts.jsx';
// import { loginPart } from '../components/loginPart.jsx';
import Footer from '../components/footer.jsx';
import Authors from '../components/authors.jsx';
import './cssfile/home.css';

const Home = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [randomPosts, setRandomPosts] = useState([]);
  const [categoryPosts, setCategoryPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching home data...");

      try {
        // Fetch latest posts
        const latestRes = await fetch('http://localhost:5000/api/home/latestPosts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const latestData = await latestRes.json();
        if (!latestData.success) throw new Error("Failed to fetch latest posts");
        setLatestPosts(latestData.latestPosts);

        // Fetch random posts
        const randomRes = await fetch('http://localhost:5000/api/home/randomPosts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const randomData = await randomRes.json();
        if (!randomData.success) throw new Error("Failed to fetch random posts");
        setRandomPosts(randomData.randomPosts);

        // Fetch category posts
        const categoryRes = await fetch('http://localhost:5000/api/home/categoryPosts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const categoryData = await categoryRes.json();
        if (!categoryData.success) throw new Error("Failed to fetch category posts");
        setCategoryPosts(categoryData.categoryPosts);

      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-root">

      <div className="home-flex-row">
        <section className="home-random-section">
          <RandomPosts posts={randomPosts}/>
        </section>

        <section className="home-latest-section">
          <RecentPosts posts={latestPosts}/>
        </section>
      </div>

      <div className="home-category-authors-row">
        <section className="home-category-section">
          <CategoriesPosts cat_posts={categoryPosts}/>
        </section>
        <section className="home-authors-section">
          <Authors />
        </section>
      </div>
      <Footer />
      
      
    </div>
  );
};

export default Home;
