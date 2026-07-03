import { pool } from "@workspace/db";
import { logger } from "./logger";

const ANONYMIZED_ANALYSIS = {
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
} as const;

export async function ensureDatabaseSchema() {
  await pool.query(`ALTER TABLE cases ADD COLUMN IF NOT EXISTS read_token_hash text`);
  await pool.query(`CREATE INDEX IF NOT EXISTS read_token_hash_idx ON cases(read_token_hash)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id serial PRIMARY KEY,
      event_type text NOT NULL,
      path text,
      session_hash text,
      is_admin boolean NOT NULL DEFAULT false,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON analytics_events(event_type)`
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS analytics_path_idx ON analytics_events(path)`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS analytics_session_hash_idx ON analytics_events(session_hash)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics_events(created_at)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS analytics_is_admin_idx ON analytics_events(is_admin)`
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gsc_sync_runs (
      id serial PRIMARY KEY,
      status text NOT NULL,
      started_at timestamp NOT NULL DEFAULT now(),
      finished_at timestamp,
      manual boolean NOT NULL DEFAULT false,
      date_from text,
      date_to text,
      search_analytics_rows integer NOT NULL DEFAULT 0,
      inspection_count integer NOT NULL DEFAULT 0,
      sitemap_count integer NOT NULL DEFAULT 0,
      error text
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS gsc_sync_runs_status_idx ON gsc_sync_runs(status)`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS gsc_sync_runs_started_at_idx ON gsc_sync_runs(started_at)`
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gsc_search_analytics (
      id serial PRIMARY KEY,
      data_from text NOT NULL,
      data_to text NOT NULL,
      page text NOT NULL,
      query text NOT NULL DEFAULT '',
      device text NOT NULL DEFAULT '',
      country text NOT NULL DEFAULT '',
      clicks integer NOT NULL DEFAULT 0,
      impressions integer NOT NULL DEFAULT 0,
      ctr real NOT NULL DEFAULT 0,
      position real NOT NULL DEFAULT 0,
      synced_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS gsc_search_analytics_unique_snapshot_idx
    ON gsc_search_analytics(data_from, data_to, page, query, device, country)
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS gsc_search_analytics_page_idx ON gsc_search_analytics(page)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS gsc_search_analytics_query_idx ON gsc_search_analytics(query)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS gsc_search_analytics_synced_at_idx ON gsc_search_analytics(synced_at)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS gsc_search_analytics_impressions_idx ON gsc_search_analytics(impressions)`
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gsc_url_inspections (
      id serial PRIMARY KEY,
      url text NOT NULL,
      verdict text,
      coverage_state text,
      indexing_state text,
      robots_txt_state text,
      page_fetch_state text,
      google_canonical text,
      user_canonical text,
      last_crawl_time timestamp,
      raw jsonb NOT NULL DEFAULT '{}'::jsonb,
      inspected_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS gsc_url_inspections_url_unique_idx
    ON gsc_url_inspections(url)
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS gsc_url_inspections_verdict_idx ON gsc_url_inspections(verdict)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS gsc_url_inspections_inspected_at_idx ON gsc_url_inspections(inspected_at)`
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gsc_sitemaps (
      id serial PRIMARY KEY,
      sitemap_url text NOT NULL,
      last_submitted timestamp,
      is_pending boolean,
      is_sitemaps_index boolean,
      warnings integer NOT NULL DEFAULT 0,
      errors integer NOT NULL DEFAULT 0,
      contents jsonb NOT NULL DEFAULT '[]'::jsonb,
      raw jsonb NOT NULL DEFAULT '{}'::jsonb,
      checked_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS gsc_sitemaps_url_unique_idx
    ON gsc_sitemaps(sitemap_url)
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS gsc_sitemaps_checked_at_idx ON gsc_sitemaps(checked_at)`
  );

  logger.info("Database schema guard completed");
}

export function getCaseRetentionMonths() {
  const raw = Number(process.env.CASE_RETENTION_MONTHS ?? 12);
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 12;
}

export function getAnalyticsRetentionMonths() {
  const raw = Number(process.env.ANALYTICS_RETENTION_MONTHS ?? 12);
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 12;
}

function getRetentionCutoffForMonths(months: number, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months);
  return cutoff;
}

export function getRetentionCutoff(now = new Date()) {
  return getRetentionCutoffForMonths(getCaseRetentionMonths(), now);
}

export function getAnalyticsRetentionCutoff(now = new Date()) {
  return getRetentionCutoffForMonths(getAnalyticsRetentionMonths(), now);
}

export async function anonymizeExpiredCases() {
  const cutoff = getRetentionCutoff();
  const result = await pool.query(
    `
      UPDATE cases
      SET
        merchant_name = 'Anonymisiert',
        amount = 0,
        payment_date = 'anonymisiert',
        merchant_country = NULL,
        merchant_contacted = false,
        merchant_response = NULL,
        evidence = '[]'::jsonb,
        description = 'Anonymisiert nach Ablauf der Aufbewahrungsfrist.',
        analysis = $2::jsonb,
        stripe_session_id = NULL,
        read_token_hash = NULL
      WHERE created_at < $1
        AND merchant_name <> 'Anonymisiert'
    `,
    [cutoff, JSON.stringify(ANONYMIZED_ANALYSIS)]
  );

  if (result.rowCount && result.rowCount > 0) {
    logger.info(
      { count: result.rowCount, cutoff: cutoff.toISOString() },
      "Expired cases anonymized"
    );
  }
  return { count: result.rowCount ?? 0, cutoff };
}

export async function deleteExpiredAnalyticsEvents() {
  const cutoff = getAnalyticsRetentionCutoff();
  const result = await pool.query(`DELETE FROM analytics_events WHERE created_at < $1`, [cutoff]);

  if (result.rowCount && result.rowCount > 0) {
    logger.info(
      { count: result.rowCount, cutoff: cutoff.toISOString() },
      "Expired analytics events deleted"
    );
  }
  return { count: result.rowCount ?? 0, cutoff };
}

export function scheduleRetentionCleanup() {
  const run = () => {
    Promise.all([anonymizeExpiredCases(), deleteExpiredAnalyticsEvents()]).catch((error) => {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Retention cleanup failed"
      );
    });
  };

  const initialTimer = setTimeout(run, 15_000);
  initialTimer.unref();

  const interval = setInterval(run, 24 * 60 * 60 * 1000);
  interval.unref();
  return () => {
    clearTimeout(initialTimer);
    clearInterval(interval);
  };
}
