import express from "express";
import {
  getHabits,
  createHabit,
  deleteHabit,
  completeHabit,
} from "../controllers/habitController.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(verifyToken, getHabits)
  .post(verifyToken, createHabit)
  .delete(verifyToken, deleteHabit)
  .patch(verifyToken, completeHabit);

export default router;
