import { Router, type NextFunction, type Request, type Response } from "express";
import { db, pool, casesTable, type CaseAnalysis } from "@workspace/db";
import { desc, eq, count, sql, and, gte, lt, type SQL } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { getApiServerEnv } from "@workspace/env";
import { safeCompare, sessionStore, adminAuth } from "../lib/auth";
import { logger } from "../lib/logger";
import {
  getAnalyticsRetentionMonths,
  getCaseRetentionMonths,
  getRetentionCutoff,
} from "../lib/db-maintenance";
import { getGscDashboardData, syncGoogleSearchConsole } from "../lib/google-search-console";

const env = getApiServerEnv();
const router = Router();

/**
 * Login endpoint - validates password and returns session token
 * Rate limited to prevent brute force attacks
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts
  message: {
    code: "LOGIN_RATE_LIMIT",
    message: "Zu viele Login-Versuche. Bitte 15 Minuten warten.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== "POST",
});

const MIN_ADMIN_PASSWORD_LENGTH = 15;
const ADMIN_ALLOWED_IPS = new Set(
  (process.env.ADMIN_ALLOWED_IPS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);
const ADMIN_VISIBLE_CASES_FROM = new Date(
  process.env.ADMIN_VISIBLE_CASES_FROM || "2026-06-26T00:00:00.000Z"
);
const SEARCH_CONSOLE_DIRS = [
  join(process.cwd(), "SearchConsole"),
  join(process.cwd(), "..", "SearchConsole"),
  join(process.cwd(), "..", "..", "SearchConsole"),
];

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getAdminRequestIp(req: Request) {
  return (
    firstHeaderValue(req.headers["cf-connecting-ip"] as string | string[] | undefined) ||
    firstHeaderValue(req.headers["x-forwarded-for"] as string | string[] | undefined)
      ?.split(",")[0]
      ?.trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function adminNetworkGuard(req: Request, res: Response, next: NextFunction) {
  if (ADMIN_ALLOWED_IPS.size === 0) {
    next();
    return;
  }

  const ip = getAdminRequestIp(req);
  if (!ADMIN_ALLOWED_IPS.has(ip)) {
    logger.warn({ ip }, "Admin request blocked by ADMIN_ALLOWED_IPS");
    res.status(403).json({
      code: "ADMIN_IP_BLOCKED",
      message: "Admin-Zugriff von dieser IP nicht erlaubt.",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
}

function visibleCaseWhere(extra?: SQL) {
  const base = gte(casesTable.createdAt, ADMIN_VISIBLE_CASES_FROM);
  return extra ? and(base, extra) : base;
}

function logAdminRouteError(error: unknown, message: string) {
  logger.error({ error: error instanceof Error ? error.message : String(error) }, message);
}

function sendAdminRouteError(res: Response) {
  res.status(500).json({
    error: "Admin-Daten konnten nicht geladen werden.",
    timestamp: new Date().toISOString(),
  });
}

function anonymizedAnalysis(): CaseAnalysis {
  return {
    strength: "schwach",
    strengthLabel: "Anonymisiert",
    successProbability: 0,
    successProbabilityLabel: "Anonymisiert",
    summary: "Dieser Fall wurde nach Ablauf der Aufbewahrungsfrist anonymisiert.",
    reasoning: "Personen- und fallbezogene Inhalte wurden entfernt.",
    missingEvidence: [],
    nextSteps: [],
    recommendedCategory: "Anonymisiert",
    legalBasis: [],
    counterarguments: [],
    urgencyLevel: "niedrig",
    deadline: "Anonymisiert",
    merchantTemplate: "",
    bankTemplate: "",
    escalationTemplate: "",
    disclaimer: "Anonymisiert.",
  };
}

function getStatsRangeDays(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? 30);
  return parsed === 7 || parsed === 90 ? parsed : 30;
}

function parseCsvLine(line: string) {
  const out: string[] = [];
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

function parseGscNumber(value: string | undefined) {
  return (
    Number(
      String(value ?? "")
        .replace("%", "")
        .replace(",", ".")
    ) || 0
  );
}

function gscPath(value: string | undefined) {
  try {
    return new URL(value ?? "").pathname.replace(/\/$/, "") || "/";
  } catch {
    return String(value ?? "").replace(/\/$/, "") || "/";
  }
}

function findLatestGscCsv(prefix: string) {
  const searchConsoleDir = SEARCH_CONSOLE_DIRS.find((dir) => existsSync(dir));
  if (!searchConsoleDir) return null;
  const normalizedPrefix = prefix.toLocaleLowerCase("de-DE");
  return readdirSync(searchConsoleDir)
    .filter((file) => {
      const normalized = file.toLocaleLowerCase("de-DE");
      return normalized.startsWith(normalizedPrefix) && normalized.endsWith(".csv");
    })
    .map((file) => {
      const path = join(searchConsoleDir, file);
      return { path, mtimeMs: statSync(path).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]?.path;
}

function isUtilityGscPath(path: string) {
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

function gscRecommendation(row: {
  path: string;
  clicks: number;
  impressions: number;
  position: number;
}) {
  if (isUtilityGscPath(row.path)) return "WATCH";
  if (row.impressions < 3) return "WATCH";
  if (row.clicks === 0 && row.position <= 8) return "CTR_FIX";
  if (row.clicks === 0 && row.position <= 12) return "WIZARD_CTA_TEST";
  if (row.position > 30 && row.impressions >= 10) return "CONTENT_REFRESH";
  if (row.position > 12 && row.impressions >= 10) return "INTERNAL_LINK_BOOST";
  return "WATCH";
}

function loadCsvGscOpportunities() {
  const pagesCsv = findLatestGscCsv("Seiten");
  if (!pagesCsv) {
    return {
      available: false,
      source: null as string | null,
      generatedAt: new Date().toISOString(),
      opportunities: [] as Array<{
        path: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
        recommendation: string;
      }>,
    };
  }

  const lines = readFileSync(pagesCsv, "utf8").trim().split(/\r?\n/).filter(Boolean);
  const rows = lines.slice(1).map(parseCsvLine);
  const opportunities = rows
    .map(([url, clicks, impressions, ctr, position]) => {
      const parsed = {
        path: gscPath(url),
        url,
        clicks: parseGscNumber(clicks),
        impressions: parseGscNumber(impressions),
        ctr: parseGscNumber(ctr),
        position: parseGscNumber(position),
      };
      return {
        ...parsed,
        recommendation: gscRecommendation(parsed),
      };
    })
    .filter((row) => row.impressions >= 3 || row.clicks > 0)
    .sort((a, b) => {
      const priorityOrder = [
        "CTR_FIX",
        "WIZARD_CTA_TEST",
        "INTERNAL_LINK_BOOST",
        "CONTENT_REFRESH",
        "WATCH",
      ];
      const priorityDiff =
        priorityOrder.indexOf(a.recommendation) - priorityOrder.indexOf(b.recommendation);
      if (priorityDiff !== 0) return priorityDiff;
      return b.impressions - a.impressions || a.position - b.position;
    })
    .slice(0, 25);

  return {
    available: true,
    source: basename(pagesCsv),
    generatedAt: new Date().toISOString(),
    opportunities,
  };
}

function adminCaseResponse(found: typeof casesTable.$inferSelect, readToken?: string) {
  return {
    id: String(found.id),
    paymentMethod: found.paymentMethod,
    problemType: found.problemType,
    merchantName: found.merchantName,
    amount: found.amount,
    paymentDate: found.paymentDate,
    merchantCountry: found.merchantCountry,
    merchantContacted: found.merchantContacted,
    merchantResponse: found.merchantResponse,
    evidence: found.evidence,
    description: found.description,
    analysis: found.analysis,
    ...(readToken ? { readToken } : {}),
    createdAt: found.createdAt.toISOString(),
  };
}

router.use(adminNetworkGuard);

router.post("/login", loginLimiter, (req: any, res: Response): void => {
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < MIN_ADMIN_PASSWORD_LENGTH) {
    logger.error("ADMIN_PASSWORD not configured");
    res.status(503).json({
      code: "ADMIN_NOT_CONFIGURED",
      message: "Admin nicht konfiguriert.",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const { password } = req.body as { password?: string };
  if (!password) {
    res.status(400).json({
      code: "MISSING_PASSWORD",
      message: "Password erforderlich",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (password.length < 15) {
    res.status(400).json({
      code: "INVALID_PASSWORD",
      message: "Falsches Passwort",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (!safeCompare(password, env.ADMIN_PASSWORD)) {
    logger.warn("Failed admin login attempt");
    res.status(401).json({
      code: "INVALID_PASSWORD",
      message: "Falsches Passwort",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Create session token
  const token = sessionStore.create();
  logger.info("Admin login successful");

  res.json({
    ok: true,
    token,
    expiresIn: 24 * 60 * 60, // 24 hours in seconds
    timestamp: new Date().toISOString(),
  });
});

/**
 * Logout endpoint - destroys session token
 */
