import express, { type Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

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
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? ["https://chargebackpilot.de", "https://www.chargebackpilot.de"]
    : "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (DDoS & API Cost Protection)
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Zu viele Anfragen. Bitte versuche es in einer Stunde erneut." },
});

// Apply rate limiter specifically to the API
app.use("/api", apiLimiter, router);

// Global Error Handler
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error(
      err,
      
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
