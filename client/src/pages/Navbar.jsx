import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { authUser } = useAuthStore();

  const onClickHandler = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include", 
      });

      const result = await res.json();
      console.log("Logged out:", result);

      // optional: reload or reset auth store
      window.location.href = "/login"; 
    } catch (error) {
      console.log("Error while logging out:", error);
    }
  };

  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? "focus" : "")}
      >
        Home
      </NavLink>
      <NavLink
        to="/login"
        className={({ isActive }) => (isActive ? "focus" : "")}
      >
        Login
      </NavLink>
      <NavLink
        to="/signup"
        className={({ isActive }) => (isActive ? "focus" : "")}
      >
        Signup
      </NavLink>
      <NavLink
        to="/createPost"
        className={({ isActive }) => (isActive ? "focus" : "")}
      >
        Create Post
      </NavLink>

      <NavLink
        to="/myPosts"
        className={({ isActive }) => (isActive ? "focus" : "")}
      >
        My Posts
      </NavLink>

      {authUser && (
        <button onClick={onClickHandler} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <LogOut />
          <span>Logout</span>
        </button>
      )}
    </nav>
  );
};

export default Navbar;
