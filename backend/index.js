import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

const port = process.env.PORT || 3000;

// Allow requests only from the frontend origin
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Replace with your frontend URL
    methods: ["GET", "POST", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies and credentials
  })
);

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Todo schema
const todoSchema = new mongoose.Schema({
  name: String,
  dueDate: String,
});

const Todo = mongoose.model("Todo", todoSchema);

// GET all todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// POST a new todo
app.post("/api/todos", async (req, res) => {
  try {
    const { name, dueDate } = req.body;
    if (!name || !dueDate) {
      return res.status(400).json({ error: "Name and dueDate are required" });
    }

    const newTodo = new Todo({ name, dueDate });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error adding todo:", error);
    res.status(500).json({ error: "Failed to add todo" });
  }
});

// DELETE a todo by ID
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
