import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';                   
import { useAuthStore } from '../store/useAuthStore.js';         
import './cssfile/login.css';
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const em = useRef(null);
  const psswrd = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn , setLoggingIn] = useState(false);
  const navigate = useNavigate();                                
  const { checkAuth } = useAuthStore();                        

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    const userData = {
      email: em.current.value,
      password: psswrd.current.value
    };

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const result = await res.json();
      console.log('response : ', result);

      if (result.errors) {
        result.errors.forEach(err => toast.error(err.msg || err));
        return;
      }

      if (result.success) {
        toast.success("Login successful!");
        setTimeout(async () => {
          await checkAuth();          // sets authUser in useAuthStore :contentReference[oaicite:0]{index=0}
          navigate('/', { replace: true });
        }, 500);
      } else {
        toast.error(result.message || "Login failed!");
        psswrd.current.value = "";
      }

    } catch (error) {
      console.log("error while verifying data", error);
      toast.error("Something went wrong.");
    } finally{
        isLoggingIn = false;
    }

    psswrd.current.value = "";
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={6000} />

      <div className="login-container">
        <div className="login-card">
          {/* Logo */}
          <div className="logo-container">
            <div className="logo">
              <div className="logo-dots">
                <div className="logo-dot"></div>
                <div className="logo-dot"></div>
                <div className="logo-dot"></div>
                <div className="logo-dot"></div>
              </div>
            </div>
            <span className="welcome-text">Welcome Back</span>
          </div>

          {/* Header */}
          <div className="header">
            <h1 className="header-title">Login to your Account</h1>
            <p className="header-subtitle">See what is going on with your business</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                ref={em}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ position: "relative" }}>
              <label className="form-label">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                ref={psswrd}
                className="form-input"
              />
              <button
                type="button"
                className="form-label"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '45px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#8b1538'
                }}
              >
                {showPassword ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
              </button>
            </div>

            <button type="submit" className="login-button">
              {loggingIn ? "Logging..." : "Loging"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
