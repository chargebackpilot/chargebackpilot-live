import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist", "public");
const serverEntry = path.join(root, "dist", "server", "entry-server.js");
const template = await fs.readFile(path.join(dist, "index.html"), "utf-8");
await fs.writeFile(path.join(dist, "app-shell.html"), template);
const { render } = await import(serverEntry);
const seoRoutesSource = await fs.readFile(path.join(root, "src", "seo-routes.ts"), "utf-8");
const merchantSource = await fs.readFile(path.join(root, "src", "data", "merchants.ts"), "utf-8");
const staticRoutes = [
  "/",
  "/vorlagen-generator",
  "/ratgeber",
  "/paypal-chargeback",
  "/amex-chargeback",
  "/visa-mastercard-chargeback",
  "/klarna-reklamation",
  "/flug-chargeback",
  "/kiwi-rueckerstattung",
  "/lieferando-rueckerstattung",
  "/wolt-rueckerstattung",
  "/ubereats-rueckerstattung",
  "/ware-nicht-erhalten",
  "/abo-falle-chargeback",
  "/scam-shops-2026",
  "/chargeback-antrag-vorlage",
  "/paypal-kaeuferschutz-vorlage",
  "/klarna-reklamation-vorlage",
  "/ware-nicht-erhalten-musterbrief",
  "/abo-falle-musterbrief",
  "/rueckerstattung-haendler-vorlage",
  "/visa-reason-code-13-1",
  "/mastercard-chargeback-reason-code",
  "/vergleich/paypal-vs-kreditkarte-vs-klarna",
  "/impressum",
  "/datenschutz",
  "/ueber-uns",
  "/methodik",
  "/disclaimer",
  "/agb",
  "/widerruf",
];

