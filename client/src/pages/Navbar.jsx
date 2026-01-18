import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut } from "lucide-react";
import "./cssfile/Navbar.css";

const Navbar = () => {
  const { authUser } = useAuthStore();

  const onClickHandler = async () => {
    try {
      const res = await fetch("https://blogging-82kn.onrender.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await res.json();
      console.log("Logged out:", result);
      window.location.href = "/login";
    } catch (error) {
      console.log("Error while logging out:", error);
    }
  };

  return (
    <nav className="nav-root">
      <NavLink to="/" className="nav-logo"> MIRAGE </NavLink>

      <div className="nav-links">
        {authUser && authUser.user_type=="host" && <NavLink to="/createPost">Create Post</NavLink>}
        {authUser && authUser.user_type=="host" && <NavLink to="/myPosts">My Posts</NavLink>}
        {authUser && <NavLink to="Profile">Profile</NavLink>}
      </div>

      <div className="nav-auth">
        {authUser ? (
          <button className="nav-logout" onClick={onClickHandler}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        ) : (
          <>
            <NavLink to="/login" className="nav-login">Login</NavLink>
            <NavLink to="/signup" className="nav-signup">Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
