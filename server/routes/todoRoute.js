import express from "express";
import {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
} from "../controllers/todoControllers.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(verifyToken, getTodos).post(createTodo);
router.route("/").delete(deleteTodo).patch(updateTodo);
router.route("/:id").patch(updateTodo);

export default router;
