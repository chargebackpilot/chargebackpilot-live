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

  logger.info("Database schema guard completed");
}

export function getCaseRetentionMonths() {
  const raw = Number(process.env.CASE_RETENTION_MONTHS ?? 12);
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 12;
}

export function getRetentionCutoff(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - getCaseRetentionMonths());
  return cutoff;
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

export function scheduleRetentionCleanup() {
  const run = () => {
    anonymizeExpiredCases().catch((error) => {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Case retention cleanup failed"
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
