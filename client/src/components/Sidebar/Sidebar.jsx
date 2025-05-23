import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { verifyAuth } from "../../api/auth.jsx";
import api from "../../api/axios.jsx";
import "./Sidebar.css";

const Sidebar = ({ openSidebar, setOpenSidebar }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Verify auth on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await verifyAuth();
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpenSidebar]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={`sidebar ${openSidebar ? "open" : ""}`} ref={sidebarRef}>
      {/* Profile panel */}
      <div className="profile-menu">
        {user && (
          <div className="profile-content">
            <div className="profile-header">
              <div className="avatar-large">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>

            {/* Add your menu items here */}
            <div className="menu-items">
              <button className="menu-item">Account Settings</button>
              <button className="menu-item">Notifications</button>
            </div>

            {/* Logout button at the bottom */}
            <div className="logout-container">
              <button className="logout-button" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
