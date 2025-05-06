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

const randomSchema = new mongoose.Schema({
  randomName: {
    type: String,
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema);
const Random = mongoose.model("Random", randomSchema);

// Example: Create a new Random item
const newRandom = new Random({
  randomName: "Sample Name",
});

newRandom.save();

export { Random, Todo };
