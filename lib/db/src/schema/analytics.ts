import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const analyticsEventsTable = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    eventType: text("event_type").notNull(),
    path: text("path"),
    sessionHash: text("session_hash"),
    isAdmin: boolean("is_admin").notNull().default(false),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    eventTypeIdx: index("analytics_event_type_idx").on(table.eventType),
    pathIdx: index("analytics_path_idx").on(table.path),
    sessionHashIdx: index("analytics_session_hash_idx").on(table.sessionHash),
    createdAtIdx: index("analytics_created_at_idx").on(table.createdAt),
    adminIdx: index("analytics_is_admin_idx").on(table.isAdmin),
  })
);

export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;
