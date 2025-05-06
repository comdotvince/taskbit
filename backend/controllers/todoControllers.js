import asyncHandler from "express-async-handler";
import { Todo } from "../models/TodoModel.js";

const getTodos = asyncHandler(async (req, res) => {
  const todos = await Todo.find({});
  res.json(todos);
});

const createTodo = asyncHandler(async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    dueDate: req.body.dueDate,
    isCompleted: req.body.isCompleted,
  });
  const createdTodo = await todo.save();
  res.status(201).json(createdTodo);
});

const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (todo) {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo removed" });
  } else {
    res.status(404);
    throw new Error("Todo not found");
  }
});

const updateTodo = asyncHandler(async (req, res) => {
  const { isCompleted, title } = req.body;
  const { id } = req.params;

  // Prepare the update object
  const updateFields = {};
  if (isCompleted !== undefined) updateFields.isCompleted = isCompleted;
  if (title !== undefined) updateFields.title = title;

  const updatedItem = await Todo.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true }
  );

  if (!updatedItem) {
    return res.status(404).json({ error: "Item not found" });
  }

  res.json(updatedItem);
});

export { getTodos, createTodo, deleteTodo, updateTodo };
