import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  streak: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastCompleted: {
    type: Date,
    default: null,
  },
  history: {
    type: Map,
    of: Boolean,
    default: {},
  },
});

const Habit = mongoose.model("Habit", habitSchema);

export { Habit };
