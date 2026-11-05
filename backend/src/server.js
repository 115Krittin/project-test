import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

await prisma.$connect();

const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${env.port}; team=${env.teamCode}`);
});

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(1), 10_000);
  deadline.unref();
  server.close(async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch {
      process.exit(1);
    }
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
