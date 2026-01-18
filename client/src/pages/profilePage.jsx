import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Phone, Calendar, Key ,UserRoundPen } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./cssfile/profile.css"; 

const Profile = () => {
  const { authUser } = useAuthStore();
  const [form, setForm] = useState({
    name: authUser.name || "",
    email: authUser.email || "",
    phone: authUser.phone || "",
    profilePic: authUser.profilePic || "",
    bio: authUser.bio || "",
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("https://blogging-82kn.onrender.com/api/auth/updateProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(result.message || "Failed to update profile.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      toast.error("Server error. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch("https://blogging-82kn.onrender.com/api/host/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      const data = await res.json();
      if (data.success) {
        setForm(f => ({ ...f, profilePic: data.url }));
        
      } else {
        toast.error("Failed to upload image.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      toast.error("Image upload failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    setUploading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="profile-container">
      <ToastContainer />
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">Your profile information</p>
        </div>

        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <img 
              src={form.profilePic || "/avatar.png"} 
              alt="Profile" 
              className="avatar-image" 
            />
            <label className={`avatar-upload ${uploading ? 'uploading' : ''}`}>
              {uploading ? (
                <div className="upload-spinner"></div>
              ) : (
                <Camera className="avatar-upload-icon" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="avatar-hint">
            {uploading ? "Uploading..." : "Click the camera icon to update your photo"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-label">
              <User className="form-icon" />
              Full Name
            </div>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <Mail className="form-icon" />
              Email Address
            </div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <Phone className="form-icon" />
              Phone Number
            </div>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <UserRoundPen />
              Bio
            </div>
            <textarea
              name="bio"
              value={form.bio || ''}
              onChange={handleChange}
              className="form-input"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || uploading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>

          <div className="account-info-section">
            <h2 className="account-title">Account Information</h2>
            
            <div className="info-item">
              <span className="info-label">
                <Key className="form-icon" /> User ID
              </span>
              <span className="info-value">{authUser._id || 'N/A'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">
                <Calendar className="form-icon" /> Member Since
              </span>
              <span className="info-value">{formatDate(authUser.createdAt)}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Account Status</span>
              <span className="info-value status-active">Active</span>
            </div>
          </div>

          
        </form>
      </div>
    </div>
  );
};

export default Profile;