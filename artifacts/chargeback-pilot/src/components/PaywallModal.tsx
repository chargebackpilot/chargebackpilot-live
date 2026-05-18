import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  Check,
  Loader2,
  CreditCard,
  Smartphone,
  FileText,
  TrendingUp,
  ListChecks,
  Star,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { generatePdf } from "@/lib/pdf-generator";

interface PaywallProps {
  onUnlock: () => void;
  isPaying: boolean;
  caseId?: string;
  // Preview data for the "teaser" — what they'll get
  merchantName: string;
  amount: number;
  successProbability: number;
  paymentMethod: string;
  // Full data needed for PDF (only available after unlock)
  pdfData?: Parameters<typeof generatePdf>[0];
}

const BENEFITS = [
  {
    icon: FileText,
    title: "3 professionelle Textvorlagen",
    desc: "Händler-Anschreiben, Chargeback-Antrag, Eskalationsschreiben",
  },
  {
    icon: ListChecks,
    title: "Schritt-für-Schritt-Anleitung",
    desc: "Genau was du wo einträgst — auch für PayPal Käuferschutz",
  },
  {
    icon: TrendingUp,
    title: "Alle nächsten Schritte + Gegenargumente",
    desc: "Vollständige Strategie für maximale Erfolgschancen",
  },
  {
    icon: FileText,
    title: "PDF sofort herunterladen",
    desc: "Alles als druckfertiges Dokument mit deinen Daten",
  },
];

const TRUST_SIGNALS = [
  "Einmalig 0,99 € — kein Abo",
  "Sicherer Checkout via Stripe",
  "Sofortzugang nach Zahlung",
];

export function PaywallModal({
  onUnlock,
  isPaying,
  caseId,
  merchantName,
  amount,
  successProbability,
  paymentMethod,
}: PaywallProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPaypal = paymentMethod === "paypal";

  const handleCheckout = async () => {
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
        // Stripe not configured — use demo unlock
        onUnlock();
      }
    } catch {
      // Fallback: demo unlock
      onUnlock();
    } finally {
      setLoading(false);
    }
  };

  const probColor =
    successProbability >= 65
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : successProbability >= 40
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-white to-blue-50/40 overflow-hidden shadow-xl">
      {/* Top badge */}
      <div className="bg-primary px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Lock className="w-4 h-4" />
          Vollständige Analyse freischalten
        </div>
        <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
          0,99 €
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Case teaser */}
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${probColor}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-0.5">Dein Fall gegen</p>
            <p className="font-bold text-base">{merchantName}</p>
            <p className="text-sm opacity-80">{amount.toFixed(2)} EUR streitig</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">{successProbability}%</p>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Erfolgs-Score</p>
          </div>
        </div>

        {/* What's locked */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Das ist freigeschaltet:
          </p>
          <div className="space-y-2.5">
            {BENEFITS.map((b) => {
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

        {/* PayPal special teaser */}
        {isPaypal && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#003087]/10 flex items-center justify-center flex-shrink-0 text-base font-black text-[#003087]">P</div>
            <div>
              <p className="text-sm font-bold text-blue-900">PayPal Käuferschutz — Klick-für-Klick</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Du bekommst die genaue Anleitung: Menü, Kategorie, exakter Wortlaut — für maximale Erfolgsquote.
              </p>
            </div>
          </div>
        )}

        {/* Social proof */}
        <div className="flex items-center gap-1.5">
          {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
          <span className="text-xs text-muted-foreground ml-1">
            Über 2.400 Fälle erfolgreich eingereicht
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
                Jetzt für 0,99 € freischalten
              </>
            )}
          </Button>

          {/* Payment method icons */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-muted-foreground">Bezahlen mit:</span>
            <div className="flex items-center gap-2">
              <PaymentBadge label="Visa" />
              <PaymentBadge label="MC" />
              <PaymentBadge label="Amex" />
              <div className="flex items-center gap-1 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md">
                <Smartphone className="w-2.5 h-2.5" /> Pay
              </div>
              <div className="flex items-center gap-1 bg-[#003087] text-white text-[10px] font-bold px-2 py-1 rounded-md">
                Pay<span className="text-[#009cde]">Pal</span>
              </div>
            </div>
          </div>

          {/* Trust row */}
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

function PaymentBadge({ label }: { label: string }) {
  return (
    <div className="bg-white border border-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
      {label}
    </div>
  );
}
