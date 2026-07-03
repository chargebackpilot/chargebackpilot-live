import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const gscSyncRunsTable = pgTable(
  "gsc_sync_runs",
  {
    id: serial("id").primaryKey(),
    status: text("status").notNull(),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    finishedAt: timestamp("finished_at"),
    manual: boolean("manual").notNull().default(false),
    dateFrom: text("date_from"),
    dateTo: text("date_to"),
    searchAnalyticsRows: integer("search_analytics_rows").notNull().default(0),
    inspectionCount: integer("inspection_count").notNull().default(0),
    sitemapCount: integer("sitemap_count").notNull().default(0),
    error: text("error"),
  },
  (table) => ({
    statusIdx: index("gsc_sync_runs_status_idx").on(table.status),
    startedAtIdx: index("gsc_sync_runs_started_at_idx").on(table.startedAt),
  })
);

export const gscSearchAnalyticsTable = pgTable(
  "gsc_search_analytics",
  {
    id: serial("id").primaryKey(),
    dataFrom: text("data_from").notNull(),
    dataTo: text("data_to").notNull(),
    page: text("page").notNull(),
    query: text("query").notNull().default(""),
    device: text("device").notNull().default(""),
    country: text("country").notNull().default(""),
    clicks: integer("clicks").notNull().default(0),
    impressions: integer("impressions").notNull().default(0),
    ctr: real("ctr").notNull().default(0),
    position: real("position").notNull().default(0),
    syncedAt: timestamp("synced_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueSnapshot: uniqueIndex("gsc_search_analytics_unique_snapshot_idx").on(
      table.dataFrom,
      table.dataTo,
      table.page,
      table.query,
      table.device,
      table.country
    ),
    pageIdx: index("gsc_search_analytics_page_idx").on(table.page),
    queryIdx: index("gsc_search_analytics_query_idx").on(table.query),
    syncedAtIdx: index("gsc_search_analytics_synced_at_idx").on(table.syncedAt),
    impressionsIdx: index("gsc_search_analytics_impressions_idx").on(table.impressions),
  })
);

export const gscUrlInspectionsTable = pgTable(
  "gsc_url_inspections",
  {
    id: serial("id").primaryKey(),
    url: text("url").notNull(),
    verdict: text("verdict"),
    coverageState: text("coverage_state"),
    indexingState: text("indexing_state"),
    robotsTxtState: text("robots_txt_state"),
    pageFetchState: text("page_fetch_state"),
    googleCanonical: text("google_canonical"),
    userCanonical: text("user_canonical"),
    lastCrawlTime: timestamp("last_crawl_time"),
    raw: jsonb("raw").notNull().default({}),
    inspectedAt: timestamp("inspected_at").notNull().defaultNow(),
  },
  (table) => ({
    urlUnique: uniqueIndex("gsc_url_inspections_url_unique_idx").on(table.url),
    verdictIdx: index("gsc_url_inspections_verdict_idx").on(table.verdict),
    inspectedAtIdx: index("gsc_url_inspections_inspected_at_idx").on(table.inspectedAt),
  })
);

export const gscSitemapsTable = pgTable(
  "gsc_sitemaps",
  {
    id: serial("id").primaryKey(),
    sitemapUrl: text("sitemap_url").notNull(),
    lastSubmitted: timestamp("last_submitted"),
    isPending: boolean("is_pending"),
    isSitemapsIndex: boolean("is_sitemaps_index"),
    warnings: integer("warnings").notNull().default(0),
    errors: integer("errors").notNull().default(0),
    contents: jsonb("contents").notNull().default([]),
    raw: jsonb("raw").notNull().default({}),
    checkedAt: timestamp("checked_at").notNull().defaultNow(),
  },
  (table) => ({
    sitemapUnique: uniqueIndex("gsc_sitemaps_url_unique_idx").on(table.sitemapUrl),
    checkedAtIdx: index("gsc_sitemaps_checked_at_idx").on(table.checkedAt),
  })
);

export type GscSyncRun = typeof gscSyncRunsTable.$inferSelect;
export type GscSearchAnalyticsRow = typeof gscSearchAnalyticsTable.$inferSelect;
export type GscUrlInspection = typeof gscUrlInspectionsTable.$inferSelect;
export type GscSitemap = typeof gscSitemapsTable.$inferSelect;
