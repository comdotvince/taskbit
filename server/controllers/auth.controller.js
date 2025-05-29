import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Todo } from "../models/TodoModel.js";
// import { Habit } from "../models/habit.model.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
      code: "MISSING_CREDENTIALS",
    });
  }

  try {
    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Verify password exists in user document
    if (!user.password) {
      console.error(`User ${user._id} has no password set`);
      return res.status(401).json({
        success: false,
        message: "Account configuration error",
        code: "INVALID_ACCOUNT",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    res.json({ message: "Logged in" });
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      stack: error.stack,
      email: email, // For debugging which user failed
    });

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development" ? error.message : "Login failed",
      code: "SERVER_ERROR",
    });
  }
});

export const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Validate required fields
  if (!email || !password || !name) {
    res.status(400);
    throw new Error("Email, password, and name are required");
  }

  // Check if email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already in use");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    name,
  });

  // Generate JWT
  const token = jwt.sign(
    { id: user._id }, // Only store minimal necessary data in token
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // Longer expiry for better UX
  );

  // Set secure HTTP-only cookie
  res.cookie("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/", // Accessible across all routes
    domain:
      process.env.NODE_ENV === "development" ? "localhost" : ".yourdomain.com",
  });

  // Respond with user data (excluding sensitive info)
  res.status(201).json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
  });
});

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // set to true in production (HTTPS)
    sameSite: "strict", // CSRF protection
  });

  res.status(200).json({ message: "Logged out successfully" });
};

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

export const verifyUser = asyncHandler(async (req, res) => {
  try {
    // User is attached by your auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Optional: Refresh user data from DB
    const currentUser = await User.findById(req.user.id).select("-password");

    if (!currentUser) {
      return res.clearCookie("authToken").status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.clearCookie("authToken").status(500).json({
      success: false,
      message: "Authentication check failed",
    });
  }
});

// Protected endpoint

export const protectedRoute = asyncHandler(async (req, res) => {
  if (!req.cookies.authToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ secretData: "This is protected content" });
});
