import cors from "cors";
import express from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { createHabit, getTodayHabits, verifyHabit } from "../services/habitService.js";
import { evaluateStreak } from "../services/streakService.js";
import { errorHandler } from "./errors.js";
import { VERIFICATION_TYPES } from "../types/habit.js";
import { saveProofImage } from "../services/proofImageService.js";
import { seedDemoHabits } from "../services/devSeedService.js";
import { verifyHabitFromWebhook } from "../services/webhookService.js";

const createHabitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  verificationType: z.enum(VERIFICATION_TYPES),
  timezone: z.string().optional(),
  secretKey: z.string().optional()
});

const verifyHabitSchema = z.object({
  habitId: z.string().uuid(),
  proofText: z.string().optional(),
  proofUrl: z.string().url().optional(),
  proofImageBase64: z.string().optional()
});

const externalWebhookSchema = z.object({
  habit_id: z.string().uuid(),
  secret_key: z.string().min(1),
  status: z.literal("COMPLETED")
});

function userIdFromHeader(request: express.Request) {
  const value = request.header("x-user-id");
  return value?.trim() || undefined;
}

export const app = express();

app.use(cors());
app.use(express.json({ limit: "8mb" }));
app.use("/uploads", express.static("uploads"));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/v1/habits", async (request, response, next) => {
  try {
    const body = createHabitSchema.parse(request.body);
    const habit = await createHabit(prisma, {
      userId: userIdFromHeader(request),
      name: body.name,
      description: body.description,
      verificationType: body.verificationType,
      timezone: body.timezone,
      secretKey: body.secretKey
    });

    response.status(201).json({ habit });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/habits/today", async (request, response, next) => {
  try {
    const result = await getTodayHabits(prisma, {
      userId: userIdFromHeader(request),
      timezone: typeof request.query.timezone === "string" ? request.query.timezone : undefined
    });

    response.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/v1/habits/verify", async (request, response, next) => {
  try {
    const body = verifyHabitSchema.parse(request.body);
    const proofUrl = body.proofImageBase64 ? await saveProofImage(body.proofImageBase64) : body.proofUrl;
    const completion = await verifyHabit(prisma, {
      userId: userIdFromHeader(request),
      habitId: body.habitId,
      proofText: body.proofText,
      proofUrl
    });

    response.status(201).json({ completion });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/streak", async (request, response, next) => {
  try {
    const result = await evaluateStreak(prisma, {
      userId: userIdFromHeader(request),
      timezone: typeof request.query.timezone === "string" ? request.query.timezone : undefined
    });

    response.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/v1/dev/seed", async (request, response, next) => {
  try {
    const result = await seedDemoHabits(prisma, {
      userId: userIdFromHeader(request),
      timezone: typeof request.body?.timezone === "string" ? request.body.timezone : undefined
    });

    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/v1/webhook/external-verify", async (request, response, next) => {
  try {
    const body = externalWebhookSchema.parse(request.body);
    const completion = await verifyHabitFromWebhook(prisma, {
      habitId: body.habit_id,
      secretKey: body.secret_key,
      status: body.status
    });

    response.status(201).json({ completion });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);
