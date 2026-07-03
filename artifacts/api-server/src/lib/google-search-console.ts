import { createSign } from "node:crypto";
import { pool } from "@workspace/db";
import { getApiServerEnv } from "@workspace/env";
import { logger } from "./logger";

type GscRecommendation =
  | "CTR_FIX"
  | "INTERNAL_LINK_BOOST"
  | "CONTENT_REFRESH"
  | "INDEX_CHECK"
  | "WIZARD_CTA_TEST"
  | "WATCH";

type SearchAnalyticsApiRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type UrlInspectionResponse = {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      indexingState?: string;
      robotsTxtState?: string;
      pageFetchState?: string;
      googleCanonical?: string;
      userCanonical?: string;
      lastCrawlTime?: string;
    };
  };
};

type SitemapApiEntry = {
  path?: string;
  lastSubmitted?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  warnings?: string | number;
  errors?: string | number;
  contents?: unknown[];
};

const SEARCH_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const WEBMASTERS_BASE = "https://www.googleapis.com/webmasters/v3";
const INSPECTION_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const ROW_LIMIT = 25_000;
const ROW_HARD_CAP = 50_000;

const IMPORTANT_INSPECTION_PATHS = [
  "/",
  "/ratgeber",
  "/chargeback-antrag-vorlage",
  "/paypal-kaeuferschutz-vorlage",
  "/ware-nicht-erhalten-musterbrief",
  "/scam-shops-2026",
  "/vergleich/paypal-vs-kreditkarte-vs-klarna",
  "/hilfe/apple",
  "/hilfe/apple/abbuchung-ohne-zustimmung",
  "/hilfe/uber-eats",
  "/hilfe/uber-eats/ware-nicht-erhalten",
  "/hilfe/lieferando/lieferung-falsch",
  "/hilfe/amazon/ware-nicht-erhalten",
  "/hilfe/kiwi/flug-storniert",
];

let tokenCache: { token: string; expiresAt: number } | null = null;
let syncInProgress = false;

function base64Url(input: string | Buffer) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function normalizePrivateKey(value: string) {
  const normalized = value.replace(/\\n/g, "\n").trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    return normalized.slice(1, -1).trim();
  }
  return normalized;
}

function getOrigin() {
  const env = getApiServerEnv();
  if (env.GSC_SITE_URL?.startsWith("http")) {
    try {
      const url = new URL(env.GSC_SITE_URL);
      return url.origin;
    } catch {
      return "https://chargebackpilot.de";
    }
  }
  return "https://chargebackpilot.de";
}

function gscSiteUrl() {
  return getApiServerEnv().GSC_SITE_URL?.trim() || "https://chargebackpilot.de/";
}

