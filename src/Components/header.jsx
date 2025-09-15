import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./StyleCss/header.css";

const Header = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef();
  const navigate = useNavigate();

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your session.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear(); // clear everything
        navigate("/");   // redirect
        Swal.fire("Logged Out!", "You have been logged out.", "success");
      }
    });
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="admin-logo">
          <img src="logo.jpg" alt="Logo" style={{ height: "30px", width: "100%" }} />
        </div>
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <div className="search-bar">
          <h3>Welcome back Pre-Visa Manager</h3>
        </div>
      </div>
      <div className="navbar-right">
        <div
          className="user-profile"
          ref={profileRef}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <FaUserCircle className="user-avatar" />
          <span className="username">Admin</span>
          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-item">👤 Profile</div>
              <div className="dropdown-item" onClick={handleLogout}>
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
