import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.jsx";
import "./Sidebar.css";

const Sidebar = ({ openSidebar, setOpenSidebar, user, setUser }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

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
      console.log("Logout successful");
      localStorage.removeItem("user");
      setUser(null);
      setOpenSidebar(false);
      // Refresh the page to reload guest data
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSignIn = () => {
    setOpenSidebar(false);
    navigate("/login");
  };

  const handleSignUp = () => {
    setOpenSidebar(false);
    navigate("/signup");
  };

  return (
    <div className={`sidebar ${openSidebar ? "open" : ""}`} ref={sidebarRef}>
      <div className="profile-menu">
        {user ? (
          // Authenticated user view
          <div className="profile-content">
            <div className="profile-header">
              <div className="avatar-large">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>

            <div className="menu-items">
              <button className="menu-item">Account Settings</button>
              <button className="menu-item">Notifications</button>
            </div>

            <div className="logout-container">
              <button className="logout-button" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        ) : (
          // Guest user view
          <div className="profile-content">
            <div className="profile-header">
              <div className="avatar-large">G</div>
              <h3>Guest User</h3>
              <p>Sign in to sync your data</p>
            </div>

            <div className="auth-buttons">
              <button className="signin-button" onClick={handleSignIn}>
                Sign In
              </button>
              <button className="signup-button" onClick={handleSignUp}>
                Sign Up
              </button>
            </div>

            <div className="guest-info">
              <p>
                Your data is saved locally and will be synced when you sign in.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
