import asyncHandler from "express-async-handler";
import Todo from "../models/TodoModel.js";

const getTodos = asyncHandler(async (req, res) => {
  const todos = await Todo.find({});
  res.json(todos);
});

const createTodo = asyncHandler(async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    dueDate: req.body.dueDate,
  });
  const createdTodo = await todo.save();
  res.status(201).json(createdTodo);
});

const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (todo) {
    await Todo.findByIdAndDelete(req.params.id); // First, delete the todo
    res.json({ message: "Todo removed" }); // Then send the response
  } else {
    res.status(404);
    throw new Error("Todo not found"); // Error if the todo doesn’t exist
  }
});

export { getTodos, createTodo, deleteTodo };
