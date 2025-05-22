import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/constants.js";

export const verifyToken = (req, res, next) => {
  const token =
    req.cookies[JWT_CONFIG.COOKIE_NAME] ||
    req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
