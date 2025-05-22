import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    // 2. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password" });

    // 3. Generate JWT
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Send response
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Validate required fields
  if (!email || !password || !name) {
    res.status(400);
    throw new Error("Email, password, and name are required");
  }

  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already in use");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = new User({
    email,
    hashedPassword,
    name,
  });
  await user.save();

  // Generate JWT
  const token = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Respond with user + token
  res.status(201).json({
    token,
    user: { id: user._id, email: user.email, name: user.name },
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
