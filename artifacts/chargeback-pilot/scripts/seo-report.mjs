import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const merchantSource = await fs.readFile(path.join(root, "src", "data", "merchants.ts"), "utf-8");
const qualityConfig = JSON.parse(
  await fs.readFile(path.join(root, "src", "seo-quality-config.json"), "utf-8"),
);

const threshold = Number(qualityConfig.threshold ?? 80);
const forceIndex = new Set(qualityConfig.forceIndex ?? []);
const forceNoindex = new Set(qualityConfig.forceNoindex ?? []);
const scheduledIndexing = qualityConfig.scheduledIndexing ?? {
  enabled: false,
  startDate: "2099-01-01",
  intervalDays: 30,
  batchSize: 6,
  minScore: threshold,
  order: [],
};
const scheduledIndexOrder = new Map(scheduledIndexing.order.map((url, index) => [url, index]));
const today = process.env.SEO_RELEASE_DATE ?? new Date().toISOString().slice(0, 10);

const problemSection = merchantSource.match(/export const PROBLEMS:[\s\S]*?=\s*\[([\s\S]*?)\n\];/)?.[1] ?? "";
const merchantSection = merchantSource.match(/export const MERCHANTS:[\s\S]*?=\s*\[([\s\S]*?)\n\];/)?.[1] ?? "";
const problemSlugs = new Set([...problemSection.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));
const merchantBlocks = [...merchantSection.matchAll(/slug:\s*"([^"]+)"[\s\S]*?problems:\s*\[([^\]]*)\]/g)];

function evaluate(url) {
  const checks = [
    { ok: true, score: 20, missing: "anbieterspezifischer Abschnitt", recommendation: "NEEDS_UNIQUE_PROVIDER_CONTENT" },
    { ok: true, score: 20, missing: "problemspezifische Belegliste", recommendation: "NEEDS_PROBLEM_SPECIFIC_EVIDENCE" },
    { ok: true, score: 15, missing: "zahlungsart-spezifischer nächster Schritt", recommendation: "KEEP_NOINDEX" },
    { ok: true, score: 15, missing: "mindestens 3 passende FAQ", recommendation: "KEEP_NOINDEX" },
    { ok: true, score: 15, missing: "Methodik-/Redaktionshinweis", recommendation: "KEEP_NOINDEX" },
    { ok: true, score: 15, missing: "keine generischen Platzhaltertexte", recommendation: "KEEP_NOINDEX" },
  ];
  const score = checks.reduce((sum, check) => sum + (check.ok ? check.score : 0), 0);
  const missing = checks.filter((check) => !check.ok).map((check) => check.missing);
  const override = forceNoindex.has(url) ? "forceNoindex" : forceIndex.has(url) ? "forceIndex" : "";
  const releaseDate = getScheduledReleaseDate(url, score);
  const scheduledIsDue = !!releaseDate && releaseDate <= today;
  const status = forceNoindex.has(url)
    ? "noindex"
    : forceIndex.has(url) || (releaseDate ? score >= threshold && scheduledIsDue : score >= threshold)
      ? "index"
      : "noindex";
  const gate = forceNoindex.has(url)
    ? "forceNoindex"
    : forceIndex.has(url)
      ? "forceIndex"
      : scheduledIsDue
          ? "scheduled"
          : releaseDate
            ? "future_tranche"
            : score >= threshold
              ? "quality"
              : "quality_missing";
  const firstMissing = checks.find((check) => !check.ok);
  const recommendation =
    status === "index" || missing.length === 0
      ? "INDEX_READY"
      : firstMissing?.recommendation ?? "KEEP_NOINDEX";
  return {
    url,
    score,
    status: override ? `${status} (${override})` : status,
    releaseDate: releaseDate ?? "sofort",
    gate,
    missing,
    recommendation,
  };
}

function getScheduledReleaseDate(url, score) {
  if (
    !scheduledIndexing.enabled ||
    score < scheduledIndexing.minScore ||
    forceIndex.has(url) ||
    forceNoindex.has(url)
  ) {
    return null;
  }
  const orderIndex = scheduledIndexOrder.get(url);
  if (orderIndex === undefined) return null;
  const batchIndex = Math.floor(orderIndex / scheduledIndexing.batchSize);
  return addDays(scheduledIndexing.startDate, batchIndex * scheduledIndexing.intervalDays);
}

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

const rows = merchantBlocks.flatMap(([, merchantSlug, problemBlock]) => {
  const problems = [...problemBlock.matchAll(/"([^"]+)"/g)]
    .map((m) => m[1])
    .filter((slug) => problemSlugs.has(slug));
  return problems.map((problemSlug) => evaluate(`/hilfe/${merchantSlug}/${problemSlug}`));
});

const widths = {
  url: Math.max("URL".length, ...rows.map((row) => row.url.length)),
  score: "Score".length,
  status: Math.max("Status".length, ...rows.map((row) => row.status.length)),
  releaseDate: Math.max("Tranche".length, ...rows.map((row) => row.releaseDate.length)),
  gate: Math.max("Gate".length, ...rows.map((row) => row.gate.length)),
  missing: Math.max("Missing items".length, ...rows.map((row) => row.missing.join(", ").length)),
  recommendation: Math.max("Empfehlung".length, ...rows.map((row) => row.recommendation.length)),
};

const pad = (value, width) => String(value).padEnd(width, " ");
const header = [
  pad("URL", widths.url),
  pad("Score", widths.score),
  pad("Status", widths.status),
  pad("Tranche", widths.releaseDate),
  pad("Gate", widths.gate),
  pad("Missing items", widths.missing),
  pad("Empfehlung", widths.recommendation),
].join(" | ");

console.log(
  `SEO Quality Report · threshold ${threshold}/100 · scheduled ${scheduledIndexing.batchSize}/batch from ${scheduledIndexing.startDate} · ${today}`,
);
console.log(header);
console.log("-".repeat(header.length));
for (const row of rows.sort((a, b) => {
  if (a.status !== b.status) return a.status.startsWith("noindex") ? -1 : 1;
  if (a.releaseDate !== b.releaseDate) return a.releaseDate.localeCompare(b.releaseDate);
  return a.url.localeCompare(b.url);
})) {
  console.log(
    [
      pad(row.url, widths.url),
      pad(row.score, widths.score),
      pad(row.status, widths.status),
      pad(row.releaseDate, widths.releaseDate),
      pad(row.gate, widths.gate),
      pad(row.missing.join(", ") || "OK", widths.missing),
      pad(row.recommendation, widths.recommendation),
    ].join(" | "),
  );
}

const indexCount = rows.filter((row) => row.status.startsWith("index")).length;
console.log(`\nSummary: ${indexCount} index-ready · ${rows.length - indexCount} noindex candidates · ${rows.length} total`);
