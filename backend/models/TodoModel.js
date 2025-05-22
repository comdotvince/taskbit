import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

export { Todo };
