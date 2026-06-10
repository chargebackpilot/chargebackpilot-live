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
