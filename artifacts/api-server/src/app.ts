import express, { type Express } from "express";
import path from "node:path";
import fs from "node:fs";
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
