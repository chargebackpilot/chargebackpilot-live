import express, { type Express, type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import cors from "cors";
import pinoHttp from "pino-http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { getApiServerEnv } from "@workspace/env";

const env = getApiServerEnv();

const app: Express = express();

app.set("trust proxy", 1);

// Security Headers (HSTS, CSP, X-Frame-Options, etc.)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
          remoteAddress: req.ip,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

// CORS with environment-based configuration
const corsOrigins =
  env.NODE_ENV === "production"
    ? ["https://chargebackpilot.de", "https://www.chargebackpilot.de"]
    : ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  })
);

// Request body parsing with size limits (prevent abuse)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Rate Limiting (DDoS & API Cost Protection)
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    error: "Zu viele Anfragen. Bitte versuche es in einer Stunde erneut.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === "/healthz";
  },
});

// Apply rate limiter specifically to the API
app.use("/api", apiLimiter, router);

/**
 * Standardized error response type
 */
interface ApiErrorResponse {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

/**
 * Global Error Handler - must be last middleware
 */
app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    const errorCode = err instanceof ApiError ? err.code : "INTERNAL_SERVER_ERROR";
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message =
      err instanceof Error ? err.message : "Ein interner Serverfehler ist aufgetreten.";

    logger.error(
      {
        error: err instanceof Error ? err : String(err),
        code: errorCode,
        statusCode,
      },
      "Unhandled error in API"
    );

    const response: ApiErrorResponse = {
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
    };

    if (env.NODE_ENV === "development" && err instanceof Error) {
      response.details = {
        stack: err.stack,
      };
    }

    res.status(statusCode).json(response);
  }
);

/**
 * API 404 Handler
 *
 * Keep this scoped to /api only. The static/SPA handlers below must still be
 * able to serve frontend routes such as /, /methodik and /ratgeber.
 */
