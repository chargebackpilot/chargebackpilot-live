import { Router, type Request, type Response } from "express";
import { analyticsEventsTable, db } from "@workspace/db";
import { createHash } from "node:crypto";
import { z } from "zod";
import { logger } from "../lib/logger";
import rateLimit from "express-rate-limit";

const router = Router();

const pageViewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 600,
  standardHeaders: false,
  legacyHeaders: false,
  message: { ok: false },
});

const wizardEventLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 240,
  standardHeaders: false,
  legacyHeaders: false,
  message: { ok: false },
});

const pageViewSchema = z.object({
  path: z.string().min(1).max(300),
  title: z.string().max(180).optional(),
  visitorId: z.string().min(8).max(120).optional(),
});

const wizardEventSchema = z.object({
  eventType: z.enum([
    "wizard_step",
    "wizard_draft",
    "analysis_submit",
    "analysis_success",
    "paywall_view",
    "checkout_click",
  ]),
  step: z.number().int().min(1).max(6).optional(),
  visitorId: z.string().min(8).max(120).optional(),
  data: z
    .object({
      paymentMethod: z.string().max(80).optional(),
      problemType: z.string().max(80).optional(),
      merchantName: z.string().max(140).optional(),
      purchaseAmount: z.union([z.string().max(40), z.number()]).optional(),
      disputedAmount: z.union([z.string().max(40), z.number()]).optional(),
      paymentDate: z.string().max(40).optional(),
      merchantCountry: z.string().max(80).optional(),
      merchantContacted: z.boolean().optional(),
      merchantResponseType: z.string().max(80).optional(),
      evidence: z.array(z.string().max(80)).max(30).optional(),
    })
    .default({}),
});

function hashVisitorId(visitorId: string | undefined) {
  if (!visitorId) return null;
  return createHash("sha256").update(visitorId).digest("hex");
}

function normalizePath(input: string) {
  let path = input.split("?")[0] || "/";
  if (input.startsWith("http")) {
    try {
      path = new URL(input).pathname;
    } catch {
      path = "/";
    }
  }
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

function shouldIgnorePath(path: string) {
  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path.startsWith("/api/") ||
    path.startsWith("/assets/")
  );
}

function cleanWizardMetadata(input: z.infer<typeof wizardEventSchema>) {
  const data = input.data ?? {};
  return {
    step: input.step ?? null,
    paymentMethod: data.paymentMethod || null,
    problemType: data.problemType || null,
    merchantName: data.merchantName || null,
    purchaseAmount: data.purchaseAmount || null,
    disputedAmount: data.disputedAmount || null,
    paymentDate: data.paymentDate || null,
    merchantCountry: data.merchantCountry || null,
    merchantContacted: data.merchantContacted ?? null,
    merchantResponseType: data.merchantResponseType || null,
    evidenceCount: data.evidence?.length ?? 0,
  };
}

router.post("/analytics/page-view", pageViewLimiter, async (req: Request, res: Response) => {
  const parsed = pageViewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false });
    return;
  }

  const path = normalizePath(parsed.data.path);
  if (shouldIgnorePath(path)) {
    res.status(204).end();
    return;
  }

  try {
    await db.insert(analyticsEventsTable).values({
      eventType: "page_view",
      path,
      sessionHash: hashVisitorId(parsed.data.visitorId),
      isAdmin: false,
      metadata: { title: parsed.data.title ?? null },
    });
    res.status(204).end();
  } catch (error) {
    logger.warn(
      { error: error instanceof Error ? error.message : String(error), path },
      "Page view tracking failed"
    );
    res.status(204).end();
  }
});

router.post("/analytics/wizard-event", wizardEventLimiter, async (req: Request, res: Response) => {
  const parsed = wizardEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false });
    return;
  }

  try {
    await db.insert(analyticsEventsTable).values({
      eventType: parsed.data.eventType,
      path: "/vorlagen-generator",
      sessionHash: hashVisitorId(parsed.data.visitorId),
      isAdmin: false,
      metadata: cleanWizardMetadata(parsed.data),
    });
    res.status(204).end();
  } catch (error) {
    logger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      "Wizard event tracking failed"
    );
    res.status(204).end();
  }
});

export default router;
