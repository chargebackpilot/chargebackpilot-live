import express, { type Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Global Error Handler
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error(
      err instanceof Error ? err.message : String(err),
      err.stack,
      "Unhandled error in API",
    );
    res.status(500).json({
      error: "Ein interner Serverfehler ist aufgetreten.",
      details: process.env.NODE_ENV === "development"
        ? (err instanceof Error ? err.message : String(err))
        : undefined,
    });
  },
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, "../..", "chargeback-pilot", "dist", "public");

app.use(express.static(staticDir));
app.get(/(.*)/, (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

export default app;
