import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSeoQualityRuntime } from "./seo-quality-runtime.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist", "public");
const serverEntry = path.join(root, "dist", "server", "entry-server.js");
const template = await fs.readFile(path.join(dist, "index.html"), "utf-8");
await fs.writeFile(path.join(dist, "app-shell.html"), template);
const { render } = await import(serverEntry);
const seoRoutesSource = await fs.readFile(path.join(root, "src", "seo-routes.ts"), "utf-8");
const seoQualityConfig = JSON.parse(
  await fs.readFile(path.join(root, "src", "seo-quality-config.json"), "utf-8"),
);
const seoRuntime = await loadSeoQualityRuntime(root, seoQualityConfig);
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

const sitemapLastmod = seoQualityConfig.lastmod ?? new Date().toISOString().slice(0, 10);
const merchantRoutes = seoRuntime.merchants.map((merchant) => `/hilfe/${merchant.slug}`);
const merchantProblemRoutes = seoRuntime.merchants.flatMap((merchant) =>
  merchant.problems.map((problemSlug) => `/hilfe/${merchant.slug}/${problemSlug}`),
);
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

function isIndexableMerchantProblemRoute(route) {
  return seoRuntime.isIndexableUrl(route);
}

function getRouteMeta(route) {
  const staticMeta = staticRouteMeta.get(route);
  if (staticMeta) return staticMeta;

  const merchantProblemMatch = route.match(/^\/hilfe\/([^/]+)\/([^/]+)$/);
  if (merchantProblemMatch) {
    const merchantSlug = merchantProblemMatch[1];
    const problemSlug = merchantProblemMatch[2];
    const merchant = seoRuntime.merchantsBySlug.get(merchantSlug);
    const problem = seoRuntime.problemsBySlug.get(problemSlug);
    if (!merchant || !problem || !merchant.problems.includes(problem.slug)) return null;
    const copy = seoRuntime.generateCopy(merchant, problem);
    return {
      title: `${copy.title} | ChargebackPilot`,
      description: copy.metaDescription,
      changefreq: "monthly",
      priority: 0.6,
      noindex: !isIndexableMerchantProblemRoute(route),
    };
  }

  const merchantIndexMatch = route.match(/^\/hilfe\/([^/]+)$/);
  if (merchantIndexMatch) {
    const merchantSlug = merchantIndexMatch[1];
    const merchant = seoRuntime.merchantsBySlug.get(merchantSlug);
    if (!merchant) return null;
    const merchantSeo = seoRuntime.getMerchantIndexSeo(merchant);
    return {
      title: merchantSeo.title,
      description: merchantSeo.description,
      changefreq: "monthly",
      priority: 0.7,
      noindex: false,
    };
  }

  return null;
}

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function replaceMetaTag(html, attrName, attrValue, content) {
  const tagPattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attrName}="${escapeRegExp(attrValue)}")[^>]*>`,
    "i",
  );
  return html.replace(
    tagPattern,
    `<meta ${attrName}="${attrValue}" content="${escapeAttr(content)}" />`,
  );
}

function replaceCanonicalTag(html, href) {
  return html.replace(
    /<link\b(?=[^>]*\brel="canonical")[^>]*>/i,
    `<link rel="canonical" href="${href}" />`,
  );
}

function injectMeta(html, route, meta) {
  const canonical = `https://chargebackpilot.de${route}`;
  const robots = meta.noindex
    ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const googlebot = meta.noindex
    ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1";
  let next = html.replace(/<title>.*?<\/title>/i, `<title>${escapeAttr(meta.title)}</title>`);
  next = replaceMetaTag(next, "name", "description", meta.description);
  next = replaceMetaTag(next, "name", "robots", robots);
  next = replaceMetaTag(next, "name", "googlebot", googlebot);
  next = replaceMetaTag(next, "property", "og:title", meta.title);
  next = replaceMetaTag(next, "property", "og:description", meta.description);
  next = replaceMetaTag(next, "property", "og:url", canonical);
  next = replaceMetaTag(next, "name", "twitter:title", meta.title);
  next = replaceMetaTag(next, "name", "twitter:description", meta.description);
  return replaceCanonicalTag(next, canonical);
}

function toSitemapEntry(route) {
  const meta = getRouteMeta(route);
  if (!meta || meta.noindex) return null;
  return `  <url><loc>https://chargebackpilot.de${route}</loc><lastmod>${sitemapLastmod}</lastmod><changefreq>${meta.changefreq}</changefreq><priority>${meta.priority.toFixed(1)}</priority></url>`;
}

function getHtmlOutputPaths(route) {
  if (route === "/") return [path.join(dist, "index.html")];
  const relativeRoute = route.slice(1);
  return [
    path.join(dist, relativeRoute, "index.html"),
    path.join(dist, `${relativeRoute}.html`),
  ];
}

for (const route of routes) {
  const meta = getRouteMeta(route);
  if (!meta) continue;
  const appHtml = await render(route);
  const html = injectMeta(template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`), route, meta);
  for (const file of getHtmlOutputPaths(route)) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, html);
  }
  console.log(`prerendered ${route}`);
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .sort((a, b) => a.localeCompare(b))
  .map(toSitemapEntry)
  .filter(Boolean)
  .join("\n")}\n</urlset>\n`;

const releaseManifest = {
  generatedAt: new Date().toISOString(),
  lastmod: sitemapLastmod,
  threshold: seoRuntime.threshold,
  routes: routes.flatMap((route) => {
    const meta = getRouteMeta(route);
    if (!meta) return [];
    const quality = seoRuntime.evaluateUrl(route);
    return [
      {
        path: route,
        changefreq: meta.changefreq,
        priority: meta.priority,
        indexable: !meta.noindex,
        releaseDate: quality?.releaseDate ?? null,
        forceNoindex: quality?.override === "forceNoindex",
      },
    ];
  }),
};

await fs.writeFile(path.join(dist, "sitemap.xml"), sitemapXml);
await fs.writeFile(path.join(root, "public", "sitemap.xml"), sitemapXml);
await fs.writeFile(
  path.join(root, "dist", "seo-release-manifest.json"),
  `${JSON.stringify(releaseManifest, null, 2)}\n`,
);
