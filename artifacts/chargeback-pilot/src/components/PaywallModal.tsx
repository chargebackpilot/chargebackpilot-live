import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { generatePdf } from "@/lib/pdf-generator";
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
  pdfData?: Parameters<typeof generatePdf>[0];
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
          desc: "Welches Menü, welche Kategorie, welcher Wortlaut — für maximale Erfolgsquote im Käuferschutz.",
        };
      case "credit_card":
      case "visa":
      case "mastercard":
      case "visa_mastercard":
      case "amex":
        return {
          icon: Landmark,
          title: "Kreditkarten-Chargeback-Antrag",
          desc: "Genauer Brief an deine Bank inkl. Reason Code und Frist­berechnung (60–120 Tage).",
        };
      case "klarna":
        return {
          icon: ListChecks,
          title: "Klarna-Käuferschutz Schritt-für-Schritt",
          desc: "Welcher Streitgrund, welche Belege — und wie du eine Mahnung sofort stoppst.",
        };
      case "apple_pay":
      case "google_pay":
      case "apple_google_pay":
        return {
          icon: Landmark,
          title: "Chargeback über deine hinterlegte Karte",
          desc: "Apple/Google Pay nutzt deine Karte — wir zeigen dir den exakten Weg über die ausstellende Bank.",
        };
      case "bank_transfer":
      case "sepa":
        return {
          icon: Building2,
          title: "SEPA-Rückruf & Händler-Eskalation",
          desc: "6-Wochen-Rückruf bei SEPA-Lastschrift plus direkter Eskalationsweg an den Händler.",
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
      desc: "Händler-Anschreiben, Chargeback-Antrag und Eskalationsschreiben — sofort kopierbereit.",
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
      desc: "Vollständige Strategie inkl. typischer Händler-Ausreden und passenden Antworten.",
    },
  ];
}

const TRUST_SIGNALS = [
  "Einmalig 0,99 € (inkl. MwSt.) — kein Abo",
  "Sicherer Checkout via Stripe",
  "Sofortzugang nach Zahlung",
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
  const [consentWiderruf, setConsentWiderruf] = useState(false);

  const handleCheckout = async () => {
    if (!consentWiderruf) {
      setError("Bitte bestätige den Verzicht auf das Widerrufsrecht, um fortzufahren.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        // Stripe not configured — demo unlock
        onUnlock();
      }
    } catch {
      onUnlock();
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
          0,99 € (inkl. MwSt.)
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Case teaser — qualitative band, no raw % */}
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${bandClass}`}>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-0.5">Dein Fall gegen</p>
            <p className="font-bold text-base truncate">{merchantName}</p>
            <p className="text-sm opacity-80">{amount.toFixed(2)} EUR streitig</p>
          </div>
          <div className="text-right flex-shrink-0 pl-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Strategie-Einschätzung</p>
            <p className="text-lg font-black leading-tight">{band.name}</p>
            <p className="text-[10px] opacity-70 italic">indikativ, keine </p>
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
            <strong>Tipp:</strong> Ohne rechtssicheres Anschreiben und korrekten Grund (Reason Code) sinkt die Chance auf eine Rückerstattung signifikant.
          </span>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-1">
          <Button
            size="lg"
            className="w-full h-13 text-base font-bold gap-2 shadow-lg shadow-primary/20"
            onClick={handleCheckout}
            disabled={loading || isPaying}
          >
            {loading || isPaying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Zahlungspflichtig bestellen (0,99 € inkl. MwSt.)
              </>
            )}
          </Button>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={consentWiderruf}
              onCheckedChange={(checked) => setConsentWiderruf(Boolean(checked))}
            />
            <label className="text-sm leading-relaxed text-muted-foreground">
              Ich habe gelesen, dass ich mit der Ausführung des digitalen Vertrags mein Widerrufsrecht verliere. <a href="/widerruf" target="_blank" className="underline hover:text-foreground">Mehr dazu</a>.
            </label>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Bezahlen mit</span>
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

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
