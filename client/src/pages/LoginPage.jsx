import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth.jsx"; // Fixed import path
import "./LoginPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", response);

      // Store user data in localStorage - check both possible locations
      let userData = null;
      if (response.user) {
        userData = response.user;
      } else if (response.data && response.data.user) {
        userData = response.data.user;
      }

      if (userData) {
        console.log("Storing user data:", userData);
        localStorage.setItem("user", JSON.stringify(userData));

        // Dispatch custom event to notify TodoApp
        console.log("Dispatching userLogin event");
        window.dispatchEvent(new CustomEvent("userLogin"));

        // Navigate back to main app
        navigate("/");
      } else {
        console.log(
          "No user data found in response, creating minimal user data"
        );

        // Create minimal user data structure if none provided
        const minimalUserData = {
          id: response.id || response._id || Date.now().toString(),
          name: response.name || formData.email.split("@")[0],
          email: response.email || formData.email,
          todos: [],
          habits: [],
        };

        console.log("Created minimal user data:", minimalUserData);
        localStorage.setItem("user", JSON.stringify(minimalUserData));

        // Dispatch custom event to notify TodoApp
        console.log("Dispatching userLogin event with minimal data");
        window.dispatchEvent(new CustomEvent("userLogin"));

        // Navigate back to main app
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different error types
      if (error.message === "Invalid email or password") {
        setErrors({ api: "Invalid email or password" });
      } else if (error.message === "Account configuration error") {
        setErrors({ api: "Account error. Please contact support." });
      } else if (error.message && error.message.includes("connect")) {
        setErrors({ api: "Cannot connect to server. Please try again later." });
      } else {
        setErrors({
          api: error.message || "Login failed. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Add back to app link */}
        <div className="back-link">
          <Link to="/" className="back-to-app">
            ← Back to Taskbit
          </Link>
        </div>

        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue to Taskbit</p>

        {errors.api && <div className="error-message">{errors.api}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