function encodeSiteUrl(siteUrl: string) {
  return encodeURIComponent(siteUrl);
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function searchAnalyticsDateRange(now = new Date()) {
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  return { startDate: dateOnly(start), endDate: dateOnly(end) };
}

function sanitizeError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 600);
  return String(error).slice(0, 600);
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function asInt(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function pathFromUrl(value: string) {
  try {
    return new URL(value).pathname.replace(/\/$/, "") || "/";
  } catch {
    return value.replace(/\/$/, "") || "/";
  }
}

function recommendation(row: {
  path: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}): GscRecommendation {
  const utilityPaths = new Set([
    "/datenschutz",
    "/impressum",
    "/agb",
    "/widerruf",
    "/disclaimer",
    "/methodik",
    "/ueber-uns",
  ]);
  if (utilityPaths.has(row.path)) return "WATCH";
  if (row.impressions < 3) return "WATCH";
  if (row.clicks === 0 && row.position <= 8) return "CTR_FIX";
  if (row.clicks === 0 && row.position <= 12) return "WIZARD_CTA_TEST";
  if (row.position > 12 && row.position <= 30 && row.impressions >= 5) return "INTERNAL_LINK_BOOST";
  if (row.position > 30 && row.impressions >= 10) return "CONTENT_REFRESH";
  return "WATCH";
}

function inspectionRecommendation(row: {
  verdict: string | null;
  coverageState: string | null;
}): GscRecommendation {
  const verdict = row.verdict ?? "";
  const coverage = row.coverageState ?? "";
  if (verdict && verdict !== "PASS") return "INDEX_CHECK";
  if (coverage && !/indexed|submitted/i.test(coverage)) return "INDEX_CHECK";
  return "WATCH";
}

export function getGscRuntimeConfig() {
  const env = getApiServerEnv();
  const enabled = env.GSC_ENABLED === "1";
  const configured = Boolean(
    enabled && env.GSC_SITE_URL && env.GSC_CLIENT_EMAIL && env.GSC_PRIVATE_KEY
  );
  return {
    enabled,
    configured,
    siteUrl: env.GSC_SITE_URL || null,
    intervalHours: env.GSC_SYNC_INTERVAL_HOURS,
  };
}

async function getAccessToken() {
  const env = getApiServerEnv();
  if (!env.GSC_CLIENT_EMAIL || !env.GSC_PRIVATE_KEY) {
    throw new Error("Search Console service account is not configured");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.expiresAt - 60 > nowSeconds) {
    return tokenCache.token;
  }

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: env.GSC_CLIENT_EMAIL,
    scope: SEARCH_SCOPE,
    aud: TOKEN_URL,
    exp: nowSeconds + 3600,
    iat: nowSeconds,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(normalizePrivateKey(env.GSC_PRIVATE_KEY));
  const assertion = `${unsigned}.${base64Url(signature)}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Google OAuth token request failed (${response.status}): ${text.slice(0, 240)}`
    );
  }

  const json = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    throw new Error("Google OAuth token response did not include access_token");
  }

  tokenCache = {
    token: json.access_token,
    expiresAt: nowSeconds + Number(json.expires_in ?? 3600),
  };
  return json.access_token;
}

async function googleJson<T>(url: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Search Console request failed (${response.status}): ${text.slice(0, 300)}`);
  }
  return (await response.json()) as T;
}

async function fetchSearchAnalytics(siteUrl: string, startDate: string, endDate: string) {
  const rows: SearchAnalyticsApiRow[] = [];
  for (let startRow = 0; startRow < ROW_HARD_CAP; startRow += ROW_LIMIT) {
    const json = await googleJson<{ rows?: SearchAnalyticsApiRow[] }>(
      `${WEBMASTERS_BASE}/sites/${encodeSiteUrl(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["page", "query", "device", "country"],
          rowLimit: ROW_LIMIT,
          startRow,
        }),
      }
    );
    const chunk = json.rows ?? [];
    rows.push(...chunk);
    if (chunk.length < ROW_LIMIT) break;
  }
  return rows;
}

async function fetchSitemaps(siteUrl: string) {
  const json = await googleJson<{ sitemap?: SitemapApiEntry[] }>(
    `${WEBMASTERS_BASE}/sites/${encodeSiteUrl(siteUrl)}/sitemaps`
  );
  return json.sitemap ?? [];
}

async function fetchUrlInspection(siteUrl: string, inspectionUrl: string) {
  return googleJson<UrlInspectionResponse>(INSPECTION_URL, {
    method: "POST",
    body: JSON.stringify({
      inspectionUrl,
      siteUrl,
      languageCode: "de-DE",
    }),
  });
}

async function shouldSkipAutomaticSync(intervalHours: number) {
  const last = await pool.query<{ finished_at: Date }>(
    `
      SELECT finished_at
      FROM gsc_sync_runs
      WHERE status = 'success'
      ORDER BY finished_at DESC NULLS LAST, started_at DESC
      LIMIT 1
    `
  );
  const finishedAt = last.rows[0]?.finished_at;
  if (!finishedAt) return false;
  return Date.now() - finishedAt.getTime() < intervalHours * 60 * 60 * 1000;
}

