import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "artifacts", "chargeback-pilot", "dist", "public");
const MANIFEST = join(ROOT, "artifacts", "chargeback-pilot", "dist", "seo-release-manifest.json");
const SITEMAP = join(DIST, "sitemap.xml");
const SITE = "https://chargebackpilot.de";

const ROUTES = [
  "/",
  "/ratgeber",
  "/hilfe/apple",
  "/hilfe/apple/abbuchung-ohne-zustimmung",
  "/hilfe/uber-eats",
  "/hilfe/uber-eats/ware-nicht-erhalten",
  "/scam-shops-2026",
  "/chargeback-antrag-vorlage",
  "/admin",
];

function fail(message) {
  console.error(`SEO smoke failed: ${message}`);
  process.exitCode = 1;
}

function htmlPath(route) {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.slice(1), "index.html");
}

function readHtml(route) {
  if (route === "/admin") return "";
  const file = htmlPath(route);
  if (!existsSync(file)) {
    fail(`${route} missing prerendered HTML at ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function match(html, pattern) {
  return html.match(pattern)?.[1] ?? "";
}

if (!existsSync(SITEMAP) || !existsSync(MANIFEST)) {
  fail("run the frontend build before pnpm seo:smoke");
} else {
  const sitemap = readFileSync(SITEMAP, "utf8");
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const manifestRoutes = manifest.routes ?? [];
  const indexableMerchantDetails = manifestRoutes.filter(
    (route) => route.indexable && /^\/hilfe\/[^/]+\/[^/]+$/.test(route.path)
  );
  const sitemapMerchantDetails = [...sitemap.matchAll(/<loc>https:\/\/chargebackpilot\.de(\/hilfe\/[^/]+\/[^<]+)<\/loc>/g)]
    .map((entry) => entry[1])
    .filter((route) => /^\/hilfe\/[^/]+\/[^/]+$/.test(route));

  if (sitemap.includes(`${SITE}/admin`)) fail("/admin must not be in sitemap.xml");
  if (sitemap.includes("noindex")) fail("sitemap.xml must not contain noindex markers");
  if (sitemapMerchantDetails.length !== indexableMerchantDetails.length) {
    fail(
      `merchant detail sitemap mismatch: sitemap=${sitemapMerchantDetails.length}, manifest=${indexableMerchantDetails.length}`
    );
  }

  const rows = ROUTES.map((route) => {
    const html = readHtml(route);
    if (route === "/admin") {
      return {
        route,
        robots: "server fallback: noindex",
        jsonLd: 0,
        title: "Admin route excluded from sitemap",
      };
    }
    const title = match(html, /<title>(.*?)<\/title>/i);
    const robots = match(html, /<meta name="robots" content="([^"]+)"/i);
    const canonical = match(html, /<link rel="canonical" href="([^"]+)"/i);
    const jsonLdCount = (html.match(/application\/ld\+json/g) ?? []).length;
    const shouldNoindex = route === "/admin";

    if (!title) fail(`${route} has no title`);
    if (!canonical && route !== "/admin") fail(`${route} has no canonical`);
    if (shouldNoindex && !robots.includes("noindex")) fail(`${route} must be noindex`);
    if (!shouldNoindex && !robots.includes("index, follow")) fail(`${route} must be indexable`);
    if (!shouldNoindex && canonical !== `${SITE}${route}`) {
      fail(`${route} canonical mismatch: ${canonical}`);
    }

    return {
      route,
      robots,
      jsonLd: jsonLdCount,
      title: title.slice(0, 64),
    };
  });

  console.table(rows);
  console.log(
    `Sitemap OK: ${sitemapMerchantDetails.length} indexable merchant detail pages, lastmod ${manifest.lastmod}`
  );
}
