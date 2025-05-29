import { Router } from "express";
import {
  login,
  logout,
  signup,
  verifyUser,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/verify", verifyToken, verifyUser);

router.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "You are authenticated!" });
});

export default router;
