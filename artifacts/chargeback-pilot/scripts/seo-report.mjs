import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSeoQualityRuntime } from "./seo-quality-runtime.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const runtime = await loadSeoQualityRuntime(root);
const threshold = runtime.threshold;
const scheduledIndexing = runtime.schedule;
const today = runtime.today;
const rows = runtime.getAllResults().map((row) => ({
  ...row,
  status: row.override ? `${row.status} (${row.override})` : row.status,
  releaseDate: row.releaseDate ?? "sofort",
  gate: row.gateReason,
}));

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
