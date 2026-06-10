import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const habitQuestBaseUrl = process.env.HABITQUEST_API_URL ?? "http://127.0.0.1:3001";
const webhookUrl = `${habitQuestBaseUrl}/api/v1/webhook/external-verify`;
const antislopEnvPath = path.join(rootDir, "apps", "antislop", ".env.local");
const composeEnvPath = path.join(rootDir, ".env.compose");

function upsertEnvValue(content, key, value) {
  const line = `${key}="${value}"`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }

  return `${content.trimEnd()}\n${line}\n`;
}

async function readTextIfExists(filePath) {
  if (!existsSync(filePath)) return "";
  return readFile(filePath, "utf8");
}

async function writeEnvValues(filePath, values) {
  let content = await readTextIfExists(filePath);

  for (const [key, value] of Object.entries(values)) {
    content = upsertEnvValue(content, key, value);
  }

  await writeFile(filePath, content, "utf8");
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with HTTP ${response.status}`);
  }

  return data;
}

async function main() {
  const health = await fetch(`${habitQuestBaseUrl}/health`).catch(() => null);
  if (!health?.ok) {
    throw new Error(`HabitQuest API is not reachable at ${habitQuestBaseUrl}. Run npm run dev:api first.`);
  }

  const seed = await postJson(`${habitQuestBaseUrl}/api/v1/dev/seed`, {
    timezone: "Asia/Jakarta"
  });

  const dailyCodingHabit = seed.habits?.find((habit) => habit.name === "Daily coding");
  if (!dailyCodingHabit?.id || !dailyCodingHabit?.secretKey) {
    throw new Error("Daily coding WEB_HOOK habit was not returned by the seed endpoint.");
  }

  const envValues = {
    HABITQUEST_WEBHOOK_URL: webhookUrl,
    HABITQUEST_DAILY_CODING_HABIT_ID: dailyCodingHabit.id,
    HABITQUEST_DAILY_CODING_SECRET_KEY: dailyCodingHabit.secretKey
  };

  await writeEnvValues(antislopEnvPath, envValues);

  let composeContent = await readTextIfExists(composeEnvPath);
  if (!composeContent) {
    composeContent = await readFile(path.join(rootDir, ".env.compose.example"), "utf8");
  }
  await writeFile(composeEnvPath, composeContent, "utf8");
  await writeEnvValues(composeEnvPath, {
    HABITQUEST_DAILY_CODING_HABIT_ID: dailyCodingHabit.id,
    HABITQUEST_DAILY_CODING_SECRET_KEY: dailyCodingHabit.secretKey
  });

  console.log("HabitQuest webhook configured for AntiSlop.");
  console.log(`Daily coding habit id: ${dailyCodingHabit.id}`);
  console.log(`Updated: ${path.relative(rootDir, antislopEnvPath)}`);
  console.log(`Updated: ${path.relative(rootDir, composeEnvPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
