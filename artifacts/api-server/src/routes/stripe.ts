import express, { Router } from "express";
import Stripe from "stripe";
import { db, casesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { createHash } from "crypto";

const router = Router();

function hashValue(input?: string): string | null {
  if (!input) return null;
  return createHash("sha256").update(input).digest("hex");
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

function getBaseUrl(): string {
  // Immer die saubere Hauptdomain in Produktion nutzen (verhindert .onrender.com Rückleitungen)
  if (process.env.NODE_ENV === "production") {
    return "https://chargebackpilot.de";
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const first = domains.split(",")[0].trim();
    return `https://${first}`;
  }
  return "http://localhost:80";
}

// ---------------------------------------------------------------------------
// Single-case checkout (0,99 €)
// ---------------------------------------------------------------------------
router.post("/checkout", async (req, res) => {
  const { caseId, immediateAccessConsent, withdrawalLossAccepted } = req.body as {
    caseId?: string;
    immediateAccessConsent?: boolean;
    withdrawalLossAccepted?: boolean;
    agbVersion?: string;
    widerrufVersion?: string;
    datenschutzVersion?: string;
  };

  if (!immediateAccessConsent || !withdrawalLossAccepted) {
    res.status(400).json({
      error:
        "Bitte bestätige die Hinweise zum sofortigen Beginn und zum möglichen Erlöschen des Widerrufsrechts.",
    });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res
      .status(503)
      .json({ error: "Zahlung noch nicht konfiguriert. Bitte STRIPE_SECRET_KEY setzen." });
    return;
  }

  try {
    const stripe = getStripe();
    const baseUrl = getBaseUrl();
    const ipRaw =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() || req.ip;
    const uaRaw = req.headers["user-agent"];
    const ipHash = hashValue(ipRaw ?? undefined);
    const userAgentHash = hashValue(typeof uaRaw === "string" ? uaRaw : undefined);
    const caseIdNum = caseId ? parseInt(caseId, 10) : NaN;

    const session = await stripe.checkout.sessions.create({
      automatic_tax: { enabled: false },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "ChargebackPilot — Fall freischalten",
              description:
                "Digitale Formulierungshilfe: Textentwürfe, PDF-Download und strukturierte Orientierung. Keine Rechtsberatung.",
            },
            unit_amount: 99,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/vorlagen-generator?payment_success=1&case_id=${caseId ?? ""}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/vorlagen-generator?payment_cancel=1&case_id=${caseId ?? ""}`,
      locale: "de",
      metadata: {
        mode: "single",
        ...(caseId ? { caseId } : {}),
        agbVersion: "2026-06",
        widerrufVersion: "2026-06",
        datenschutzVersion: "2026-06",
        immediateAccessConsent: "true",
        withdrawalLossAccepted: "true",
      },
      custom_text: {
        submit: {
          message: "Einmalige Zahlung · Kein Abo · digitale Inhalte nach bestätigter Zahlung",
        },
        terms_of_service_acceptance: {
          message:
            "Mit dem Kauf akzeptierst du unsere [AGB](https://chargebackpilot.de/agb). Du verlangst ausdrücklich, dass ChargebackPilot vor Ablauf der Widerrufsfrist mit der Ausführung des Vertrags beginnt. Du bestätigst, die [Widerrufshinweise](https://chargebackpilot.de/widerruf) für digitale Inhalte gelesen zu haben, und weißt, dass dein Widerrufsrecht bei vollständiger Vertragserfüllung vorzeitig erlöschen kann.",
        },
      },
      consent_collection: {
        terms_of_service: "required",
      },
    });

    void ipHash;
    void userAgentHash;

    if (caseId && session.id) {
      if (!isNaN(caseIdNum)) {
        await db
          .update(casesTable)
          .set({ stripeSessionId: session.id })
          .where(eq(casesTable.id, caseIdNum));
      }
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    req.log.error({ err }, "Stripe checkout failed");
    res.status(500).json({ error: msg });
  }
});

// ---------------------------------------------------------------------------
// Flatrate checkout — 9,99 € one-time, unlocks unlimited cases for 12 months
// ---------------------------------------------------------------------------
router.post("/flatrate-checkout", async (req, res) => {
  const { immediateAccessConsent, withdrawalLossAccepted } = req.body as {
    immediateAccessConsent?: boolean;
    withdrawalLossAccepted?: boolean;
  };

  if (!immediateAccessConsent || !withdrawalLossAccepted) {
    res.status(400).json({
      error:
        "Bitte bestätige die Hinweise zum sofortigen Beginn und zum möglichen Erlöschen des Widerrufsrechts.",
    });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ error: "Zahlung noch nicht konfiguriert." });
    return;
  }

  try {
    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      automatic_tax: { enabled: false },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "ChargebackPilot Flatrate — 12 Monate",
              description:
                "Digitale Formulierungshilfe für 12 Monate. Einmalzahlung, kein Abo, keine Rechtsberatung.",
            },
            unit_amount: 999,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/?flatrate_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?flatrate_cancel=1`,
      locale: "de",
      metadata: {
        mode: "flatrate",
        agbVersion: "2026-06",
        widerrufVersion: "2026-06",
        datenschutzVersion: "2026-06",
        immediateAccessConsent: "true",
        withdrawalLossAccepted: "true",
      },
      custom_text: {
        submit: { message: "Einmalig 9,99 € · 12 Monate unbegrenzte Freischaltung · Kein Abo" },
        terms_of_service_acceptance: {
          message:
            "Mit dem Kauf akzeptierst du unsere [AGB](https://chargebackpilot.de/agb). Du verlangst ausdrücklich, dass ChargebackPilot vor Ablauf der Widerrufsfrist mit der Ausführung des Vertrags beginnt. Du bestätigst, die [Widerrufshinweise](https://chargebackpilot.de/widerruf) für digitale Inhalte gelesen zu haben, und weißt, dass dein Widerrufsrecht bei vollständiger Vertragserfüllung vorzeitig erlöschen kann.",
        },
      },
      consent_collection: {
        terms_of_service: "required",
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    req.log.error({ err }, "Stripe flatrate checkout failed");
    res.status(500).json({ error: msg });
  }
});

// ---------------------------------------------------------------------------
// Verify a Checkout session — returns paid + mode + caseId
// ---------------------------------------------------------------------------
router.get("/checkout/verify/:sessionId", async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ paid: false });
    return;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const paid = session.payment_status === "paid";
    const mode = (session.metadata?.mode as "single" | "flatrate" | undefined) ?? "single";
    const caseIdMeta = session.metadata?.caseId;

    if (paid && mode === "single") {
      const caseIdNum = caseIdMeta ? parseInt(caseIdMeta, 10) : NaN;
      const amountCents = typeof session.amount_total === "number" ? session.amount_total : 99;
      if (!isNaN(caseIdNum)) {
        await db
          .update(casesTable)
          .set({
            paid: true,
            paidAt: new Date(),
            paidAmountCents: amountCents,
            stripeSessionId: session.id,
          })
          .where(and(eq(casesTable.id, caseIdNum), eq(casesTable.stripeSessionId, session.id)));
      }
    }

    res.json({ paid, mode, caseId: caseIdMeta ?? null });
  } catch (err) {
    req.log.error({ err }, "Stripe verify failed");
    res.status(400).json({ paid: false });
  }
});

// ---------------------------------------------------------------------------
// Stripe Webhook (Async fulfillment & security)
// ---------------------------------------------------------------------------
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret || !process.env.STRIPE_SECRET_KEY) {
    res.status(400).send(`Webhook Error: Missing signature or secret`);
    return;
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid") {
        const mode = (session.metadata?.mode as "single" | "flatrate" | undefined) ?? "single";
        const caseIdMeta = session.metadata?.caseId;

        if (mode === "single" && caseIdMeta) {
          const caseIdNum = parseInt(caseIdMeta, 10);
          const amountCents = typeof session.amount_total === "number" ? session.amount_total : 99;

          if (!isNaN(caseIdNum)) {
            await db
              .update(casesTable)
              .set({
                paid: true,
                paidAt: new Date(),
                paidAmountCents: amountCents,
                stripeSessionId: session.id,
              })
              .where(eq(casesTable.id, caseIdNum));
          }
        }
        // Note: for flatrate mode, we just let the frontend know via session_id matching,
        // or we could store flatrate unlocks in a separate users table if auth is added later.
      }
    }

    res.json({ received: true });
  } catch (err) {
    req.log.error({ err }, "Stripe webhook signature verification failed");
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
});

export default router;
