import express from "express";
import { getHabits } from "../controllers/habitController.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(getHabits);

export default router;
