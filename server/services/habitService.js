import { Habit } from "../models/habit.model.js";

export const markMissedDays = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight UTC

  // Only fetch habits that might need updates (optimization)
  const habits = await Habit.find({
    $or: [
      { lastCompleted: { $lt: today } },
      { lastCompleted: { $exists: false } },
    ],
  });

  const bulkOps = [];

  for (const habit of habits) {
    const history = habit.history || new Map();
    let lastRecordedDate = new Date(habit.createdAt);
    lastRecordedDate.setHours(0, 0, 0, 0);

    // Get most recent completed date
    if (habit.lastCompleted) {
      const lastCompleted = new Date(habit.lastCompleted);
      lastCompleted.setHours(0, 0, 0, 0);
      if (lastCompleted > lastRecordedDate) {
        lastRecordedDate = lastCompleted;
      }
    }

    // Find gaps between lastRecordedDate and today
    let currentDate = new Date(lastRecordedDate);
    currentDate.setDate(currentDate.getDate() + 1);

    const updates = {};
    let missedDaysCount = 0;

    while (currentDate < today) {
      const dateKey = currentDate.toISOString().split("T")[0];

      if (!history.has(dateKey)) {
        updates[dateKey] = false;
        missedDaysCount++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Only queue updates if needed
    if (missedDaysCount > 0) {
      bulkOps.push({
        updateOne: {
          filter: { _id: habit._id },
          update: {
            $set: Object.fromEntries(
              Object.entries(updates).map(([date, val]) => [
                `history.${date}`,
                val,
              ])
            ),
            ...(habit.resetOnMissedDays && { $set: { streak: 0 } }),
          },
        },
      });
    }
  }

  // Execute all updates in single operation
  if (bulkOps.length > 0) {
    await Habit.bulkWrite(bulkOps);
  }
};
