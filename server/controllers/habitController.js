import asyncHandler from "express-async-handler";
import { Habit } from "../models/habit.model.js";

const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ user: req.user._id });
  res.json(habits);
});

const createHabit = asyncHandler(async (req, res) => {
  const { title, streak, user, lastCompleted, history } = req.body;

  const habit = new Habit({
    title,
    streak,
    user,
    lastCompleted: lastCompleted || null,
    history: history || {},
  });

  const createdHabit = await habit.save();
  res.status(201).json(createdHabit);
});

const completeHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.body.id);
  if (habit) {
    habit.streak += 1;
    habit.lastCompleted = new Date();

    if (!habit.history) habit.history = {};
    habit.history.set(habit.lastCompleted.toISOString().split("T")[0], true);

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } else {
    res.status(404);
    throw new Error("Habit not found");
  }
});

const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.body.id);
  if (habit) {
    await Habit.findByIdAndDelete(req.body.id);
    res.json({ message: "Habit removed" });
  } else {
    res.status(404);
    throw new Error("Habit not found");
  }
});

export { getHabits, createHabit, deleteHabit, completeHabit };
