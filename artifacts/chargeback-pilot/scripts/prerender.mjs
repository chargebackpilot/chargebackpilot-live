import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist", "public");
const serverEntry = path.join(root, "dist", "server", "entry-server.js");
const template = await fs.readFile(path.join(dist, "index.html"), "utf-8");
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
      },
    ],
  ),
);

function getRouteMeta(route) {
  const staticMeta = staticRouteMeta.get(route);
  if (staticMeta) return staticMeta;

  const merchantProblemMatch = route.match(/^\/hilfe\/([^/]+)\/([^/]+)$/);
  if (merchantProblemMatch) {
    const merchantSlug = merchantProblemMatch[1];
    const problemSlug = merchantProblemMatch[2];
    const merchantNameMatch = merchantSection.match(new RegExp(`slug:\\s*"${merchantSlug}"[\\s\\S]*?name:\\s*"([^"]+)"`));
    const merchantName = merchantNameMatch?.[1];
    if (!merchantName) return null;
    return {
      title: `${merchantName} ${problemSlug.replace(/-/g, " ")} — Reklamation strukturiert vorbereiten 2026 | ChargebackPilot`,
      description: `Probleme mit ${merchantName}? Strukturierte Orientierung zu ${problemSlug.replace(/-/g, " ")} mit Belegen, Fristenhinweisen und unverbindlichen Textentwürfen.`,
      changefreq: "monthly",
      priority: 0.6,
    };
  }

  const merchantIndexMatch = route.match(/^\/hilfe\/([^/]+)$/);
  if (merchantIndexMatch) {
    const merchantSlug = merchantIndexMatch[1];
    const merchantNameMatch = merchantSection.match(new RegExp(`slug:\\s*"${merchantSlug}"[\\s\\S]*?name:\\s*"([^"]+)"`));
    const merchantName = merchantNameMatch?.[1];
    if (!merchantName) return null;
    return {
      title: `${merchantName} Reklamation & Chargeback 2026 | ChargebackPilot`,
      description: `Probleme mit ${merchantName}? Hier findest du Schritt-für-Schritt-Anleitungen für häufige ${merchantName}-Probleme, Belege und mögliche nächste Schritte.`,
      changefreq: "monthly",
      priority: 0.7,
    };
  }

  return null;
}

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function injectMeta(html, route, title, description) {
  const canonical = `https://chargebackpilot.de${route}`;
  return html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeAttr(title)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/>/i, `<meta name="description" content="${escapeAttr(description)}" />`)
    .replace(/<meta property="og:title" content=".*?"\s*\/>/i, `<meta property="og:title" content="${escapeAttr(title)}" />`)
    .replace(/<meta property="og:description" content=".*?"\s*\/>/i, `<meta property="og:description" content="${escapeAttr(description)}" />`)
    .replace(/<meta property="og:url" content=".*?"\s*\/>/i, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content=".*?"\s*\/>/i, `<meta name="twitter:title" content="${escapeAttr(title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\s*\/>/i, `<meta name="twitter:description" content="${escapeAttr(description)}" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/>/i, `<link rel="canonical" href="${canonical}" />`);
}

function toSitemapEntry(route) {
  const meta = getRouteMeta(route);
  if (!meta) return null;
  return `  <url><loc>https://chargebackpilot.de${route}</loc><changefreq>${meta.changefreq}</changefreq><priority>${meta.priority.toFixed(1)}</priority></url>`;
}

for (const route of routes) {
  const meta = getRouteMeta(route);
  if (!meta) continue;
  const appHtml = await render(route);
  const html = injectMeta(template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`), route, meta.title, meta.description);
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