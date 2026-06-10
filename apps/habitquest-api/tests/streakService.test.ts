import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { createHabit, verifyHabit } from "../src/services/habitService.js";
import { evaluateStreak } from "../src/services/streakService.js";

const prisma = new PrismaClient();

describe("streak service", () => {
  beforeEach(async () => {
    await prisma.habitCompletion.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.streakState.deleteMany();
    await prisma.user.deleteMany();
  });

  it("increments streak after all habits from the previous habit day are complete", async () => {
    const userId = randomUUID();
    const habit = await createHabit(prisma, {
      userId,
      name: "Read",
      verificationType: "TEXT_PROOF",
      timezone: "Asia/Jakarta",
      now: new Date("2026-06-04T18:05:00.000Z")
    });

    await verifyHabit(prisma, {
      userId,
      habitId: habit.id,
      proofText: "Read one chapter",
      now: new Date("2026-06-05T16:55:00.000Z")
    });

    const streak = await evaluateStreak(prisma, {
      userId,
      now: new Date("2026-06-05T18:05:00.000Z")
    });

    expect(streak.currentStreak).toBe(1);
    expect(streak.freezeQuota).toBe(2);
    expect(streak.events).toMatchObject([{ habitDay: "2026-06-05", result: "COMPLETED" }]);
  });

  it("uses a freeze when a previous habit day is incomplete", async () => {
    const userId = randomUUID();
    await createHabit(prisma, {
      userId,
      name: "Exercise",
      verificationType: "IMAGE_PROOF",
      timezone: "Asia/Jakarta",
      now: new Date("2026-06-04T18:05:00.000Z")
    });

    const streak = await evaluateStreak(prisma, {
      userId,
      now: new Date("2026-06-05T18:05:00.000Z")
    });

    expect(streak.currentStreak).toBe(0);
    expect(streak.freezeQuota).toBe(1);
    expect(streak.events).toMatchObject([{ habitDay: "2026-06-05", result: "FREEZE_USED" }]);
  });
});
