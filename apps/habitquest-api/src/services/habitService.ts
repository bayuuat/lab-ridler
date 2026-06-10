import { PrismaClient } from "@prisma/client";
import { getHabitDay } from "../time/habitDay.js";
import { getOrCreateUser } from "./userService.js";
import { HABIT_STATUS, VerificationType } from "../types/habit.js";

export async function createHabit(
  prisma: PrismaClient,
  input: {
    userId?: string;
    name: string;
    description?: string;
    verificationType: VerificationType;
    timezone?: string;
    secretKey?: string;
    now?: Date;
  }
) {
  const user = await getOrCreateUser(prisma, {
    userId: input.userId,
    timezone: input.timezone,
    now: input.now
  });
  const now = input.now ?? new Date();

  return prisma.habit.create({
    data: {
      userId: user.id,
      name: input.name,
      description: input.description,
      verificationType: input.verificationType,
      secretKey: input.secretKey,
      createdHabitDay: getHabitDay(now, user.timezone)
    }
  });
}

export async function getTodayHabits(
  prisma: PrismaClient,
  input: { userId?: string; timezone?: string; now?: Date } = {}
) {
  const user = await getOrCreateUser(prisma, input);
  const habitDay = getHabitDay(input.now ?? new Date(), user.timezone);

  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      archivedAt: null,
      createdHabitDay: { lte: habitDay }
    },
    include: {
      completions: {
        where: { habitDay }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return {
    habitDay,
    timezone: user.timezone,
    habits: habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      verificationType: habit.verificationType,
      status: habit.completions.length > 0 ? HABIT_STATUS.COMPLETED : HABIT_STATUS.PENDING,
      completedAt: habit.completions[0]?.createdAt ?? null
    }))
  };
}

export async function verifyHabit(
  prisma: PrismaClient,
  input: {
    userId?: string;
    habitId: string;
    proofText?: string;
    proofUrl?: string;
    source?: string;
    now?: Date;
  }
) {
  const habit = await prisma.habit.findUnique({
    where: { id: input.habitId },
    include: { user: true }
  });

  if (!habit || habit.archivedAt) {
    throw new Error("Habit not found");
  }

  if (input.userId && habit.userId !== input.userId) {
    throw new Error("Habit not found");
  }

  if (habit.verificationType === "WEB_HOOK" && input.source !== "WEB_HOOK") {
    throw new Error("WEB_HOOK habits must be completed through the webhook endpoint");
  }

  const habitDay = getHabitDay(input.now ?? new Date(), habit.user.timezone);

  return prisma.habitCompletion.upsert({
    where: {
      habitId_habitDay: {
        habitId: habit.id,
        habitDay
      }
    },
    update: {
      proofText: input.proofText,
      proofUrl: input.proofUrl,
      source: input.source ?? "MANUAL"
    },
    create: {
      userId: habit.userId,
      habitId: habit.id,
      habitDay,
      proofText: input.proofText,
      proofUrl: input.proofUrl,
      source: input.source ?? "MANUAL"
    }
  });
}