router.post("/logout", adminAuth, (req: any, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    sessionStore.destroy(token);
    logger.info("Admin logout");
  }

  res.json({
    ok: true,
    message: "Logged out",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Apply admin auth to all remaining routes
 */
router.use(adminAuth);

router.get("/stats", async (req: any, res: Response): Promise<void> => {
  try {
    const rangeDays = getStatsRangeDays(req.query.days);
    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sinceRange = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const [totals] = await db
      .select({
        total: count(),
        paidCount: sql<number>`COUNT(*) FILTER (WHERE ${casesTable.paid} = true)`,
        revenueCents: sql<number>`COALESCE(SUM(CASE WHEN ${casesTable.paid} = true THEN ${casesTable.paidAmountCents} ELSE 0 END), 0)`,
        avgAmount: sql<number>`COALESCE(AVG(${casesTable.amount}), 0)`,
        disputedTotal: sql<number>`COALESCE(SUM(${casesTable.amount}), 0)`,
      })
      .from(casesTable)
      .where(visibleCaseWhere());

    const [hiddenLegacy] = await db
      .select({ c: count() })
      .from(casesTable)
      .where(lt(casesTable.createdAt, ADMIN_VISIBLE_CASES_FROM));

    const [cases24h] = await db
      .select({ c: count() })
      .from(casesTable)
      .where(visibleCaseWhere(gte(casesTable.createdAt, since24h)));
    const [cases7d] = await db
      .select({ c: count() })
      .from(casesTable)
      .where(visibleCaseWhere(gte(casesTable.createdAt, since7d)));
    const [cases30d] = await db
      .select({ c: count() })
      .from(casesTable)
      .where(visibleCaseWhere(gte(casesTable.createdAt, since30d)));

    const [paid24h] = await db
      .select({ c: count() })
      .from(casesTable)
      .where(visibleCaseWhere(and(eq(casesTable.paid, true), gte(casesTable.paidAt, since24h))));
    const [paid7d] = await db
      .select({ c: count() })
      .from(casesTable)
      .where(visibleCaseWhere(and(eq(casesTable.paid, true), gte(casesTable.paidAt, since7d))));

    const byStrength = await db
      .select({
        strength: sql<string>`${casesTable.analysis}->>'strength'`,
        c: count(),
      })
      .from(casesTable)
      .where(visibleCaseWhere())
      .groupBy(sql`${casesTable.analysis}->>'strength'`);

    const byPaymentMethod = await db
      .select({ method: casesTable.paymentMethod, c: count() })
      .from(casesTable)
      .where(visibleCaseWhere())
      .groupBy(casesTable.paymentMethod);

    const byProblemType = await db
      .select({ type: casesTable.problemType, c: count() })
      .from(casesTable)
      .where(visibleCaseWhere())
      .groupBy(casesTable.problemType);

    const dailyRaw = await db
      .select({
        day: sql<string>`TO_CHAR(DATE_TRUNC('day', ${casesTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
        total: count(),
        paid: sql<number>`COUNT(*) FILTER (WHERE ${casesTable.paid} = true)`,
      })
      .from(casesTable)
      .where(visibleCaseWhere(gte(casesTable.createdAt, since30d)))
      .groupBy(sql`DATE_TRUNC('day', ${casesTable.createdAt} AT TIME ZONE 'UTC')`)
      .orderBy(sql`DATE_TRUNC('day', ${casesTable.createdAt} AT TIME ZONE 'UTC')`);

    const traffic = await pool.query<{
      page_views_24h: string;
      page_views_7d: string;
      page_views_30d: string;
      visitors_7d: string;
      visitors_30d: string;
      page_views_range: string;
      visitors_range: string;
      wizard_starts_7d: string;
      wizard_drafts_7d: string;
      analysis_submits_7d: string;
      analysis_successes_7d: string;
      paywall_views_7d: string;
      checkout_clicks_7d: string;
      cta_clicks_7d: string;
      validation_errors_7d: string;
      wizard_abandons_7d: string;
      avg_quality_score_7d: string | null;
    }>(
      `
        SELECT
          COUNT(*) FILTER (
            WHERE event_type = 'page_view' AND is_admin = false AND created_at >= $1
          )::int AS page_views_24h,
          COUNT(*) FILTER (
            WHERE event_type = 'page_view' AND is_admin = false AND created_at >= $2
          )::int AS page_views_7d,
          COUNT(*) FILTER (
            WHERE event_type = 'page_view' AND is_admin = false AND created_at >= $3
          )::int AS page_views_30d,
          COUNT(DISTINCT session_hash) FILTER (
            WHERE event_type = 'page_view' AND is_admin = false AND created_at >= $2
          )::int AS visitors_7d,
          COUNT(DISTINCT session_hash) FILTER (
            WHERE event_type = 'page_view' AND is_admin = false AND created_at >= $3
          )::int AS visitors_30d,
          COUNT(*) FILTER (
            WHERE event_type = 'page_view' AND is_admin = false AND created_at >= $4
          )::int AS page_views_range,
          COUNT(DISTINCT session_hash) FILTER (
            WHERE event_type = 'page_view' AND is_admin = false AND created_at >= $4
          )::int AS visitors_range,
          COUNT(*) FILTER (
            WHERE event_type = 'wizard_step' AND created_at >= $2 AND metadata->>'step' = '1'
          )::int AS wizard_starts_7d,
          COUNT(*) FILTER (
            WHERE event_type = 'wizard_draft' AND created_at >= $2
          )::int AS wizard_drafts_7d,
          COUNT(*) FILTER (
            WHERE event_type = 'analysis_submit' AND created_at >= $2
          )::int AS analysis_submits_7d,
          COUNT(*) FILTER (
            WHERE event_type = 'analysis_success' AND created_at >= $2
          )::int AS analysis_successes_7d,
          COUNT(*) FILTER (
            WHERE event_type = 'paywall_view' AND created_at >= $2
          )::int AS paywall_views_7d,
          COUNT(*) FILTER (
            WHERE event_type = 'checkout_click' AND created_at >= $2
          )::int AS checkout_clicks_7d,
          COUNT(*) FILTER (
            WHERE event_type = 'cta_click' AND created_at >= $2
          )::int AS cta_clicks_7d,
          COUNT(*) FILTER (
            WHERE event_type = 'validation_error' AND created_at >= $2
          )::int AS validation_errors_7d,
          COUNT(*) FILTER (
            WHERE event_type = 'wizard_abandon' AND created_at >= $2
          )::int AS wizard_abandons_7d,
          ROUND(AVG(
            CASE
              WHEN metadata->>'qualityScore' ~ '^[0-9]+$'
              THEN (metadata->>'qualityScore')::numeric
              ELSE NULL
            END
          ) FILTER (
            WHERE event_type IN ('wizard_draft', 'analysis_submit', 'analysis_success')
              AND created_at >= $2
          ), 1)::text AS avg_quality_score_7d
        FROM analytics_events
      `,
      [since24h, since7d, since30d, sinceRange]
    );

    const topContentPages = await pool.query<{
      path: string;
      views: string;
      visitors: string;
      cta_clicks: string;
      wizard_starts: string;
      analysis_submits: string;
      analysis_successes: string;
      paywall_views: string;
      checkout_clicks: string;
      last_seen: Date;
    }>(
      `
        WITH page_counts AS (
          SELECT
            path,
            COUNT(*)::int AS views,
            COUNT(DISTINCT session_hash)::int AS visitors,
            MAX(created_at) AS last_seen
          FROM analytics_events
          WHERE event_type = 'page_view'
            AND is_admin = false
            AND created_at >= $1
            AND path IS NOT NULL
            AND path <> '/'
            AND path <> '/vorlagen-generator'
            AND path NOT LIKE '/admin%'
            AND path NOT LIKE '/api%'
            AND path NOT LIKE '/assets%'
          GROUP BY path
        ),
        funnel_counts AS (
          SELECT
            COALESCE(NULLIF(metadata->>'sourcePath', '/vorlagen-generator'), metadata->>'landingPath') AS path,
            COUNT(*) FILTER (WHERE event_type = 'cta_click')::int AS cta_clicks,
            COUNT(*) FILTER (WHERE event_type = 'wizard_step' AND metadata->>'step' = '1')::int AS wizard_starts,
            COUNT(*) FILTER (WHERE event_type = 'analysis_submit')::int AS analysis_submits,
            COUNT(*) FILTER (WHERE event_type = 'analysis_success')::int AS analysis_successes,
            COUNT(*) FILTER (WHERE event_type = 'paywall_view')::int AS paywall_views,
            COUNT(*) FILTER (WHERE event_type = 'checkout_click')::int AS checkout_clicks,
            MAX(created_at) AS last_seen
          FROM analytics_events
          WHERE is_admin = false
            AND created_at >= $1
            AND COALESCE(NULLIF(metadata->>'sourcePath', '/vorlagen-generator'), metadata->>'landingPath') IS NOT NULL
            AND COALESCE(NULLIF(metadata->>'sourcePath', '/vorlagen-generator'), metadata->>'landingPath') <> '/vorlagen-generator'
          GROUP BY COALESCE(NULLIF(metadata->>'sourcePath', '/vorlagen-generator'), metadata->>'landingPath')
        )
        SELECT
          page_counts.path,
          page_counts.views,
          page_counts.visitors,
          COALESCE(funnel_counts.cta_clicks, 0)::int AS cta_clicks,
          COALESCE(funnel_counts.wizard_starts, 0)::int AS wizard_starts,
          COALESCE(funnel_counts.analysis_submits, 0)::int AS analysis_submits,
          COALESCE(funnel_counts.analysis_successes, 0)::int AS analysis_successes,
          COALESCE(funnel_counts.paywall_views, 0)::int AS paywall_views,
          COALESCE(funnel_counts.checkout_clicks, 0)::int AS checkout_clicks,
          GREATEST(page_counts.last_seen, COALESCE(funnel_counts.last_seen, page_counts.last_seen)) AS last_seen
        FROM page_counts
        LEFT JOIN funnel_counts ON funnel_counts.path = page_counts.path
        ORDER BY page_counts.views DESC, page_counts.visitors DESC, last_seen DESC
        LIMIT 20
      `,
      [sinceRange]
    );

    const landingFunnels = await pool.query<{
      path: string;
      page_views: string;
      visitors: string;
      cta_clicks: string;
      wizard_starts: string;
      analysis_submits: string;
      analysis_successes: string;
      paywall_views: string;
      checkout_clicks: string;
      last_seen: Date;
    }>(
      `
        WITH page_counts AS (
          SELECT
            path,
            COUNT(*)::int AS page_views,
            COUNT(DISTINCT session_hash)::int AS visitors,
            MAX(created_at) AS last_seen
          FROM analytics_events
          WHERE event_type = 'page_view'
            AND is_admin = false
            AND created_at >= $1
            AND path IS NOT NULL
            AND path NOT LIKE '/admin%'
            AND path NOT LIKE '/api%'
            AND path NOT LIKE '/assets%'
          GROUP BY path
        ),
        funnel_counts AS (
          SELECT
            COALESCE(NULLIF(metadata->>'sourcePath', '/vorlagen-generator'), metadata->>'landingPath') AS path,
            COUNT(*) FILTER (WHERE event_type = 'cta_click')::int AS cta_clicks,
            COUNT(*) FILTER (WHERE event_type = 'wizard_step' AND metadata->>'step' = '1')::int AS wizard_starts,
            COUNT(*) FILTER (WHERE event_type = 'analysis_submit')::int AS analysis_submits,
            COUNT(*) FILTER (WHERE event_type = 'analysis_success')::int AS analysis_successes,
            COUNT(*) FILTER (WHERE event_type = 'paywall_view')::int AS paywall_views,
            COUNT(*) FILTER (WHERE event_type = 'checkout_click')::int AS checkout_clicks,
            MAX(created_at) AS last_seen
          FROM analytics_events
          WHERE is_admin = false
            AND created_at >= $1
            AND COALESCE(NULLIF(metadata->>'sourcePath', '/vorlagen-generator'), metadata->>'landingPath') IS NOT NULL
          GROUP BY COALESCE(NULLIF(metadata->>'sourcePath', '/vorlagen-generator'), metadata->>'landingPath')
        ),
        paths AS (
          SELECT path FROM page_counts
          UNION
          SELECT path FROM funnel_counts
        )
        SELECT
          paths.path,
          COALESCE(page_counts.page_views, 0)::int AS page_views,
          COALESCE(page_counts.visitors, 0)::int AS visitors,
          COALESCE(funnel_counts.cta_clicks, 0)::int AS cta_clicks,
          COALESCE(funnel_counts.wizard_starts, 0)::int AS wizard_starts,
          COALESCE(funnel_counts.analysis_submits, 0)::int AS analysis_submits,
          COALESCE(funnel_counts.analysis_successes, 0)::int AS analysis_successes,
          COALESCE(funnel_counts.paywall_views, 0)::int AS paywall_views,
          COALESCE(funnel_counts.checkout_clicks, 0)::int AS checkout_clicks,
          GREATEST(
            COALESCE(page_counts.last_seen, 'epoch'::timestamp),
            COALESCE(funnel_counts.last_seen, 'epoch'::timestamp)
          ) AS last_seen
        FROM paths
        LEFT JOIN page_counts ON page_counts.path = paths.path
        LEFT JOIN funnel_counts ON funnel_counts.path = paths.path
        WHERE paths.path IS NOT NULL
          AND paths.path <> '/vorlagen-generator'
          AND paths.path NOT LIKE '/admin%'
          AND paths.path NOT LIKE '/api%'
          AND paths.path NOT LIKE '/assets%'
        ORDER BY
          (COALESCE(funnel_counts.cta_clicks, 0)
            + COALESCE(funnel_counts.wizard_starts, 0)
            + COALESCE(funnel_counts.analysis_submits, 0)
            + COALESCE(funnel_counts.checkout_clicks, 0)) DESC,
          COALESCE(page_counts.page_views, 0) DESC,
          last_seen DESC
        LIMIT 20
      `,
      [sinceRange]
    );

    const latestWizardEvents = await pool.query<{
      event_type: string;
      created_at: Date;
      metadata: Record<string, unknown>;
    }>(
      `
        SELECT event_type, created_at, metadata
        FROM analytics_events
        WHERE event_type IN (
          'wizard_step',
          'cta_click',
          'wizard_draft',
          'analysis_submit',
          'analysis_success',
          'paywall_view',
          'checkout_click',
          'validation_error',
          'wizard_abandon',
          'step_duration'
        )
        ORDER BY created_at DESC
        LIMIT 40
      `
    );

    const totalNum = Number(totals?.total ?? 0);
    const paidNum = Number(totals?.paidCount ?? 0);

    res.json({
      totalCases: totalNum,
      hiddenLegacyCases: Number(hiddenLegacy?.c ?? 0),
      visibleCasesSince: ADMIN_VISIBLE_CASES_FROM.toISOString(),
      rangeDays,
      retentionMonths: getCaseRetentionMonths(),
      analyticsRetentionMonths: getAnalyticsRetentionMonths(),
      security: {
        productionMode: env.NODE_ENV === "production",
        stripeWebhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        turnstileRequired: env.REQUIRE_TURNSTILE_ON_CASE_CREATE === "1",
        turnstileConfigured: Boolean(process.env.TURNSTILE_SECRET_KEY),
        adminIpAllowlistConfigured: ADMIN_ALLOWED_IPS.size > 0,
      },
      paidCases: paidNum,
      conversionRate: totalNum > 0 ? Math.round((paidNum / totalNum) * 1000) / 10 : 0,
      revenueEur: Number(totals?.revenueCents ?? 0) / 100,
      avgDisputedAmount: Math.round(Number(totals?.avgAmount ?? 0) * 100) / 100,
      totalDisputedAmount: Math.round(Number(totals?.disputedTotal ?? 0) * 100) / 100,
      cases24h: Number(cases24h?.c ?? 0),
      cases7d: Number(cases7d?.c ?? 0),
      cases30d: Number(cases30d?.c ?? 0),
      paid24h: Number(paid24h?.c ?? 0),
      paid7d: Number(paid7d?.c ?? 0),
      byStrength: byStrength.map((r) => ({
        strength: r.strength ?? "unbekannt",
        count: Number(r.c),
      })),
      byPaymentMethod: byPaymentMethod.map((r) => ({ method: r.method, count: Number(r.c) })),
      byProblemType: byProblemType.map((r) => ({ type: r.type, count: Number(r.c) })),
      dailySeries: dailyRaw.map((r) => ({
        day: r.day,
        total: Number(r.total),
        paid: Number(r.paid),
      })),
      traffic: {
        pageViews24h: Number(traffic.rows[0]?.page_views_24h ?? 0),
        pageViews7d: Number(traffic.rows[0]?.page_views_7d ?? 0),
        pageViews30d: Number(traffic.rows[0]?.page_views_30d ?? 0),
        visitors7d: Number(traffic.rows[0]?.visitors_7d ?? 0),
        visitors30d: Number(traffic.rows[0]?.visitors_30d ?? 0),
        pageViewsRange: Number(traffic.rows[0]?.page_views_range ?? 0),
        visitorsRange: Number(traffic.rows[0]?.visitors_range ?? 0),
        wizardStarts7d: Number(traffic.rows[0]?.wizard_starts_7d ?? 0),
        wizardDrafts7d: Number(traffic.rows[0]?.wizard_drafts_7d ?? 0),
        analysisSubmits7d: Number(traffic.rows[0]?.analysis_submits_7d ?? 0),
        analysisSuccesses7d: Number(traffic.rows[0]?.analysis_successes_7d ?? 0),
        paywallViews7d: Number(traffic.rows[0]?.paywall_views_7d ?? 0),
        checkoutClicks7d: Number(traffic.rows[0]?.checkout_clicks_7d ?? 0),
        ctaClicks7d: Number(traffic.rows[0]?.cta_clicks_7d ?? 0),
        validationErrors7d: Number(traffic.rows[0]?.validation_errors_7d ?? 0),
        wizardAbandons7d: Number(traffic.rows[0]?.wizard_abandons_7d ?? 0),
        avgQualityScore7d: Number(traffic.rows[0]?.avg_quality_score_7d ?? 0),
      },
      topContentPages: topContentPages.rows.map((row) => ({
        path: row.path,
        views: Number(row.views),
        visitors: Number(row.visitors),
        ctaClicks: Number(row.cta_clicks),
        wizardStarts: Number(row.wizard_starts),
        analysisSubmits: Number(row.analysis_submits),
        analysisSuccesses: Number(row.analysis_successes),
        paywallViews: Number(row.paywall_views),
        checkoutClicks: Number(row.checkout_clicks),
        lastSeen: row.last_seen.toISOString(),
      })),
      landingFunnels: landingFunnels.rows.map((row) => ({
        path: row.path,
        pageViews: Number(row.page_views),
        visitors: Number(row.visitors),
        ctaClicks: Number(row.cta_clicks),
        wizardStarts: Number(row.wizard_starts),
        analysisSubmits: Number(row.analysis_submits),
        analysisSuccesses: Number(row.analysis_successes),
        paywallViews: Number(row.paywall_views),
        checkoutClicks: Number(row.checkout_clicks),
        lastSeen: row.last_seen.toISOString(),
      })),
      latestWizardEvents: latestWizardEvents.rows.map((row) => ({
        eventType: row.event_type,
        createdAt: row.created_at.toISOString(),
        metadata: row.metadata,
      })),
    });
  } catch (error) {
    logAdminRouteError(error, "Failed to load admin stats");
    sendAdminRouteError(res);
  }
});

router.get("/gsc", async (_req: Request, res: Response) => {
  try {
    const report = await getGscDashboardData();
    if (report.available) {
      res.json(report);
      return;
    }

    const csv = loadCsvGscOpportunities();
    res.json({
      ...report,
      available: csv.available,
      source: csv.available ? "csv" : report.source,
      csvSource: csv.source,
      topUrls: csv.opportunities,
      opportunities: csv.opportunities,
    });
  } catch (error) {
    logAdminRouteError(error, "Failed to load GSC dashboard");
    sendAdminRouteError(res);
  }
});

router.post("/gsc/sync", async (_req: Request, res: Response) => {
  try {
    const result = await syncGoogleSearchConsole({ manual: true, force: true });
    const report = await getGscDashboardData();
    res.json({
      ok: !result.skipped,
      result,
      report,
    });
  } catch (error) {
    logAdminRouteError(error, "Failed to sync Search Console");
    res.status(502).json({
      error: "Search-Console-Sync fehlgeschlagen.",
      message: error instanceof Error ? error.message : "Unbekannter Fehler",
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/gsc-opportunities", async (_req: Request, res: Response) => {
  try {
    const report = await getGscDashboardData();
    if (report.available) {
      res.json({
        available: true,
        source: "database",
        generatedAt: report.generatedAt,
        opportunities: report.opportunities,
      });
      return;
    }

    const csv = loadCsvGscOpportunities();
    res.json({
      available: csv.available,
      source: csv.source,
      generatedAt: csv.generatedAt,
      opportunities: csv.opportunities,
    });
  } catch (error) {
    logAdminRouteError(error, "Failed to load GSC opportunities");
    sendAdminRouteError(res);
  }
});

router.get("/cases", async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit ?? 50);
    const requestedOffset = Number(req.query.offset ?? 0);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 200) : 50;
    const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;
    const onlyPaid = req.query.paid === "1";

    const caseFilter = visibleCaseWhere(onlyPaid ? eq(casesTable.paid, true) : undefined);

    const rows = await db
      .select({
        id: casesTable.id,
        merchantName: casesTable.merchantName,
        paymentMethod: casesTable.paymentMethod,
        problemType: casesTable.problemType,
        amount: casesTable.amount,
        paymentDate: casesTable.paymentDate,
        analysis: casesTable.analysis,
        paid: casesTable.paid,
        paidAt: casesTable.paidAt,
        createdAt: casesTable.createdAt,
      })
      .from(casesTable)
      .where(caseFilter)
      .orderBy(desc(casesTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db.select({ c: count() }).from(casesTable).where(caseFilter);

    res.json({
      cases: rows.map((c) => ({
        id: String(c.id),
        merchantName: c.merchantName,
        paymentMethod: c.paymentMethod,
        problemType: c.problemType,
        amount: c.amount,
        paymentDate: c.paymentDate,
        successProbability: c.analysis?.successProbability ?? 0,
        strength: c.analysis?.strength ?? "unbekannt",
        paid: c.paid,
        paidAt: c.paidAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
      })),
      count: Number(total?.c ?? rows.length),
      limit,
      offset,
    });
  } catch (error) {
    logAdminRouteError(error, "Failed to load admin cases");
    sendAdminRouteError(res);
  }
});

router.post("/maintenance/anonymize-old-cases", async (req, res) => {
  try {
    const cutoff = getRetentionCutoff();

    const [eligible] = await db
      .select({ count: count() })
      .from(casesTable)
      .where(lt(casesTable.createdAt, cutoff));

    const execute =
      req.query.execute === "1" &&
      (req.body as { confirm?: string } | undefined)?.confirm === "ANONYMIZE_OLD_CASES";

    if (!execute) {
      res.json({
        ok: true,
        dryRun: true,
        eligibleCases: Number(eligible?.count ?? 0),
        cutoff: cutoff.toISOString(),
        retentionMonths: getCaseRetentionMonths(),
        requiredConfirmation: "ANONYMIZE_OLD_CASES",
      });
      return;
    }

    const updated = await db
      .update(casesTable)
      .set({
        merchantName: "Anonymisiert",
        amount: 0,
        paymentDate: "anonymisiert",
        merchantCountry: null,
        merchantContacted: false,
        merchantResponse: null,
        evidence: [],
        description: "Anonymisiert nach Ablauf der Aufbewahrungsfrist.",
        analysis: anonymizedAnalysis(),
        stripeSessionId: null,
        readTokenHash: null,
      })
      .where(lt(casesTable.createdAt, cutoff))
      .returning({ id: casesTable.id });

    logger.info({ count: updated.length, cutoff: cutoff.toISOString() }, "Old cases anonymized");

    res.json({
      ok: true,
      dryRun: false,
      anonymizedCases: updated.length,
      cutoff: cutoff.toISOString(),
      retentionMonths: getCaseRetentionMonths(),
    });
  } catch (error) {
    logAdminRouteError(error, "Failed to anonymize old cases");
    sendAdminRouteError(res);
  }
});

router.post("/cases/:id/anonymize", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  const confirm = (req.body as { confirm?: string } | undefined)?.confirm;
  if (confirm !== "ANONYMIZE_CASE") {
    res.status(400).json({ error: "Bestätigung ANONYMIZE_CASE erforderlich." });
    return;
  }

  try {
    const updated = await db
      .update(casesTable)
      .set({
        merchantName: "Anonymisiert",
        amount: 0,
        paymentDate: "anonymisiert",
        merchantCountry: null,
        merchantContacted: false,
        merchantResponse: null,
        evidence: [],
        description: "Anonymisiert durch Admin.",
        analysis: anonymizedAnalysis(),
        stripeSessionId: null,
        readTokenHash: null,
      })
      .where(eq(casesTable.id, id))
      .returning({ id: casesTable.id });

    if (updated.length === 0) {
      res.status(404).json({ error: "Nicht gefunden" });
      return;
    }

    logger.info({ id }, "Case anonymized by admin");
    res.json({ ok: true, id: String(id) });
  } catch (error) {
    logAdminRouteError(error, "Failed to anonymize case");
    sendAdminRouteError(res);
  }
});

router.delete("/cases/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  const confirm = (req.body as { confirm?: string } | undefined)?.confirm;
  if (confirm !== "DELETE_CASE") {
    res.status(400).json({ error: "Bestätigung DELETE_CASE erforderlich." });
    return;
  }

  try {
    const deleted = await db
      .delete(casesTable)
      .where(eq(casesTable.id, id))
      .returning({ id: casesTable.id });

    if (deleted.length === 0) {
      res.status(404).json({ error: "Nicht gefunden" });
      return;
    }

    logger.warn({ id }, "Case permanently deleted by admin");
    res.json({ ok: true, id: String(id) });
  } catch (error) {
    logAdminRouteError(error, "Failed to delete case");
    sendAdminRouteError(res);
  }
});

router.get("/cases/:id/unlock-preview", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  try {
    const [found] = await db.select().from(casesTable).where(eq(casesTable.id, id));
    if (!found) {
      res.status(404).json({ error: "Nicht gefunden" });
      return;
    }

    const readToken = typeof req.query.readToken === "string" ? req.query.readToken : undefined;
    res.json(adminCaseResponse(found, readToken));
  } catch (error) {
    logAdminRouteError(error, "Failed to load admin unlock preview");
    sendAdminRouteError(res);
  }
});

router.get("/cases/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }
  const [found] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  if (!found) {
    res.status(404).json({ error: "Nicht gefunden" });
    return;
  }
  res.json({
    ...found,
    id: String(found.id),
    createdAt: found.createdAt.toISOString(),
    paidAt: found.paidAt?.toISOString() ?? null,
  });
});

export default router;
