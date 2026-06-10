import { PrismaClient } from "@prisma/client";
import { addDaysToHabitDay, compareHabitDays, getHabitDay } from "../time/habitDay.js";
import { getOrCreateUser } from "./userService.js";

async function isHabitDayComplete(prisma: PrismaClient, userId: string, habitDay: string) {
  const habits = await prisma.habit.findMany({
    where: {
      userId,
      archivedAt: null,
      createdHabitDay: { lte: habitDay }
    },
    select: { id: true }
  });

  if (habits.length === 0) {
    return { hasHabits: false, isComplete: false, totalHabits: 0, completedHabits: 0 };
  }

  const completedHabits = await prisma.habitCompletion.count({
    where: {
      userId,
      habitDay,
      habitId: { in: habits.map((habit) => habit.id) }
    }
  });

  return {
    hasHabits: true,
    isComplete: completedHabits === habits.length,
    totalHabits: habits.length,
    completedHabits
  };
}

export async function evaluateStreak(
  prisma: PrismaClient,
  input: { userId?: string; timezone?: string; now?: Date } = {}
) {
  const user = await getOrCreateUser(prisma, input);
  const state = user.streakState;
  if (!state) throw new Error("Streak state not found");

  const currentHabitDay = getHabitDay(input.now ?? new Date(), user.timezone);
  const lastDayToEvaluate = addDaysToHabitDay(currentHabitDay, -1);
  let nextDay = addDaysToHabitDay(state.lastEvaluatedHabitDay ?? lastDayToEvaluate, 1);
  let currentStreak = state.currentStreak;
  let freezeQuota = state.freezeQuota;
  const events: Array<{
    habitDay: string;
    result: "COMPLETED" | "FREEZE_USED" | "RESET" | "NO_HABITS";
    completedHabits: number;
    totalHabits: number;
  }> = [];

  while (compareHabitDays(nextDay, lastDayToEvaluate) <= 0) {
    const result = await isHabitDayComplete(prisma, user.id, nextDay);

    if (!result.hasHabits) {
      events.push({
        habitDay: nextDay,
        result: "NO_HABITS",
        completedHabits: 0,
        totalHabits: 0
      });
    } else if (result.isComplete) {
      currentStreak += 1;
      events.push({
        habitDay: nextDay,
        result: "COMPLETED",
        completedHabits: result.completedHabits,
        totalHabits: result.totalHabits
      });
    } else if (freezeQuota > 0) {
      freezeQuota -= 1;
      events.push({
        habitDay: nextDay,
        result: "FREEZE_USED",
        completedHabits: result.completedHabits,
        totalHabits: result.totalHabits
      });
    } else {
      currentStreak = 0;
      events.push({
        habitDay: nextDay,
        result: "RESET",
        completedHabits: result.completedHabits,
        totalHabits: result.totalHabits
      });
    }

    nextDay = addDaysToHabitDay(nextDay, 1);
  }

  const updated = await prisma.streakState.update({
    where: { userId: user.id },
    data: {
      currentStreak,
      freezeQuota,
      lastEvaluatedHabitDay: lastDayToEvaluate
    }
  });

  return {
    userId: user.id,
    timezone: user.timezone,
    currentHabitDay,
    currentStreak: updated.currentStreak,
    freezeQuota: updated.freezeQuota,
    lastEvaluatedHabitDay: updated.lastEvaluatedHabitDay,
    events
  };
}