app.use("/api", (_req: Request, res: Response): void => {
  res.status(404).json({
    code: "NOT_FOUND",
    message: "Endpoint nicht gefunden",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Custom API Error class for standardized error handling
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, "../..", "chargeback-pilot", "dist", "public");
const indexPath = path.join(staticDir, "index.html");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const metaByPath: Array<{ match: RegExp; title: string; description: string; noindex?: boolean }> = [
  {
    match: /^\/$/,
    title: "ChargebackPilot · KI-Hilfe für Chargeback, PayPal-Käuferschutz & Reklamation 2026",
    description:
      "Ware nicht erhalten, Flug ausgefallen, doppelt belastet? ChargebackPilot prüft deinen Fall mit KI in 60 Sekunden und liefert dir 3 fertige Textvorlagen.",
  },
  {
    match: /^\/vorlagen-generator$/,
    title: "Vorlagen-Generator · ChargebackPilot",
    description:
      "Erstelle in wenigen Schritten professionelle Reklamationsvorlagen für Händler, Bank/PayPal/Klarna und Eskalation.",
  },
  {
    match: /^\/ratgeber/,
    title: "Ratgeber & Guides zu Chargeback, Käuferschutz und Rückerstattung · ChargebackPilot",
    description:
      "Praxisnahe Anleitungen für PayPal, Kreditkarten-Chargeback, Klarna-Reklamation und typische Problemfälle im Onlinekauf.",
  },
  {
    match: /^\/404$/,
    title: "Seite nicht gefunden (404) · ChargebackPilot",
    description:
      "Die angeforderte Seite existiert nicht oder wurde verschoben. Nutze unsere Startseite oder den Ratgeber, um schnell weiterzumachen.",
    noindex: true,
  },
  {
    match: /^\/impressum$/,
    title: "Impressum · ChargebackPilot",
    description:
      "Impressum von ChargebackPilot gemäß den geltenden Informationspflichten für Online-Angebote in Deutschland.",
  },
  {
    match: /^\/datenschutz$/,
    title: "Datenschutzerklärung · ChargebackPilot",
    description:
      "Datenschutzerklärung von ChargebackPilot mit Informationen zur Datenverarbeitung, Rechtsgrundlagen und Betroffenenrechten.",
  },
  {
    match: /^\/agb$/,
    title: "Allgemeine Geschäftsbedingungen (AGB) · ChargebackPilot",
    description:
      "Allgemeine Geschäftsbedingungen von ChargebackPilot für Nutzung, Leistungsumfang, Vergütung und Haftung.",
  },
  {
    match: /^\/widerruf$/,
    title: "Widerrufsbelehrung · ChargebackPilot",
    description:
      "Widerrufsbelehrung von ChargebackPilot mit Fristen, Voraussetzungen und Musterinformationen für Verbraucher.",
  },
  {
    match: /^\/(paypal-chargeback|amex-chargeback|visa-mastercard-chargeback|klarna-reklamation|flug-chargeback|kiwi-rueckerstattung|lieferando-rueckerstattung|wolt-rueckerstattung|ubereats-rueckerstattung|ware-nicht-erhalten|abo-falle-chargeback)$/,
    title: "Chargeback-Ratgeber 2026 · ChargebackPilot",
    description:
      "Konkrete Schritt-für-Schritt-Hilfen für Rückerstattung, Chargeback und Käuferschutz je nach Zahlungsart und Problemfall.",
  },
  {
    match: /^\/scam-shops-2026$/,
    title: "Bekannte Scam-Muster & Fake-Shops 2026 — was du jetzt tun kannst | ChargebackPilot",
    description:
      "Verdacht auf Fake-Shop oder Internet-Betrug? Die wichtigsten Warnsignale 2026 plus strukturierte Anleitung zu Chargeback, PayPal-Käuferschutz und Lastschriftrückruf.",
  },
  {
    match: /^\/hilfe\//,
    title: "Händler-spezifische Hilfe bei Reklamationen · ChargebackPilot",
    description:
      "Konkrete Leitfäden zu typischen Problemen bei bekannten Händlern inklusive Beweis-Checkliste und Eskalationspfad.",
  },
  {
    match: /^\/vergleich\//,
    title: "Vergleich: PayPal vs Kreditkarte vs Klarna · ChargebackPilot",
    description:
      "Welcher Weg ist in deinem Fall am besten? Vergleich von Fristen, Erfolgschancen und Vorgehen bei Rückerstattungen.",
  },
];

const defaultMeta = {
  title: "ChargebackPilot · Chargeback & Reklamationshilfe",
  description:
    "ChargebackPilot unterstützt dich mit KI-gestützter Formulierungshilfe für Rückerstattungen und Reklamationen.",
};

const origin = "https://chargebackpilot.de";

function renderSeoHtml(pathname: string) {
  const raw = fs.readFileSync(indexPath, "utf-8");
  const current = metaByPath.find((m) => m.match.test(pathname));
  const effective = current ?? defaultMeta;
  const isKnownRoute = Boolean(current);
  const isNoindex = current?.noindex === true || !isKnownRoute;
  const title = escapeHtml(effective.title);
  const description = escapeHtml(effective.description);
  const canonical = `${origin}${pathname}`;
  const robots = isNoindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const googlebot = isNoindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1";

  const html = raw
    .replace(/<title>.*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/>/i, `<meta name="description" content="${description}" />`)
    .replace(/<meta name="robots" content=".*?"\s*\/>/i, `<meta name="robots" content="${robots}" />`)
    .replace(/<meta name="googlebot" content=".*?"\s*\/>/i, `<meta name="googlebot" content="${googlebot}" />`)
    .replace(/<meta property="og:title" content=".*?"\s*\/>/i, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?"\s*\/>/i, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content=".*?"\s*\/>/i, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content=".*?"\s*\/>/i, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\s*\/>/i, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/>/i, `<link rel="canonical" href="${canonical}" />`);

  return { html, isKnownRoute };
}

app.use(express.static(staticDir, {
  index: false,
  redirect: false,
  setHeaders: (res, filePath) => {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return;
    }
    if (filePath.includes(`${path.sep}fonts${path.sep}inter${path.sep}`)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));
app.get(/(.*)/, (req, res) => {
  const prerenderedPath = req.path === "/"
    ? indexPath
    : path.join(staticDir, req.path, "index.html");
  if (fs.existsSync(prerenderedPath)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
    res.status(200).send(fs.readFileSync(prerenderedPath, "utf-8"));
    return;
  }

  const { html, isKnownRoute } = renderSeoHtml(req.path || "/");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=3600");
  res.status(isKnownRoute ? 200 : 404).send(html);
});

export default app;
