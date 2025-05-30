import axios from "axios";
import api from "./axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_LAN = import.meta.env.VITE_API_URL_LAN;

const currentAPI =
  window.location.hostname === "localhost" ? API_URL : API_URL_LAN;

export const signup = async (userData) => {
  try {
    const response = await api.post(`/auth/signup`, userData, {
      withCredentials: true, // Crucial for cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    // The backend now returns only user data (token is in httpOnly cookie)
    const { user } = response.data;

    // Store user data in context/state (but NOT the token)
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (error) {
    console.error("Signup error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Throw consistent error object
    throw {
      message: error.response?.data?.message || "Registration failed",
      status: error.response?.status,
      errors: error.response?.data?.errors, // If using validation errors
    };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    const errorDetails = {
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message || "Login failed",
    };

    console.error("Login failed:", errorDetails);

    // Handle specific error cases
    switch (errorDetails.code) {
      case "INVALID_CREDENTIALS":
        throw new Error("Invalid email or password");
      case "INVALID_ACCOUNT":
        throw new Error("Account configuration error");
      default:
        throw new Error(errorDetails.message);
    }
  }
};

export const logout = async (userData) => {
  try {
    const response = await axios.post(
      `${currentAPI}/api/auth/logout`,
      userData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
export const verifyAuth = async () => {
  try {
    // Make a GET request to the "/auth/verify" endpoint
    const response = await api.get("/auth/verify", {
      withCredentials: true, // Include cookies in the request
      timeout: 5000, // Set timeout to 5 seconds
    });

    // Check if response contains valid user data
    if (!response.data || !response.data.user) {
      throw new Error("User not authenticated");
    }

    // Return the user data if authenticated
    return response.data.user;
  } catch (error) {
    // Return an object indicating authentication failure
    return {
      isAuthenticated: false,
      error: error.response?.data?.message || "Authentication failed",
    };
  }
};
