export const JWT_CONFIG = {
  SECRET_KEY: process.env.JWT_SECRET || "your-secret-key",
  EXPIRES_IN: "1h",
  COOKIE_NAME: "auth_token",
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000, // 1 hour in milliseconds
  },
};
