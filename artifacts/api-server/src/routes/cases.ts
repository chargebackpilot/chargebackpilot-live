import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { casesTable, type CaseAnalysis } from "@workspace/db";
import { CreateCaseBody, GetCaseParams } from "@workspace/api-zod";
import { eq, count, sql } from "drizzle-orm";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import Stripe from "stripe";
import { analyzeWithGemini } from "../lib/gemini-analysis";
import { LRUCache } from "../lib/lru-cache";
import { getApiServerEnv } from "@workspace/env";
import { logger } from "../lib/logger";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const env = getApiServerEnv();
const router = Router();

/**
 * LRU Cache for AI analysis results
 * Prevents duplicate API calls for identical inputs
 * Max 500 entries, 1 hour TTL
 */
const aiCache = new LRUCache<string, CaseAnalysis>(500, 60 * 60 * 1000);

/**
 * Track recent submissions per IP for rate limiting
 */
const ipRecentSubmissions = new Map<string, number[]>();

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const CASE_CREATE_WINDOW_MS = env.CASE_CREATE_WINDOW_MS;
const CASE_CREATE_LIMIT = env.CASE_CREATE_LIMIT_PER_WINDOW;
const TURNSTILE_AFTER_ATTEMPTS = env.TURNSTILE_AFTER_ATTEMPTS;
const REQUIRE_TURNSTILE_IN_PROD = env.REQUIRE_TURNSTILE_ON_CASE_CREATE === "1";

function firstForwardedIp(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(",")[0]?.trim() || undefined;
}

function getClientIp(req: {
  ip?: string;
  socket?: { remoteAddress?: string };
  headers?: Record<string, unknown>;
}) {
  const forwarded = firstForwardedIp(
    req.headers?.["x-forwarded-for"] as string | string[] | undefined
  );
  return forwarded || req.ip || req.socket?.remoteAddress || "unknown";
}

function createReadToken() {
  return randomBytes(32).toString("base64url");
}

function hashReadToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hasValidReadToken(storedHash: string | null, candidateToken: string | undefined) {
  if (!storedHash || !candidateToken) return false;

  const candidateHash = hashReadToken(candidateToken);
  const storedBuffer = Buffer.from(storedHash, "hex");
  const candidateBuffer = Buffer.from(candidateHash, "hex");

  return (
    storedBuffer.length === candidateBuffer.length && timingSafeEqual(storedBuffer, candidateBuffer)
  );
}

function publicAnalysis(analysis: CaseAnalysis): CaseAnalysis {
  return {
    ...analysis,
    nextSteps: analysis.nextSteps.slice(0, 1),
    legalBasis: [],
    counterarguments: [],
    merchantTemplate: "",
    bankTemplate: "",
    escalationTemplate: "",
  };
}

function caseResponse(
  row: typeof casesTable.$inferSelect,
  readToken: string | undefined,
  fullAnalysis: boolean
) {
  return {
    id: String(row.id),
    paymentMethod: row.paymentMethod,
    problemType: row.problemType,
    merchantName: row.merchantName,
    amount: row.amount,
    paymentDate: row.paymentDate,
    merchantCountry: row.merchantCountry,
    merchantContacted: row.merchantContacted,
    merchantResponse: row.merchantResponse,
    evidence: row.evidence,
    description: row.description,
    analysis: fullAnalysis ? row.analysis : publicAnalysis(row.analysis),
    ...(readToken ? { readToken } : {}),
    createdAt: row.createdAt.toISOString(),
  };
}

function getReadToken(req: Request) {
  return typeof req.query.readToken === "string"
    ? req.query.readToken
    : typeof req.headers["x-case-read-token"] === "string"
      ? req.headers["x-case-read-token"]
      : undefined;
}

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

function flatrateStillValid(createdSeconds: number) {
  const createdAt = new Date(createdSeconds * 1000);
  const expiresAt = new Date(createdAt);
  expiresAt.setMonth(expiresAt.getMonth() + 12);
  return expiresAt.getTime() > Date.now();
}

async function hasServerSideUnlock(row: typeof casesTable.$inferSelect, req: Request) {
  if (row.paid) return true;

  const flatrateSessionId =
    typeof req.query.flatrateSessionId === "string" ? req.query.flatrateSessionId : undefined;
  if (!flatrateSessionId) return false;

  const stripe = getStripeClient();
  if (!stripe) return false;

  try {
    const session = await stripe.checkout.sessions.retrieve(flatrateSessionId);
    return (
      session.payment_status === "paid" &&
      session.metadata?.mode === "flatrate" &&
      typeof session.created === "number" &&
      flatrateStillValid(session.created)
    );
  } catch (err) {
    logger.warn(
      { error: err instanceof Error ? err.message : String(err) },
      "Flatrate session verification failed"
    );
    return false;
  }
}

function countRecentSubmissions(ip: string) {
  const now = Date.now();
  const attempts = ipRecentSubmissions.get(ip) ?? [];
  const recent = attempts.filter((ts) => now - ts <= CASE_CREATE_WINDOW_MS);
  recent.push(now);
  ipRecentSubmissions.set(ip, recent.slice(-CASE_CREATE_LIMIT));
  return recent.length;
}

async function verifyTurnstileToken(token: string, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: false, reason: "missing-secret" };
  if (!token) return { ok: false, reason: "missing-token" };

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) return { ok: false, reason: `http-${response.status}` };
  const json = (await response.json()) as { success?: boolean };
  return { ok: Boolean(json.success), reason: json.success ? "ok" : "verification-failed" };
}

