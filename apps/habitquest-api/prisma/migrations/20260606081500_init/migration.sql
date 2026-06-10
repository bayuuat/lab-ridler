-- Manual SQLite migration for HabitQuest Milestone 1.
-- Prisma migrate may fail on some local schema-engine setups; this SQL keeps the
-- database shape explicit and compatible with Prisma Client.

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "timezone" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Habit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "verificationType" TEXT NOT NULL,
  "secretKey" TEXT,
  "createdHabitDay" TEXT NOT NULL,
  "archivedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "HabitCompletion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "habitId" TEXT NOT NULL,
  "habitDay" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "proofText" TEXT,
  "proofUrl" TEXT,
  "source" TEXT NOT NULL DEFAULT 'MANUAL',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HabitCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "HabitCompletion_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "StreakState" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "freezeQuota" INTEGER NOT NULL DEFAULT 2,
  "lastEvaluatedHabitDay" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StreakState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Habit_userId_createdHabitDay_idx" ON "Habit" ("userId", "createdHabitDay");
CREATE UNIQUE INDEX IF NOT EXISTS "HabitCompletion_habitId_habitDay_key" ON "HabitCompletion" ("habitId", "habitDay");
CREATE INDEX IF NOT EXISTS "HabitCompletion_userId_habitDay_idx" ON "HabitCompletion" ("userId", "habitDay");
CREATE UNIQUE INDEX IF NOT EXISTS "StreakState_userId_key" ON "StreakState" ("userId");
