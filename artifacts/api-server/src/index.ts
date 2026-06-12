import app from "./app";
import { getApiServerEnv } from "@workspace/env";
import { logger } from "./lib/logger";

let env: ReturnType<typeof getApiServerEnv>;

try {
  env = getApiServerEnv();
} catch (error) {
  logger.error(
    { error: error instanceof Error ? error.message : String(error) },
    "Failed to parse environment variables"
  );
  process.exit(1);
}

const port = env.PORT;
const host = "0.0.0.0";

const server = app.listen(port, host, () => {
  logger.info({ port, host }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});

let isShuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, "Received shutdown signal, closing server");

  const forceExitTimer = setTimeout(() => {
    logger.warn({ signal }, "Graceful shutdown timed out, exiting");
    process.exit(0);
  }, 25_000);
  forceExitTimer.unref();

  server.close((err) => {
    clearTimeout(forceExitTimer);
    if (err) {
      logger.error({ err, signal }, "Error while closing server");
      process.exit(1);
    }
    logger.info({ signal }, "Server closed cleanly");
    process.exit(0);
  });
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
