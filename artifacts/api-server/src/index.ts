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

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