async function insertSearchAnalyticsRows(
  rows: SearchAnalyticsApiRow[],
  dataFrom: string,
  dataTo: string
) {
  await pool.query(`DELETE FROM gsc_search_analytics WHERE data_from = $1 AND data_to = $2`, [
    dataFrom,
    dataTo,
  ]);

  const now = new Date();
  let inserted = 0;
  const chunkSize = 500;
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    if (chunk.length === 0) continue;

    const values: unknown[] = [];
    const placeholders = chunk.map((row, index) => {
      const keys = row.keys ?? [];
      const base = index * 11;
      values.push(
        dataFrom,
        dataTo,
        keys[0] ?? "",
        keys[1] ?? "",
        keys[2] ?? "",
        keys[3] ?? "",
        asInt(row.clicks),
        asInt(row.impressions),
        Number(row.ctr ?? 0),
        Number(row.position ?? 0),
        now
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${
        base + 6
      }, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11})`;
    });

    await pool.query(
      `
        INSERT INTO gsc_search_analytics (
          data_from, data_to, page, query, device, country,
          clicks, impressions, ctr, position, synced_at
        )
        VALUES ${placeholders.join(", ")}
        ON CONFLICT (data_from, data_to, page, query, device, country)
        DO UPDATE SET
          clicks = EXCLUDED.clicks,
          impressions = EXCLUDED.impressions,
          ctr = EXCLUDED.ctr,
          position = EXCLUDED.position,
          synced_at = EXCLUDED.synced_at
      `,
      values
    );
    inserted += chunk.length;
  }
  return inserted;
}

async function upsertSitemaps(entries: SitemapApiEntry[]) {
  for (const entry of entries) {
    if (!entry.path) continue;
    await pool.query(
      `
        INSERT INTO gsc_sitemaps (
          sitemap_url, last_submitted, is_pending, is_sitemaps_index,
          warnings, errors, contents, raw, checked_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, now())
        ON CONFLICT (sitemap_url)
        DO UPDATE SET
          last_submitted = EXCLUDED.last_submitted,
          is_pending = EXCLUDED.is_pending,
          is_sitemaps_index = EXCLUDED.is_sitemaps_index,
          warnings = EXCLUDED.warnings,
          errors = EXCLUDED.errors,
          contents = EXCLUDED.contents,
          raw = EXCLUDED.raw,
          checked_at = now()
      `,
      [
        entry.path,
        parseDate(entry.lastSubmitted),
        entry.isPending ?? null,
        entry.isSitemapsIndex ?? null,
        asInt(entry.warnings),
        asInt(entry.errors),
        JSON.stringify(entry.contents ?? []),
        JSON.stringify(entry),
      ]
    );
  }
}

async function upsertInspection(url: string, response: UrlInspectionResponse) {
  const index = response.inspectionResult?.indexStatusResult;
  await pool.query(
    `
      INSERT INTO gsc_url_inspections (
        url, verdict, coverage_state, indexing_state, robots_txt_state,
        page_fetch_state, google_canonical, user_canonical, last_crawl_time,
        raw, inspected_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, now())
      ON CONFLICT (url)
      DO UPDATE SET
        verdict = EXCLUDED.verdict,
        coverage_state = EXCLUDED.coverage_state,
        indexing_state = EXCLUDED.indexing_state,
        robots_txt_state = EXCLUDED.robots_txt_state,
        page_fetch_state = EXCLUDED.page_fetch_state,
        google_canonical = EXCLUDED.google_canonical,
        user_canonical = EXCLUDED.user_canonical,
        last_crawl_time = EXCLUDED.last_crawl_time,
        raw = EXCLUDED.raw,
        inspected_at = now()
    `,
    [
      url,
      index?.verdict ?? null,
      index?.coverageState ?? null,
      index?.indexingState ?? null,
      index?.robotsTxtState ?? null,
      index?.pageFetchState ?? null,
      index?.googleCanonical ?? null,
      index?.userCanonical ?? null,
      parseDate(index?.lastCrawlTime),
      JSON.stringify(response),
    ]
  );
}

export async function syncGoogleSearchConsole(options: { manual?: boolean; force?: boolean } = {}) {
  const config = getGscRuntimeConfig();
  if (!config.enabled) {
    return { skipped: true, reason: "disabled" as const };
  }
  if (!config.configured) {
    return { skipped: true, reason: "not_configured" as const };
  }
  if (syncInProgress) {
    return { skipped: true, reason: "already_running" as const };
  }
  if (!options.force && (await shouldSkipAutomaticSync(config.intervalHours))) {
    return { skipped: true, reason: "fresh_cache" as const };
  }

  syncInProgress = true;
  const { startDate, endDate } = searchAnalyticsDateRange();
  const run = await pool.query<{ id: number }>(
    `
      INSERT INTO gsc_sync_runs (status, manual, date_from, date_to)
      VALUES ('running', $1, $2, $3)
      RETURNING id
    `,
    [Boolean(options.manual), startDate, endDate]
  );
  const runId = run.rows[0]?.id;

  try {
    const siteUrl = gscSiteUrl();
    const analyticsRows = await fetchSearchAnalytics(siteUrl, startDate, endDate);
    const searchAnalyticsRows = await insertSearchAnalyticsRows(analyticsRows, startDate, endDate);

    const sitemaps = await fetchSitemaps(siteUrl);
    await upsertSitemaps(sitemaps);

    const origin = getOrigin();
    let inspectionCount = 0;
    for (const path of IMPORTANT_INSPECTION_PATHS) {
      const url = `${origin}${path === "/" ? "/" : path}`;
      try {
        const inspection = await fetchUrlInspection(siteUrl, url);
        await upsertInspection(url, inspection);
        inspectionCount += 1;
      } catch (error) {
        logger.warn(
          { url, error: sanitizeError(error) },
          "Search Console URL inspection failed for selected URL"
        );
      }
    }

    if (runId) {
      await pool.query(
        `
          UPDATE gsc_sync_runs
          SET
            status = 'success',
            finished_at = now(),
            search_analytics_rows = $2,
            inspection_count = $3,
            sitemap_count = $4
          WHERE id = $1
        `,
        [runId, searchAnalyticsRows, inspectionCount, sitemaps.length]
      );
    }

    logger.info(
      {
        searchAnalyticsRows,
        inspectionCount,
        sitemapCount: sitemaps.length,
        dateFrom: startDate,
        dateTo: endDate,
      },
      "Search Console sync completed"
    );

    return {
      skipped: false as const,
      dateFrom: startDate,
      dateTo: endDate,
      searchAnalyticsRows,
      inspectionCount,
      sitemapCount: sitemaps.length,
    };
  } catch (error) {
    const message = sanitizeError(error);
    if (runId) {
      await pool.query(
        `
          UPDATE gsc_sync_runs
          SET status = 'failed', finished_at = now(), error = $2
          WHERE id = $1
        `,
        [runId, message]
      );
    }
    logger.error({ error: message }, "Search Console sync failed");
    throw new Error(message);
  } finally {
    syncInProgress = false;
  }
}

export async function getGscDashboardData() {
  const config = getGscRuntimeConfig();
  const latest = await pool.query<{ data_from: string; data_to: string }>(
    `
      SELECT data_from, data_to
      FROM gsc_search_analytics
      ORDER BY data_to DESC, synced_at DESC
      LIMIT 1
    `
  );
  const latestPeriod = latest.rows[0];

  const lastSync = await pool.query<{
    status: string;
    started_at: Date;
    finished_at: Date | null;
    manual: boolean;
    date_from: string | null;
    date_to: string | null;
    search_analytics_rows: number;
    inspection_count: number;
    sitemap_count: number;
    error: string | null;
  }>(
    `
      SELECT status, started_at, finished_at, manual, date_from, date_to,
             search_analytics_rows, inspection_count, sitemap_count, error
      FROM gsc_sync_runs
      ORDER BY started_at DESC
      LIMIT 1
    `
  );

  const base = {
    enabled: config.enabled,
    configured: config.configured,
    siteUrl: config.siteUrl,
    intervalHours: config.intervalHours,
    source: "database" as const,
    generatedAt: new Date().toISOString(),
    lastSync: lastSync.rows[0]
      ? {
          status: lastSync.rows[0].status,
          startedAt: lastSync.rows[0].started_at.toISOString(),
          finishedAt: lastSync.rows[0].finished_at?.toISOString() ?? null,
          manual: lastSync.rows[0].manual,
          dateFrom: lastSync.rows[0].date_from,
          dateTo: lastSync.rows[0].date_to,
          searchAnalyticsRows: Number(lastSync.rows[0].search_analytics_rows ?? 0),
          inspectionCount: Number(lastSync.rows[0].inspection_count ?? 0),
          sitemapCount: Number(lastSync.rows[0].sitemap_count ?? 0),
          error: lastSync.rows[0].error,
        }
      : null,
  };

  if (!latestPeriod) {
    return {
      ...base,
      available: false,
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      topUrls: [],
      topQueries: [],
      opportunities: [],
      inspections: [],
      sitemaps: [],
    };
  }

  const params = [latestPeriod.data_from, latestPeriod.data_to];
  const [totals, topUrls, topQueries, opportunities, inspections, sitemaps] = await Promise.all([
    pool.query<{
      clicks: string;
      impressions: string;
      ctr: string;
      position: string;
    }>(
      `
        SELECT
          COALESCE(SUM(clicks), 0)::int AS clicks,
          COALESCE(SUM(impressions), 0)::int AS impressions,
          CASE WHEN SUM(impressions) > 0
            THEN (SUM(clicks)::float / SUM(impressions)::float) * 100
            ELSE 0
          END AS ctr,
          CASE WHEN SUM(impressions) > 0
            THEN SUM(position * impressions)::float / SUM(impressions)::float
            ELSE 0
          END AS position
        FROM gsc_search_analytics
        WHERE data_from = $1 AND data_to = $2
      `,
      params
    ),
    pool.query<{
      page: string;
      clicks: string;
      impressions: string;
      ctr: string;
      position: string;
    }>(
      `
        SELECT
          page,
          SUM(clicks)::int AS clicks,
          SUM(impressions)::int AS impressions,
          CASE WHEN SUM(impressions) > 0
            THEN (SUM(clicks)::float / SUM(impressions)::float) * 100
            ELSE 0
          END AS ctr,
          CASE WHEN SUM(impressions) > 0
            THEN SUM(position * impressions)::float / SUM(impressions)::float
            ELSE AVG(position)
          END AS position
        FROM gsc_search_analytics
        WHERE data_from = $1 AND data_to = $2
        GROUP BY page
        ORDER BY impressions DESC, position ASC
        LIMIT 30
      `,
      params
    ),
    pool.query<{
      query: string;
      clicks: string;
      impressions: string;
      ctr: string;
      position: string;
    }>(
      `
        SELECT
          query,
          SUM(clicks)::int AS clicks,
          SUM(impressions)::int AS impressions,
          CASE WHEN SUM(impressions) > 0
            THEN (SUM(clicks)::float / SUM(impressions)::float) * 100
            ELSE 0
          END AS ctr,
          CASE WHEN SUM(impressions) > 0
            THEN SUM(position * impressions)::float / SUM(impressions)::float
            ELSE AVG(position)
          END AS position
        FROM gsc_search_analytics
        WHERE data_from = $1 AND data_to = $2 AND query <> ''
        GROUP BY query
        ORDER BY impressions DESC, position ASC
        LIMIT 30
      `,
      params
    ),
    pool.query<{
      page: string;
      clicks: string;
      impressions: string;
      ctr: string;
      position: string;
    }>(
      `
        SELECT
          page,
          SUM(clicks)::int AS clicks,
          SUM(impressions)::int AS impressions,
          CASE WHEN SUM(impressions) > 0
            THEN (SUM(clicks)::float / SUM(impressions)::float) * 100
            ELSE 0
          END AS ctr,
          CASE WHEN SUM(impressions) > 0
            THEN SUM(position * impressions)::float / SUM(impressions)::float
            ELSE AVG(position)
          END AS position
        FROM gsc_search_analytics
        WHERE data_from = $1 AND data_to = $2
        GROUP BY page
        HAVING SUM(impressions) >= 3
        ORDER BY
          CASE
            WHEN SUM(clicks) = 0 AND (SUM(position * impressions)::float / NULLIF(SUM(impressions), 0)) <= 8 THEN 1
            WHEN SUM(clicks) = 0 AND (SUM(position * impressions)::float / NULLIF(SUM(impressions), 0)) <= 12 THEN 2
            WHEN (SUM(position * impressions)::float / NULLIF(SUM(impressions), 0)) BETWEEN 12 AND 30 THEN 3
            ELSE 4
          END,
          impressions DESC,
          position ASC
        LIMIT 40
      `,
      params
    ),
    pool.query<{
      url: string;
      verdict: string | null;
      coverage_state: string | null;
      indexing_state: string | null;
      robots_txt_state: string | null;
      page_fetch_state: string | null;
      last_crawl_time: Date | null;
      inspected_at: Date;
    }>(
      `
        SELECT url, verdict, coverage_state, indexing_state, robots_txt_state,
               page_fetch_state, last_crawl_time, inspected_at
        FROM gsc_url_inspections
        ORDER BY inspected_at DESC, url ASC
        LIMIT 40
      `
    ),
    pool.query<{
      sitemap_url: string;
      last_submitted: Date | null;
      is_pending: boolean | null;
      warnings: number;
      errors: number;
      checked_at: Date;
    }>(
      `
        SELECT sitemap_url, last_submitted, is_pending, warnings, errors, checked_at
        FROM gsc_sitemaps
        ORDER BY checked_at DESC, sitemap_url ASC
        LIMIT 20
      `
    ),
  ]);

  const mapPerformanceRow = (row: {
    page: string;
    clicks: string;
    impressions: string;
    ctr: string;
    position: string;
  }) => {
    const mapped = {
      path: pathFromUrl(row.page),
      url: row.page,
      clicks: Number(row.clicks ?? 0),
      impressions: Number(row.impressions ?? 0),
      ctr: Number(row.ctr ?? 0),
      position: Number(row.position ?? 0),
    };
    return { ...mapped, recommendation: recommendation(mapped) };
  };

  return {
    ...base,
    available: true,
    period: latestPeriod,
    totals: {
      clicks: Number(totals.rows[0]?.clicks ?? 0),
      impressions: Number(totals.rows[0]?.impressions ?? 0),
      ctr: Number(totals.rows[0]?.ctr ?? 0),
      position: Number(totals.rows[0]?.position ?? 0),
    },
    topUrls: topUrls.rows.map(mapPerformanceRow),
    topQueries: topQueries.rows.map((row) => ({
      query: row.query,
      clicks: Number(row.clicks ?? 0),
      impressions: Number(row.impressions ?? 0),
      ctr: Number(row.ctr ?? 0),
      position: Number(row.position ?? 0),
    })),
    opportunities: opportunities.rows.map(mapPerformanceRow),
    inspections: inspections.rows.map((row) => ({
      url: row.url,
      path: pathFromUrl(row.url),
      verdict: row.verdict,
      coverageState: row.coverage_state,
      indexingState: row.indexing_state,
      robotsTxtState: row.robots_txt_state,
      pageFetchState: row.page_fetch_state,
      lastCrawlTime: row.last_crawl_time?.toISOString() ?? null,
      inspectedAt: row.inspected_at.toISOString(),
      recommendation: inspectionRecommendation({
        verdict: row.verdict,
        coverageState: row.coverage_state,
      }),
    })),
    sitemaps: sitemaps.rows.map((row) => ({
      sitemapUrl: row.sitemap_url,
      lastSubmitted: row.last_submitted?.toISOString() ?? null,
      isPending: row.is_pending,
      warnings: Number(row.warnings ?? 0),
      errors: Number(row.errors ?? 0),
      checkedAt: row.checked_at.toISOString(),
    })),
  };
}

export function scheduleGscSync() {
  const config = getGscRuntimeConfig();
  if (!config.enabled) {
    return () => {};
  }

  const run = () => {
    syncGoogleSearchConsole({ manual: false }).catch((error) => {
      logger.error({ error: sanitizeError(error) }, "Scheduled Search Console sync failed");
    });
  };

  const initialTimer = setTimeout(run, 45_000);
  initialTimer.unref();

  const interval = setInterval(run, config.intervalHours * 60 * 60 * 1000);
  interval.unref();

  return () => {
    clearTimeout(initialTimer);
    clearInterval(interval);
  };
}
