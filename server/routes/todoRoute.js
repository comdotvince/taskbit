import express from "express";
import {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
} from "../controllers/todoControllers.js";

const router = express.Router();

router.route("/").get(getTodos).post(createTodo);
router.route("/:id").delete(deleteTodo).patch(updateTodo);

export default router;
