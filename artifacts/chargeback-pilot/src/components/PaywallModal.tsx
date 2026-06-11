import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Check,
  Loader2,
  CreditCard,
  FileText,
  ListChecks,
  AlertCircle,
  Sparkles,
  FileSignature,
  ShieldCheck,
  MailCheck,
  Building2,
  Landmark,
} from "lucide-react";
import type { PdfData } from "@/lib/pdf-generator";
import { PaymentLogoStrip } from "@/components/PaymentLogos";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface PaywallProps {
  onUnlock: () => void;
  isPaying: boolean;
  caseId?: string;
  merchantName: string;
  amount: number;
  /** Qualitative strategy band — "Hoch" | "Mittel" | "Niedrig" from the analysis */
  strategyLabel: string;
  paymentMethod: string;
  pdfData?: PdfData;
}

interface Benefit {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}

/**
 * Dynamic benefits — the third item is tailored to the user's payment channel.
 * Avoids advertising a "PayPal-Anleitung" when the user paid by credit card.
 */
function getBenefits(paymentMethod: string): Benefit[] {
  const channelBenefit = ((): Benefit => {
    switch (paymentMethod) {
      case "paypal":
        return {
          icon: ListChecks,
          title: "Klick-für-Klick PayPal-Anleitung",
          desc: "Welches Menü, welche Kategorie, welcher Wortlaut — als strukturierte Orientierung für deinen Käuferschutz-Fall.",
        };
      case "credit_card":
      case "visa":
      case "mastercard":
      case "visa_mastercard":
      case "amex":
        return {
          icon: Landmark,
          title: "Kreditkarten-Chargeback-Antrag",
          desc: "Sachlicher Entwurf an deine Bank inklusive möglicher Kategorie und allgemeiner Fristenhinweise.",
        };
      case "klarna":
        return {
          icon: ListChecks,
          title: "Klarna-Käuferschutz Schritt-für-Schritt",
          desc: "Welche Belege hilfreich sein können und wie du eine Zahlungspause bei Klarna prüfen kannst.",
        };
      case "apple_pay":
      case "google_pay":
      case "apple_google_pay":
        return {
          icon: Landmark,
          title: "Chargeback über deine hinterlegte Karte",
          desc: "Apple/Google Pay nutzt häufig eine hinterlegte Karte — wir helfen dir, die zuständige Stelle zu identifizieren.",
        };
      case "bank_transfer":
      case "sepa":
        return {
          icon: Building2,
          title: "SEPA-Rückruf & Händler-Eskalation",
          desc: "Allgemeine Hinweise zur SEPA-Rückgabe und sachlicher Eskalationsentwurf an den Händler.",
        };
      default:
        return {
          icon: ListChecks,
          title: "Schritt-für-Schritt-Anleitung für deinen Zahlungsweg",
          desc: "Exakter Reklamationspfad, abgestimmt auf die Zahlungsart, mit der du bezahlt hast.",
        };
    }
  })();

  return [
    {
      icon: FileText,
      title: "3 professionelle Textvorlagen",
      desc: "Händler-Anschreiben, Antrag an Zahlungsdienstleister und Eskalationsentwurf — vor Versand selbst prüfen.",
    },
    {
      icon: FileSignature,
      title: "DIN-Briefe als PDF",
      desc: "Druckfertige DIN-5008-Briefe mit deiner Adresse, Bestellnummer und Unterschriftzeile.",
    },
    channelBenefit,
    {
      icon: MailCheck,
      title: "Alle nächsten Schritte + Gegenargumente",
      desc: "Strukturierte Orientierung inkl. möglicher Einwände und sachlicher Antwortvorschläge.",
    },
  ];
}

const TRUST_SIGNALS = [
  "Einmalig 0,99 € Endpreis — kein Abo",
  "Sicherer Checkout via Stripe",
  "Zugang nach bestätigter Zahlung",
];

/** Map raw analysis label to a softer, qualitative band shown to the user. */
function toStrategyBand(label: string): { name: string; tone: string } {
  const l = (label ?? "").toLowerCase();
  if (l === "hoch") return { name: "Aussichtsreich", tone: "emerald" };
  if (l === "mittel") return { name: "Solide Ausgangslage", tone: "amber" };
  if (l === "niedrig") return { name: "Anspruchsvoll", tone: "rose" };
  return { name: "Wird analysiert", tone: "slate" };
}

const TONE_CLASSES: Record<string, string> = {
  emerald: "text-emerald-800 bg-emerald-50 border-emerald-200",
  amber: "text-amber-800 bg-amber-50 border-amber-200",
  rose: "text-rose-800 bg-rose-50 border-rose-200",
  slate: "text-slate-700 bg-slate-50 border-slate-200",
};

export function PaywallModal({
  onUnlock,
  isPaying,
  caseId,
  merchantName,
  amount,
  strategyLabel,
  paymentMethod,
}: PaywallProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const benefits = getBenefits(paymentMethod);
  const band = toStrategyBand(strategyLabel);
  const bandClass = TONE_CLASSES[band.tone] ?? TONE_CLASSES.slate;

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
        }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error || "Zahlungssystem aktuell nicht erreichbar.");
      }
    } catch {
      setError("Netzwerkfehler. Bitte überprüfe deine Internetverbindung.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-white to-blue-50/40 overflow-hidden shadow-xl">
      {/* Top badge */}
      <div className="bg-primary px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Lock className="w-4 h-4" />
          Alle Dokumente freischalten
        </div>
        <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
          0,99 € Endpreis
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Case teaser — qualitative band, no raw % */}
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 ${bandClass}`}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-0.5">
              Dein Fall gegen
            </p>
            <p className="font-bold text-base truncate">{merchantName}</p>
            <p className="text-sm opacity-80">{amount.toFixed(2)} EUR streitig</p>
          </div>
          <div className="text-right flex-shrink-0 pl-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
              Strategie-Einschätzung
            </p>
            <p className="text-lg font-black leading-tight">{band.name}</p>
            <p className="text-[10px] opacity-70 italic">indikativ, keine Rechtsberatung</p>
          </div>
        </div>

        {/* What's locked */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Das ist freigeschaltet:
          </p>
          <div className="space-y-2.5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Value reminder */}
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-900 leading-snug">
            <strong>Hinweis:</strong> Ein klar formuliertes Anschreiben und ein passender Grund
            (Reason Code) können die Nachvollziehbarkeit deines Antrags verbessern.
          </span>
        </div>

        {/* Checkout CTA */}
        <div className="space-y-3 pt-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Im nächsten Schritt im sicheren Stripe-Checkout bestätigst du AGB und Widerrufshinweise.
            Der Kauf ist eine einmalige Bereitstellung digitaler Inhalte; es entsteht kein Abo.
          </p>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            size="lg"
            className="w-full min-h-[3.5rem] px-3 py-3 text-sm sm:text-base font-bold gap-2 shadow-lg shadow-primary/20"
            onClick={handleCheckout}
            disabled={loading || isPaying}
          >
            {loading || isPaying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                <span className="min-w-0 leading-tight text-center">
                  <span className="block">Weiter zum sicheren Checkout</span>
                  <span className="block text-[11px] sm:text-xs font-semibold opacity-85">
                    0,99 € Endpreis · kein Abo
                  </span>
                </span>
              </>
            )}
          </Button>

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Bezahlen mit
            </span>
            <PaymentLogoStrip />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
            {TRUST_SIGNALS.map((t) => (
              <span key={t} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
