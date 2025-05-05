import express from "express";
import {
  getTodos,
  createTodo,
  deleteTodo,
} from "../controllers/todoControllers.js";

const router = express.Router();

router.route("/").get(getTodos);
router.route("/create").post(createTodo);
router.route("/delete/:id").delete(deleteTodo);

export default router;
