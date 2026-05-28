import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";

export const consentsTable = pgTable("consents", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id"),
  stripeSessionId: text("stripe_session_id"),
  consentType: text("consent_type").notNull(),
  consentGiven: text("consent_given").notNull(),
  consentTimestamp: text("consent_timestamp").notNull(),
  agbVersion: text("agb_version").notNull().default("2026-05"),
  widerrufVersion: text("widerruf_version").notNull().default("2026-05"),
  datenschutzVersion: text("datenschutz_version").notNull().default("2026-05"),
  ipHash: text("ip_hash"),
  userAgentHash: text("user_agent_hash"),
  source: text("source").notNull().default("web_checkout"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    caseIdIdx: index("consents_case_id_idx").on(table.caseId),
    stripeSessionIdIdx: index("consents_stripe_session_id_idx").on(table.stripeSessionId),
    consentTypeIdx: index("consents_consent_type_idx").on(table.consentType),
    createdAtIdx: index("consents_created_at_idx").on(table.createdAt),
  };
});
