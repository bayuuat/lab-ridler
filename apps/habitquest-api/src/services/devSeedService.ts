import { PrismaClient } from "@prisma/client";
import { createHabit } from "./habitService.js";
import { getOrCreateUser } from "./userService.js";
import { VerificationType } from "../types/habit.js";

type SeedHabit = {
  name: string;
  description: string;
  verificationType: VerificationType;
  secretKey?: string;
};

const seedHabits: SeedHabit[] = [
  {
    name: "Read 10 pages",
    description: "Write one short takeaway after reading.",
    verificationType: "TEXT_PROOF"
  },
  {
    name: "Workout proof",
    description: "Upload a photo or screenshot after exercising.",
    verificationType: "IMAGE_PROOF"
  },
  {
    name: "Daily coding",
    description: "Completed automatically by an external coding platform.",
    verificationType: "WEB_HOOK",
    secretKey: "dev-daily-coding-secret"
  }
];

export async function seedDemoHabits(
  prisma: PrismaClient,
  input: { userId?: string; timezone?: string; now?: Date } = {}
) {
  const user = await getOrCreateUser(prisma, input);
  const created = [];
  const existing = [];

  for (const seedHabit of seedHabits) {
    const existingHabit = await prisma.habit.findFirst({
      where: {
        userId: user.id,
        name: seedHabit.name,
        archivedAt: null
      }
    });

    if (existingHabit) {
      existing.push(existingHabit);
      continue;
    }

    const habit = await createHabit(prisma, {
      userId: user.id,
      timezone: user.timezone,
      now: input.now,
      ...seedHabit
    });

    created.push(habit);
  }

  return {
    userId: user.id,
    created,
    existing,
    habits: [...existing, ...created]
  };
}
