import { Router, type Response } from "express";
import { db, casesTable } from "@workspace/db";
import { desc, eq, count, sql, and, gte } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { getApiServerEnv } from "@workspace/env";
import { safeCompare, sessionStore, adminAuth } from "../lib/auth";
import { logger } from "../lib/logger";

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

router.get("/stats", async (_req: any, res: Response): Promise<void> => {
  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totals] = await db
    .select({
      total: count(),
      paidCount: sql<number>`COUNT(*) FILTER (WHERE ${casesTable.paid} = true)`,
      revenueCents: sql<number>`COALESCE(SUM(CASE WHEN ${casesTable.paid} = true THEN ${casesTable.paidAmountCents} ELSE 0 END), 0)`,
      avgAmount: sql<number>`COALESCE(AVG(${casesTable.amount}), 0)`,
      disputedTotal: sql<number>`COALESCE(SUM(${casesTable.amount}), 0)`,
    })
    .from(casesTable);

  const [cases24h] = await db
    .select({ c: count() })
    .from(casesTable)
    .where(gte(casesTable.createdAt, since24h));
  const [cases7d] = await db
    .select({ c: count() })
    .from(casesTable)
    .where(gte(casesTable.createdAt, since7d));
  const [cases30d] = await db
    .select({ c: count() })
    .from(casesTable)
    .where(gte(casesTable.createdAt, since30d));

  const [paid24h] = await db
    .select({ c: count() })
    .from(casesTable)
    .where(and(eq(casesTable.paid, true), gte(casesTable.paidAt, since24h)));

  const byStrength = await db
    .select({
      strength: sql<string>`${casesTable.analysis}->>'strength'`,
      c: count(),
    })
    .from(casesTable)
    .groupBy(sql`${casesTable.analysis}->>'strength'`);

  const byPaymentMethod = await db
    .select({ method: casesTable.paymentMethod, c: count() })
    .from(casesTable)
    .groupBy(casesTable.paymentMethod);

  const byProblemType = await db
    .select({ type: casesTable.problemType, c: count() })
    .from(casesTable)
    .groupBy(casesTable.problemType);

  const dailyRaw = await db
    .select({
      day: sql<string>`TO_CHAR(DATE_TRUNC('day', ${casesTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
      total: count(),
      paid: sql<number>`COUNT(*) FILTER (WHERE ${casesTable.paid} = true)`,
    })
    .from(casesTable)
    .where(gte(casesTable.createdAt, since30d))
    .groupBy(sql`DATE_TRUNC('day', ${casesTable.createdAt} AT TIME ZONE 'UTC')`)
    .orderBy(sql`DATE_TRUNC('day', ${casesTable.createdAt} AT TIME ZONE 'UTC')`);

  const totalNum = Number(totals.total);
  const paidNum = Number(totals.paidCount);

  res.json({
    totalCases: totalNum,
    paidCases: paidNum,
    conversionRate: totalNum > 0 ? Math.round((paidNum / totalNum) * 1000) / 10 : 0,
    revenueEur: Number(totals.revenueCents) / 100,
    avgDisputedAmount: Math.round(Number(totals.avgAmount) * 100) / 100,
    totalDisputedAmount: Math.round(Number(totals.disputedTotal) * 100) / 100,
    cases24h: Number(cases24h.c),
    cases7d: Number(cases7d.c),
    cases30d: Number(cases30d.c),
    paid24h: Number(paid24h.c),
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
  });
});

router.get("/cases", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);
  const onlyPaid = req.query.paid === "1";

  const rows = await db
    .select()
    .from(casesTable)
    .where(onlyPaid ? eq(casesTable.paid, true) : sql`true`)
    .orderBy(desc(casesTable.createdAt))
    .limit(limit)
    .offset(offset);

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
    count: rows.length,
    limit,
    offset,
  });
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
