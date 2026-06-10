import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { createHabit, getTodayHabits } from "../src/services/habitService.js";
import { verifyHabitFromWebhook } from "../src/services/webhookService.js";

const prisma = new PrismaClient();

describe("webhook service", () => {
  beforeEach(async () => {
    await prisma.habitCompletion.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.streakState.deleteMany();
    await prisma.user.deleteMany();
  });

  it("marks a WEB_HOOK habit complete when the secret is valid", async () => {
    const userId = randomUUID();
    const habit = await createHabit(prisma, {
      userId,
      name: "Daily coding",
      verificationType: "WEB_HOOK",
      timezone: "Asia/Jakarta",
      secretKey: "secret",
      now: new Date("2026-06-06T02:00:00.000Z")
    });

    await verifyHabitFromWebhook(prisma, {
      habitId: habit.id,
      secretKey: "secret",
      status: "COMPLETED",
      now: new Date("2026-06-06T03:00:00.000Z")
    });

    const today = await getTodayHabits(prisma, {
      userId,
      now: new Date("2026-06-06T03:00:00.000Z")
    });

    expect(today.habits).toMatchObject([
      {
        id: habit.id,
        status: "COMPLETED"
      }
    ]);
  });

  it("rejects a webhook with an invalid secret", async () => {
    const habit = await createHabit(prisma, {
      name: "Daily coding",
      verificationType: "WEB_HOOK",
      timezone: "Asia/Jakarta",
      secretKey: "secret"
    });

    await expect(
      verifyHabitFromWebhook(prisma, {
        habitId: habit.id,
        secretKey: "wrong",
        status: "COMPLETED"
      })
    ).rejects.toThrow("Invalid webhook secret");
  });
});
