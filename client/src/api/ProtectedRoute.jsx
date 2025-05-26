import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import api from "./axios";

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // This endpoint should check the auth cookie
        await api.get("/api/protected", { withCredentials: true });
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Not authenticated", error);
        setIsAuthenticated(false);
        navigate("/login");
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or your loading spinner
  }

  return <Outlet />;
}
