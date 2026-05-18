import { Router } from "express";
import Stripe from "stripe";

const router = Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

function getBaseUrl(): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const first = domains.split(",")[0].trim();
    return `https://${first}`;
  }
  return "http://localhost:80";
}

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
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "ChargebackPilot — Fall freischalten",
              description:
                "3 professionelle Textvorlagen + PDF-Download + Schritt-für-Schritt-Anleitung",
              images: [],
            },
            unit_amount: 99,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/fall-pruefen?payment_success=1&case_id=${caseId ?? ""}`,
      cancel_url: `${baseUrl}/fall-pruefen?case_id=${caseId ?? ""}`,
      locale: "de",
      custom_text: {
        submit: {
          message:
            "Einmalige Zahlung · Keine Abos · Sofortzugang nach Zahlung",
        },
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    res.status(500).json({ error: msg });
  }
});

router.get("/checkout/verify/:sessionId", async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ paid: false });
    return;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
    );
    res.json({ paid: session.payment_status === "paid" });
  } catch {
    res.status(400).json({ paid: false });
  }
});

export default router;
