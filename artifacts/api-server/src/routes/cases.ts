import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db";
import { CreateCaseBody, GetCaseParams } from "@workspace/api-zod";
import { eq, count, sql } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { analyzeWithGemini } from "../lib/gemini-analysis";
import { createHash } from "node:crypto";

const router = Router();
const aiCache = new Map<string, any>();
const ipRecentSubmissions = new Map<string, number[]>();
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function isSuspiciousSubmission(ip: string) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const attempts = ipRecentSubmissions.get(ip) ?? [];
  const recent = attempts.filter((ts) => now - ts <= windowMs);
  recent.push(now);
  ipRecentSubmissions.set(ip, recent.slice(-20));
  return recent.length >= 2;
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
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 create case requests per `window` (here, per hour)
  message: { error: "Zu viele Anfragen. Bitte versuche es in einer Stunde erneut." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post("/cases", limiter, async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const suspicious = isSuspiciousSubmission(ip);
  const turnstileToken = typeof req.body?.turnstileToken === "string" ? req.body.turnstileToken : "";

  if (suspicious || turnstileToken) {
    const verification = await verifyTurnstileToken(turnstileToken, ip);
    if (suspicious && !verification.ok) {
      res.status(403).json({ error: "Sicherheitsprüfung fehlgeschlagen. Bitte versuche es erneut." });
      return;
    }
    if (turnstileToken && !verification.ok) {
      res.status(400).json({ error: "Ungültige Sicherheitsprüfung. Bitte Seite neu laden und erneut versuchen." });
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
  
  let analysis;
  if (aiCache.has(payloadHash)) {
    analysis = aiCache.get(payloadHash);
  } else {
    analysis = await analyzeWithGemini(analysisInput);
    aiCache.set(payloadHash, analysis);
    // Optional: limit cache size to prevent memory leaks over time
    if (aiCache.size > 1000) {
      const firstKey = aiCache.keys().next().value;
      if (firstKey) aiCache.delete(firstKey);
    }
  }

  const [newCase] = await db
    .insert(casesTable)
    .values({
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
    })
    .returning();

  res.status(201).json({
    id: String(newCase.id),
    paymentMethod: newCase.paymentMethod,
    problemType: newCase.problemType,
    merchantName: newCase.merchantName,
    amount: newCase.amount,
    paymentDate: newCase.paymentDate,
    merchantCountry: newCase.merchantCountry,
    merchantContacted: newCase.merchantContacted,
    merchantResponse: newCase.merchantResponse,
    evidence: newCase.evidence,
    description: newCase.description,
    analysis: newCase.analysis,
    createdAt: newCase.createdAt.toISOString(),
  });
});

router.get("/cases/stats", async (req, res) => {
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
    topPaymentMethods: paymentMethodCounts.map((r) => ({ method: r.method, count: Number(r.count) })),
    topProblemTypes: problemTypeCounts.map((r) => ({ type: r.type, count: Number(r.count) })),
  });
});

router.get("/cases/:id", async (req, res) => {
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
  if (!found) {
    res.status(404).json({ error: "Fall nicht gefunden" });
    return;
  }

  res.json({
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
    createdAt: found.createdAt.toISOString(),
  });
});

export default router;
