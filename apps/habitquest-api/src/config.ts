import "dotenv/config";

export const config = {
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 3000),
  defaultTimezone: process.env.DEFAULT_TIMEZONE ?? "Asia/Jakarta",
  defaultFreezeQuota: Number(process.env.DEFAULT_FREEZE_QUOTA ?? 2),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
};
