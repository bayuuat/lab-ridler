import { PrismaClient } from "@prisma/client";
import { verifyHabit } from "./habitService.js";

export async function verifyHabitFromWebhook(
  prisma: PrismaClient,
  input: {
    habitId: string;
    secretKey: string;
    status: "COMPLETED";
    now?: Date;
  }
) {
  const habit = await prisma.habit.findUnique({
    where: { id: input.habitId }
  });

  if (!habit || habit.archivedAt) {
    throw new Error("Habit not found");
  }

  if (habit.verificationType !== "WEB_HOOK") {
    throw new Error("Habit does not accept webhook verification");
  }

  if (!habit.secretKey || habit.secretKey !== input.secretKey) {
    throw new Error("Invalid webhook secret");
  }

  return verifyHabit(prisma, {
    habitId: habit.id,
    source: "WEB_HOOK",
    proofText: "External webhook completed this habit.",
    now: input.now
  });
}