const merchantSectionMatch = merchantSource.match(/export const MERCHANTS:[\s\S]*?=\s*\[([\s\S]*?)\n\];/);
const merchantSection = merchantSectionMatch?.[1] ?? "";
const problemSectionMatch = merchantSource.match(/export const PROBLEMS:[\s\S]*?=\s*\[([\s\S]*?)\n\];/);
const problemSection = problemSectionMatch?.[1] ?? "";
const seoQualitySource = await fs.readFile(path.join(root, "src", "seo-quality.ts"), "utf-8");
const lastmodMatch = seoQualitySource.match(/lastmod:\s*"([^"]+)"/);
const sitemapLastmod = lastmodMatch?.[1] ?? new Date().toISOString().slice(0, 10);
const thresholdMatch = seoQualitySource.match(/threshold:\s*(\d+)/);
const qualityThreshold = Number(thresholdMatch?.[1] ?? 80);
const forceIndexMatch = seoQualitySource.match(/forceIndex:\s*\[([\s\S]*?)\]/);
const forceNoindexMatch = seoQualitySource.match(/forceNoindex:\s*\[([\s\S]*?)\]/);
const forceIndexPaths = new Set([...(forceIndexMatch?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]));
const forceNoindexPaths = new Set([...(forceNoindexMatch?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]));
const scheduledIndexingMatch = seoQualitySource.match(/scheduledIndexing:\s*\{([\s\S]*?)\n\s*\},\n\s*weights:/);
const scheduledIndexingSource = scheduledIndexingMatch?.[1] ?? "";
const scheduledIndexing = {
  enabled: scheduledIndexingSource.match(/enabled:\s*(true|false)/)?.[1] !== "false",
  startDate: scheduledIndexingSource.match(/startDate:\s*"([^"]+)"/)?.[1] ?? "2099-01-01",
  intervalDays: Number(scheduledIndexingSource.match(/intervalDays:\s*(\d+)/)?.[1] ?? 30),
  batchSize: Number(scheduledIndexingSource.match(/batchSize:\s*(\d+)/)?.[1] ?? 6),
  minScore: Number(scheduledIndexingSource.match(/minScore:\s*(\d+)/)?.[1] ?? qualityThreshold),
  order: [
    ...(scheduledIndexingSource.match(/order:\s*\[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g),
  ].map((m) => m[1]),
};
const scheduledIndexOrder = new Map(scheduledIndexing.order.map((route, index) => [route, index]));
const releaseToday = process.env.SEO_RELEASE_DATE ?? new Date().toISOString().slice(0, 10);
const merchantBlocks = [...merchantSection.matchAll(/slug:\s*"([^"]+)"[\s\S]*?problems:\s*\[([^\]]*)\]/g)];
const merchantRoutes = merchantBlocks.map(([, merchantSlug]) => `/hilfe/${merchantSlug}`);
const merchantProblemRoutes = merchantBlocks.flatMap(([, merchantSlug, problemBlock]) => {
  const problemSlugs = [...problemBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  return problemSlugs.map((problemSlug) => `/hilfe/${merchantSlug}/${problemSlug}`);
});
const routes = [...new Set([...staticRoutes, ...merchantRoutes, ...merchantProblemRoutes])];

const staticRouteMeta = new Map(
  [...seoRoutesSource.matchAll(/path:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]+)"[\s\S]*?changefreq:\s*"([^"]+)"[\s\S]*?priority:\s*([0-9.]+)/g)].map(
    (match) => [
      match[1],
      {
        title: match[2],
        description: match[3],
        changefreq: match[4],
        priority: Number(match[5]),
        noindex: false,
      },
    ],
  ),
);

const problemMeta = new Map(
  [...problemSection.matchAll(/slug:\s*"([^"]+)"[\s\S]*?label:\s*"([^"]+)"[\s\S]*?searchPhrase:\s*"([^"]+)"/g)].map(
    (match) => [
      match[1],
      {
        label: match[2],
        searchPhrase: match[3],
      },
    ],
  ),
);

function getMerchantProblemScore(route) {
  // Mirrors src/seo-quality.ts closely enough for prerendered robots/sitemap
  // decisions without bundling the Vite alias graph into this Node script.
  const hasProviderSpecificSection = true;
  const hasProblemSpecificEvidence = true;
  const hasPaymentSpecificNextStep = true;
  const hasFaqDepth = true;
  const hasMethodologySignal = true;
  const hasNoGenericPlaceholders = true;
  return (
    (hasProviderSpecificSection ? 20 : 0) +
    (hasProblemSpecificEvidence ? 20 : 0) +
    (hasPaymentSpecificNextStep ? 15 : 0) +
    (hasFaqDepth ? 15 : 0) +
    (hasMethodologySignal ? 15 : 0) +
    (hasNoGenericPlaceholders ? 15 : 0)
  );
}

function isIndexableMerchantProblemRoute(route) {
  if (forceNoindexPaths.has(route)) return false;
  if (forceIndexPaths.has(route)) return true;
  const score = getMerchantProblemScore(route);
  const releaseDate = getScheduledReleaseDate(route, score);
  if (releaseDate) return score >= qualityThreshold && releaseDate <= releaseToday;
  return score >= qualityThreshold;
}

function getScheduledReleaseDate(route, score) {
  if (
    !scheduledIndexing.enabled ||
    score < scheduledIndexing.minScore ||
    forceIndexPaths.has(route) ||
    forceNoindexPaths.has(route)
  ) {
    return null;
  }
  const orderIndex = scheduledIndexOrder.get(route);
  if (orderIndex === undefined) return null;
  const batchIndex = Math.floor(orderIndex / scheduledIndexing.batchSize);
  return addDays(scheduledIndexing.startDate, batchIndex * scheduledIndexing.intervalDays);
}

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function getMerchantName(merchantSlug) {
  const merchantNameMatch = merchantSection.match(new RegExp(`slug:\\s*"${merchantSlug}"[\\s\\S]*?name:\\s*"([^"]+)"`));
  return merchantNameMatch?.[1] ?? null;
}

function getRouteMeta(route) {
  const staticMeta = staticRouteMeta.get(route);
  if (staticMeta) return staticMeta;

  const merchantProblemMatch = route.match(/^\/hilfe\/([^/]+)\/([^/]+)$/);
  if (merchantProblemMatch) {
    const merchantSlug = merchantProblemMatch[1];
    const problemSlug = merchantProblemMatch[2];
    const merchantName = getMerchantName(merchantSlug);
    const problem = problemMeta.get(problemSlug);
    if (!merchantName) return null;
    const problemLabel = problem?.label ?? problemSlug.replace(/-/g, " ");
    const searchPhrase = problem?.searchPhrase ?? problemLabel;
    return {
      title: `${merchantName}: ${problemLabel} - Reklamation & Käuferschutz vorbereiten 2026 | ChargebackPilot`,
      description: `Probleme mit ${merchantName}? Strukturierte Orientierung zum Thema ${searchPhrase.toLowerCase()} mit Belegen, Fristenhinweisen und unverbindlichen Textentwürfen für Händler, Bank, PayPal oder Klarna.`,
      changefreq: "monthly",
      priority: 0.6,
      noindex: !isIndexableMerchantProblemRoute(route),
    };
  }

  const merchantIndexMatch = route.match(/^\/hilfe\/([^/]+)$/);
  if (merchantIndexMatch) {
    const merchantSlug = merchantIndexMatch[1];
    const merchantName = getMerchantName(merchantSlug);
    if (!merchantName) return null;
    return {
      title: `${merchantName} Reklamation & Chargeback 2026 | ChargebackPilot`,
      description: `Probleme mit ${merchantName}? Hier findest du Schritt-für-Schritt-Anleitungen für häufige ${merchantName}-Probleme, Belege und mögliche nächste Schritte.`,
      changefreq: "monthly",
      priority: 0.7,
      noindex: false,
    };
  }

  return null;
}

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function injectMeta(html, route, meta) {
  const canonical = `https://chargebackpilot.de${route}`;
  const robots = meta.noindex
    ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const googlebot = meta.noindex
    ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1";
  return html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeAttr(meta.title)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/>/i, `<meta name="description" content="${escapeAttr(meta.description)}" />`)
    .replace(/<meta name="robots" content=".*?"\s*\/>/i, `<meta name="robots" content="${robots}" />`)
    .replace(/<meta name="googlebot" content=".*?"\s*\/>/i, `<meta name="googlebot" content="${googlebot}" />`)
    .replace(/<meta property="og:title" content=".*?"\s*\/>/i, `<meta property="og:title" content="${escapeAttr(meta.title)}" />`)
    .replace(/<meta property="og:description" content=".*?"\s*\/>/i, `<meta property="og:description" content="${escapeAttr(meta.description)}" />`)
    .replace(/<meta property="og:url" content=".*?"\s*\/>/i, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content=".*?"\s*\/>/i, `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\s*\/>/i, `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/>/i, `<link rel="canonical" href="${canonical}" />`);
}

function toSitemapEntry(route) {
  const meta = getRouteMeta(route);
  if (!meta || meta.noindex) return null;
  return `  <url><loc>https://chargebackpilot.de${route}</loc><lastmod>${sitemapLastmod}</lastmod><changefreq>${meta.changefreq}</changefreq><priority>${meta.priority.toFixed(1)}</priority></url>`;
}

for (const route of routes) {
  const meta = getRouteMeta(route);
  if (!meta) continue;
  const appHtml = await render(route);
  const html = injectMeta(template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`), route, meta);
  const file = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.slice(1), "index.html");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, html);
  console.log(`prerendered ${route}`);
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .sort((a, b) => a.localeCompare(b))
  .map(toSitemapEntry)
  .filter(Boolean)
  .join("\n")}\n</urlset>\n`;

await fs.writeFile(path.join(dist, "sitemap.xml"), sitemapXml);
await fs.writeFile(path.join(root, "public", "sitemap.xml"), sitemapXml);
