import { Router } from "express";
import Stripe from "stripe";
import { db, casesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";

const router = Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

function getBaseUrl(): string {
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
  const { caseId } = req.body as { caseId?: string };

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ error: "Zahlung noch nicht konfiguriert. Bitte STRIPE_SECRET_KEY setzen." });
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
              name: "ChargebackPilot — Fall freischalten",
              description: "3 professionelle Textvorlagen + PDF-Download + Schritt-für-Schritt-Anleitung. Geld-zurück-Garantie bei nachgewiesener Ablehnung.",
            },
            unit_amount: 99,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/fall-pruefen?payment_success=1&case_id=${caseId ?? ""}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/fall-pruefen?payment_cancel=1&case_id=${caseId ?? ""}`,
      locale: "de",
      metadata: { mode: "single", ...(caseId ? { caseId } : {}) },
      custom_text: {
        submit: { message: "Einmalige Zahlung · Keine Abos · Sofortzugang nach Zahlung · Geld-zurück bei Ablehnung" },
      },
    });

    if (caseId && session.id) {
      const idNum = parseInt(caseId, 10);
      if (!isNaN(idNum)) {
        await db
          .update(casesTable)
          .set({ stripeSessionId: session.id })
          .where(eq(casesTable.id, idNum));
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
              description: "Unbegrenzte Fall-Freischaltungen für 12 Monate. Geld-zurück-Garantie pro Fall bei nachgewiesener Ablehnung.",
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
      metadata: { mode: "flatrate" },
      custom_text: {
        submit: { message: "Einmalig 9,99 € · 12 Monate unbegrenzte Freischaltung · Kein Abo" },
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

export default router;
