import { useEffect , useState } from 'react'
import { Routes , Route , Navigate } from 'react-router-dom';
import Navbar from './pages/Navbar.jsx';
import Login from './pages/loginPage.jsx'
import Signup from './pages/signupPage.jsx'
import CreatePost from './pages/createPostPage.jsx'
import Home from './pages/homePage.jsx'
import MyPosts from './pages/myPostsPage.jsx'
import { useAuthStore } from './store/useAuthStore.js';
import { Loader } from 'lucide-react'
import './Loader.css';

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="loader-fullscreen">
        <Loader className="loader-icon" />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" replace />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/createPost" element={authUser ? <CreatePost /> : <Navigate to="/login" replace />} />
        <Route path="/myPosts" element={authUser ? <MyPosts /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App
