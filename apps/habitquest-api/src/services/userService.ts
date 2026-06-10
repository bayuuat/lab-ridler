import { PrismaClient } from "@prisma/client";
import { config } from "../config.js";
import { addDaysToHabitDay, getHabitDay } from "../time/habitDay.js";

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export async function getOrCreateUser(
  prisma: PrismaClient,
  options: { userId?: string; timezone?: string; now?: Date } = {}
) {
  const userId = options.userId ?? DEMO_USER_ID;
  const timezone = options.timezone ?? config.defaultTimezone;
  const now = options.now ?? new Date();

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: options.timezone ? { timezone } : {},
    create: {
      id: userId,
      timezone,
      streakState: {
        create: {
          freezeQuota: config.defaultFreezeQuota,
          lastEvaluatedHabitDay: addDaysToHabitDay(getHabitDay(now, timezone), -1)
        }
      }
    },
    include: { streakState: true }
  });

  if (!user.streakState) {
    await prisma.streakState.create({
      data: {
        userId: user.id,
        freezeQuota: config.defaultFreezeQuota,
        lastEvaluatedHabitDay: addDaysToHabitDay(getHabitDay(now, user.timezone), -1)
      }
    });
  }

  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { streakState: true }
  });
}