const limiter = rateLimit({
  windowMs: CASE_CREATE_WINDOW_MS,
  max: CASE_CREATE_LIMIT,
  message: { error: "Zu viele Anfragen. Bitte versuche es in einer Stunde erneut." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => ipKeyGenerator(getClientIp(req)),
});

router.post("/cases", limiter, async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const submissionCount = countRecentSubmissions(ip);
  const turnstileRequired =
    (process.env.NODE_ENV === "production" && REQUIRE_TURNSTILE_IN_PROD) ||
    submissionCount > TURNSTILE_AFTER_ATTEMPTS;
  const turnstileToken =
    typeof req.body?.turnstileToken === "string" ? req.body.turnstileToken : "";

  if (turnstileRequired || turnstileToken) {
    const verification = await verifyTurnstileToken(turnstileToken, ip);
    if (turnstileRequired && !verification.ok) {
      logger.warn(
        { submissionCount, reason: verification.reason },
        "Case create Turnstile challenge failed"
      );
      res
        .status(403)
        .json({ error: "Sicherheitsprüfung fehlgeschlagen. Bitte versuche es erneut." });
      return;
    }
    if (turnstileToken && !verification.ok) {
      res.status(400).json({
        error: "Ungültige Sicherheitsprüfung. Bitte Seite neu laden und erneut versuchen.",
      });
      return;
    }
  }

  const parseResult = CreateCaseBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Ungültige Eingabedaten", details: parseResult.error.issues });
    return;
  }

  const data = parseResult.data;
  const evidence = (data.evidence as string[]) || [];

  const analysisInput = {
    paymentMethod: data.paymentMethod,
    problemType: data.problemType,
    merchantName: data.merchantName,
    amount: data.amount,
    paymentDate: data.paymentDate,
    merchantCountry: data.merchantCountry,
    merchantContacted: data.merchantContacted ?? false,
    merchantResponse: data.merchantResponse,
    evidence,
    description: data.description,
  };

  const payloadHash = createHash("sha256").update(JSON.stringify(analysisInput)).digest("hex");

  let analysis: CaseAnalysis;
  const cachedAnalysis = aiCache.get(payloadHash);
  if (cachedAnalysis) {
    logger.debug({ hash: payloadHash.slice(0, 8) }, "Using cached AI analysis");
    analysis = cachedAnalysis;
  } else {
    logger.debug({ hash: payloadHash.slice(0, 8) }, "Computing new AI analysis");
    analysis = await analyzeWithGemini(analysisInput);
    aiCache.set(payloadHash, analysis);
  }

  const caseData = {
    paymentMethod: data.paymentMethod,
    problemType: data.problemType,
    merchantName: data.merchantName,
    amount: data.amount,
    paymentDate: data.paymentDate,
    merchantCountry: data.merchantCountry ?? null,
    merchantContacted: data.merchantContacted ?? false,
    merchantResponse: data.merchantResponse ?? null,
    evidence,
    description: data.description,
    analysis,
  };

  const readToken = createReadToken();
  const [newCase] = await db
    .insert(casesTable)
    .values({ ...caseData, readTokenHash: hashReadToken(readToken) })
    .returning();

  res.status(201).json(caseResponse(newCase, readToken, false));
});

router.get("/cases/stats", async (_req: Request, res: Response) => {
  const [totalResult] = await db.select({ count: count() }).from(casesTable);
  const total = Number(totalResult.count);

  const strengthCounts = await db
    .select({
      strength: sql<string>`${casesTable.analysis}->>'strength'`,
      count: count(),
    })
    .from(casesTable)
    .groupBy(sql`${casesTable.analysis}->>'strength'`);

  let strongCases = 0,
    mediumCases = 0,
    weakCases = 0;
  for (const row of strengthCounts) {
    if (row.strength === "stark") strongCases = Number(row.count);
    else if (row.strength === "mittel") mediumCases = Number(row.count);
    else if (row.strength === "schwach") weakCases = Number(row.count);
  }

  const paymentMethodCounts = await db
    .select({ method: casesTable.paymentMethod, count: count() })
    .from(casesTable)
    .groupBy(casesTable.paymentMethod)
    .limit(5);

  const problemTypeCounts = await db
    .select({ type: casesTable.problemType, count: count() })
    .from(casesTable)
    .groupBy(casesTable.problemType)
    .limit(5);

  res.json({
    totalCases: total,
    strongCases,
    mediumCases,
    weakCases,
    topPaymentMethods: paymentMethodCounts.map((r) => ({
      method: r.method,
      count: Number(r.count),
    })),
    topProblemTypes: problemTypeCounts.map((r) => ({ type: r.type, count: Number(r.count) })),
  });
});

router.get("/cases/:id/unlock", async (req: Request, res: Response) => {
  const paramsResult = GetCaseParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  const id = parseInt(paramsResult.data.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID muss eine Zahl sein" });
    return;
  }

  const [found] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  const readToken = getReadToken(req);

  if (!found || !hasValidReadToken(found.readTokenHash, readToken)) {
    res.status(404).json({ error: "Fall nicht gefunden" });
    return;
  }

  if (!(await hasServerSideUnlock(found, req))) {
    res.status(402).json({ error: "Fall noch nicht freigeschaltet" });
    return;
  }

  res.json(caseResponse(found, readToken, true));
});

router.get("/cases/:id", async (req: Request, res: Response) => {
  const paramsResult = GetCaseParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  const id = parseInt(paramsResult.data.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID muss eine Zahl sein" });
    return;
  }

  const [found] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  const readToken = getReadToken(req);

  if (!found || !hasValidReadToken(found.readTokenHash, readToken)) {
    res.status(404).json({ error: "Fall nicht gefunden" });
    return;
  }

  res.json(caseResponse(found, readToken, false));
});

export default router;
