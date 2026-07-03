import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = process.cwd();
const SEARCH_CONSOLE_DIR = join(ROOT, "SearchConsole");
const QUALITY_CONFIG = join(
  ROOT,
  "artifacts",
  "chargeback-pilot",
  "src",
  "seo-quality-config.json"
);

function findLatestCsv(prefix) {
  if (!existsSync(SEARCH_CONSOLE_DIR)) return null;
  const normalizedPrefix = prefix.toLocaleLowerCase("de-DE");
  return readdirSync(SEARCH_CONSOLE_DIR)
    .filter((file) => {
      const normalized = file.toLocaleLowerCase("de-DE");
      return normalized.startsWith(normalizedPrefix) && normalized.endsWith(".csv");
    })
    .map((file) => {
      const path = join(SEARCH_CONSOLE_DIR, file);
      return { path, mtimeMs: statSync(path).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]?.path;
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  out.push(current);
  return out;
}

function parseNumber(value) {
  if (!value) return 0;
  return Number(String(value).replace("%", "").replace(",", ".")) || 0;
}

function parseRows(file) {
  if (!file) return [];
  if (!existsSync(file)) return [];
  const lines = readFileSync(file, "utf8").trim().split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const [, ...rows] = lines;
  return rows.map(parseCsvLine);
}

function urlPath(value) {
  try {
    return new URL(value).pathname.replace(/\/$/, "") || "/";
  } catch {
    return String(value ?? "").replace(/\/$/, "") || "/";
  }
}

function loadScheduledCandidates() {
  if (!existsSync(QUALITY_CONFIG)) return new Set();
  const config = JSON.parse(readFileSync(QUALITY_CONFIG, "utf8"));
  return new Set(config?.scheduledIndexing?.order ?? []);
}

function isUtilityPath(path) {
  return [
    "/datenschutz",
    "/impressum",
    "/agb",
    "/widerruf",
    "/disclaimer",
    "/methodik",
    "/ueber-uns",
  ].includes(path);
}

function recommendation(row, scheduledCandidates) {
  const path = urlPath(row.url);
  if (isUtilityPath(path)) return "WATCH";
  if (row.impressions < 3) return "WATCH";
  if (row.clicks === 0 && row.position <= 8) return "CTR_FIX";
  if (row.clicks === 0 && row.position <= 12) return "WIZARD_CTA_TEST";
  if (scheduledCandidates.has(path) && row.position <= 15) return "INTERNAL_LINK_BOOST";
  if (row.position > 12 && row.impressions >= 10) return "INTERNAL_LINK_BOOST";
  return "WATCH";
}

function pad(value, width) {
  const str = String(value);
  if (str.length >= width) return str;
  return `${str}${" ".repeat(width - str.length)}`;
}

function formatPercent(value) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 2)}%`;
}

const pagesCsv = findLatestCsv("Seiten");
const queriesCsv = findLatestCsv("Suchanfragen");

if (!pagesCsv) {
  console.log(
    "Keine SearchConsole/Seiten*.csv gefunden. Export lokal ablegen und erneut ausführen."
  );
  process.exit(0);
}

const scheduledCandidates = loadScheduledCandidates();
const pageRows = parseRows(pagesCsv).map(([url, clicks, impressions, ctr, position]) => ({
  url,
  clicks: parseNumber(clicks),
  impressions: parseNumber(impressions),
  ctr: parseNumber(ctr),
  position: parseNumber(position),
}));

const queryRows = parseRows(queriesCsv).map(([query, clicks, impressions, ctr, position]) => ({
  query,
  clicks: parseNumber(clicks),
  impressions: parseNumber(impressions),
  ctr: parseNumber(ctr),
  position: parseNumber(position),
}));

const totals = pageRows.reduce(
  (acc, row) => ({
    clicks: acc.clicks + row.clicks,
    impressions: acc.impressions + row.impressions,
  }),
  { clicks: 0, impressions: 0 }
);

console.log(
  `SearchConsole Report · ${pageRows.length} URLs · ${totals.clicks} Klicks · ${totals.impressions} Impressionen`
);
console.log(`Quelle: SearchConsole/${basename(pagesCsv)}`);
console.log("");
console.log(
  `${pad("URL", 62)} | ${pad("Klicks", 6)} | ${pad("Impr.", 6)} | ${pad("CTR", 7)} | ${pad(
    "Pos.",
    6
  )} | Empfehlung`
);
console.log("-".repeat(124));

for (const row of pageRows
  .slice()
  .sort((a, b) => b.impressions - a.impressions || a.position - b.position)) {
  console.log(
    `${pad(urlPath(row.url), 62)} | ${pad(row.clicks, 6)} | ${pad(row.impressions, 6)} | ${pad(
      formatPercent(row.ctr),
      7
    )} | ${pad(row.position.toFixed(2), 6)} | ${recommendation(row, scheduledCandidates)}`
  );
}

if (queryRows.length > 0) {
  console.log("");
  console.log("Top sichtbare Suchanfragen nach Impressionen:");
  for (const row of queryRows
    .slice()
    .sort((a, b) => b.impressions - a.impressions || a.position - b.position)
    .slice(0, 10)) {
    console.log(
      `- ${row.query}: ${row.clicks} Klicks, ${row.impressions} Impressionen, ${formatPercent(
        row.ctr
      )} CTR, Position ${row.position.toFixed(2)}`
    );
  }
}
