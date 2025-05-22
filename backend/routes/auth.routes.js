import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
