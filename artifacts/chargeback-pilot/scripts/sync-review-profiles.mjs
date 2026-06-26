import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "src", "data", "review-profiles.generated.json");

const PROFILE_URLS = {
  provenExpert: "https://www.provenexpert.com/de-de/chargebackpilot/",
  trustpilot: "https://de.trustpilot.com/review/chargebackpilot.de",
};

const CURATED_FALLBACK_PROFILES = {
  trustpilot: {
    name: "Trustpilot",
    url: PROFILE_URLS.trustpilot,
    rating: 3.6,
    ratingLabel: "3,6",
    reviewCount: 1,
    reviewLabel: "1 Bewertung",
    sourceUpdatedLabel: "26.06.2026",
  },
};

const REQUEST_TIMEOUT_MS = 12000;

function germanDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function numberLabel(value, fractionDigits = 2) {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß");
}

function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "ChargebackPilot review sync (+https://chargebackpilot.de; deployment quality check)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseGermanNumber(value) {
  return Number(value.replace(/\./g, "").replace(",", "."));
}

function parseProvenExpert(html) {
  const text = htmlToText(html);
  const ratingMatch = text.match(/(\d,\d{2})\s+von\s+5/);
  const countMatch = text.match(/(\d+)\s+Bewertungen/);
  const sourceUpdatedMatch = text.match(/Letzte Aktualisierung:\s*(\d{2}\.\d{2}\.\d{4})/);
  if (!ratingMatch || !countMatch) {
    throw new Error("ProvenExpert rating data not found");
  }

  const rating = parseGermanNumber(ratingMatch[1]);
  const reviewCount = Number(countMatch[1]);

  return {
    name: "ProvenExpert",
    url: PROFILE_URLS.provenExpert,
    rating,
    ratingLabel: numberLabel(rating),
    reviewCount,
    reviewLabel: `${reviewCount} ${reviewCount === 1 ? "Bewertung" : "Bewertungen"}`,
    sourceUpdatedLabel: sourceUpdatedMatch?.[1] ?? null,
  };
}

function parseTrustpilot(html) {
  const text = htmlToText(html);
  const countMatch =
    text.match(/Chargebackpilot\s+Bewertungen\s+(\d+)/i) ?? text.match(/\((\d+)\)\s+Bewertungen/i);
  const ratingMatch = text.match(/\b(\d,\d)\b/);
  const reviewCount = countMatch ? Number(countMatch[1]) : 0;
  const rating = ratingMatch ? parseGermanNumber(ratingMatch[1]) : 0;

  return {
    name: "Trustpilot",
    url: PROFILE_URLS.trustpilot,
    rating,
    ratingLabel: numberLabel(rating, 1),
    reviewCount,
    reviewLabel:
      reviewCount > 0
        ? `${reviewCount} ${reviewCount === 1 ? "Bewertung" : "Bewertungen"}`
        : "Noch keine Bewertungen",
    sourceUpdatedLabel: null,
  };
}

function removeDisplayOnlyStatusLabels(profiles) {
  return Object.fromEntries(
    Object.entries(profiles).map(([key, profile]) => {
      if (!profile || typeof profile !== "object") return [key, profile];
      const { statusLabel: _statusLabel, ...rest } = profile;
      return [key, rest];
    })
  );
}

async function readExisting() {
  try {
    return JSON.parse(await fs.readFile(outputPath, "utf-8"));
  } catch {
    return {
      checkedAt: new Date().toISOString().slice(0, 10),
      checkedAtLabel: germanDateLabel(),
      profiles: {},
    };
  }
}

async function main() {
  const existing = await readExisting();
  const checkedAt = new Date();
  const next = {
    ...existing,
    checkedAt: checkedAt.toISOString().slice(0, 10),
    checkedAtLabel: germanDateLabel(checkedAt),
    profiles: {
      ...existing.profiles,
    },
  };

  const tasks = [
    ["provenExpert", PROFILE_URLS.provenExpert, parseProvenExpert],
    ["trustpilot", PROFILE_URLS.trustpilot, parseTrustpilot],
  ];

  for (const [key, url, parse] of tasks) {
    try {
      const html = await fetchText(url);
      next.profiles[key] = parse(html);
      console.log(`review sync: ${key} updated`);
    } catch (error) {
      const fallback = CURATED_FALLBACK_PROFILES[key];
      const current = next.profiles[key];
      if (
        fallback &&
        (!current ||
          typeof current.rating !== "number" ||
          typeof current.reviewCount !== "number" ||
          current.rating <= 0 ||
          current.reviewCount <= 0)
      ) {
        next.profiles[key] = fallback;
        console.warn(`review sync: ${key} used curated fallback (${error.message})`);
      } else {
        console.warn(`review sync: ${key} kept fallback (${error.message})`);
      }
    }
  }

  next.profiles = removeDisplayOnlyStatusLabels(next.profiles);

  await fs.writeFile(outputPath, `${JSON.stringify(next, null, 2)}\n`);
}

await main();
