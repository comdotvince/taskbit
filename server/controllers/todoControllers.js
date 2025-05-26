import asyncHandler from "express-async-handler";
import { Todo } from "../models/TodoModel.js";

const getTodos = asyncHandler(async (req, res) => {
  const todos = await Todo.find({ user: req.user._id });
  res.json(todos);
});

const createTodo = asyncHandler(async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    isCompleted: req.body.isCompleted,
    user: req.body.user,
  });
  const createdTodo = await todo.save();
  res.status(201).json(createdTodo);
});

const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.body.id);

  if (todo) {
    await Todo.findByIdAndDelete(req.body.id);
    res.json({ message: "Todo removed" });
  } else {
    res.status(404);
    throw new Error("Todo not found");
  }
});

const updateTodo = asyncHandler(async (req, res) => {
  const { isCompleted, title } = req.body;
  const id = req.params.id || req.body.id; // Fix: Remove destructuring from params.id

  if (!id) {
    return res.status(400).json({ error: "Todo ID is required" });
  }

  // Prepare the update object
  const updateFields = {};
  if (isCompleted !== undefined) updateFields.isCompleted = isCompleted;
  if (title !== undefined) updateFields.title = title;

  // Verify the todo exists and belongs to user
  const todo = await Todo.findOne({
    _id: id,
  });

  if (!todo) {
    return res.status(404).json({ error: "Item not found" });
  }

  // Perform the update
  const updatedItem = await Todo.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  res.json(updatedItem);
});

export { getTodos, createTodo, deleteTodo, updateTodo };
