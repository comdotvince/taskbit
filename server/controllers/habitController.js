import asyncHandler from "express-async-handler";
import { Habit } from "../models/habit.model.js";

const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({});
  res.json(habits);
});

export { getHabits };
