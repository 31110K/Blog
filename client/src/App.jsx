import { useEffect , useState } from 'react'
import { Routes , Route , Navigate } from 'react-router-dom'
import Navbar from './pages/Navbar.jsx';
import Login from './pages/loginPage.jsx'
import Signup from './pages/signupPage.jsx'
import CreatePost from './pages/createPostPage.jsx'
import Home from './pages/homePage.jsx'
import MyPosts from './pages/myPostsPage.jsx'
import EditPost from './pages/editPostPage.jsx'
import ViewPost from './pages/viewPostPage.jsx'
import Profile from './pages/profilePage.jsx'
import { useAuthStore } from './store/useAuthStore.js'
import { Loader } from 'lucide-react'
import './pages/cssfile/Loader.css';

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
        <Route path="/" element={<Home />}/>
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" replace />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/createPost" element={authUser ? <CreatePost /> : <Navigate to="/login" replace />} />
        <Route path="/myPosts" element={authUser ? <MyPosts /> : <Navigate to="/login" replace />} />
        <Route path="/editPost/:postId" element={authUser ? <EditPost />  : <Navigate to="/login" replace />} />
        <Route path="/viewPost/:postSlug" element={<ViewPost />} />
        <Route path="/Profile" element={authUser ? <Profile />  : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App
