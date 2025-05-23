import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  // 1. Get token from cookies
  const token = req.cookies.authToken;

  // 2. Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      message: "Authorization token missing",
      code: "TOKEN_MISSING",
    });
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Check if user still exists in database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.clearCookie("authToken").status(401).json({
        success: false,
        isAuthenticated: false,
        message: "User account not found",
        code: "USER_NOT_FOUND",
      });
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // 6. Handle different JWT errors
    let message = "Invalid token";
    let code = "INVALID_TOKEN";

    if (error instanceof jwt.TokenExpiredError) {
      message = "Token expired";
      code = "TOKEN_EXPIRED";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Invalid token signature";
      code = "INVALID_SIGNATURE";
    }

    res
      .clearCookie("authToken")
      .status(403)
      .json({
        success: false,
        isAuthenticated: false,
        message,
        code,
        // Only include stack in development
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
  }
});
