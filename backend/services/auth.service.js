import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/constants.js";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role || "user",
    },
    JWT_CONFIG.SECRET_KEY,
    { expiresIn: JWT_CONFIG.EXPIRES_IN }
  );
};
