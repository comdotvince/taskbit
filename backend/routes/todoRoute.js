import express from "express";
import {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
} from "../controllers/todoControllers.js";

const router = express.Router();

router.route("/").get(getTodos);
router.route("/").post(createTodo);
router.route("/:id").delete(deleteTodo);
router.route("/:id").patch(updateTodo);

export default router;
