import { config } from "./config.js";
import { prisma } from "./db/prisma.js";
import { app } from "./http/app.js";

const server = app.listen(config.port, config.host, () => {
  console.log(`HabitQuest backend listening on http://${config.host}:${config.port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
