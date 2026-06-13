import type { ReactElement } from "react";
import { Link } from "wouter";
import { LifeBuoy, ArrowRight } from "lucide-react";

interface PLProps {
  className?: string;
}

export function VisaLogo({ className = "" }: PLProps) {
  return (
    <div
      data-brand-logo="white"
      className={`inline-flex items-center justify-center bg-white border border-gray-200 rounded-md h-7 px-2 shadow-sm ${className}`}
      aria-label="Visa"
    >
      <span className="font-black italic text-[#1a1f71] text-sm tracking-tight">VISA</span>
    </div>
  );
}

export function MastercardLogo({ className = "" }: PLProps) {
  return (
    <div
      data-brand-logo="white"
      className={`inline-flex items-center justify-center bg-white border border-gray-200 rounded-md h-7 px-1.5 shadow-sm ${className}`}
      aria-label="Mastercard"
    >
      <span className="block w-3.5 h-3.5 rounded-full bg-[#eb001b]" />
      <span className="block w-3.5 h-3.5 rounded-full bg-[#f79e1b] -ml-1.5 mix-blend-multiply" />
    </div>
  );
}

export function AmexLogo({ className = "" }: PLProps) {
  return (
    <div
      data-brand-logo="amex"
      className={`inline-flex items-center justify-center bg-[#2e77bb] border border-gray-200 rounded-md h-7 px-2 shadow-sm ${className}`}
      aria-label="American Express"
    >
      <span className="font-extrabold text-white text-[10px] tracking-tight leading-none">
        AMEX
      </span>
    </div>
  );
}

export function PaypalLogo({ className = "" }: PLProps) {
  return (
    <div
      data-brand-logo="white"
      className={`inline-flex items-center justify-center bg-white border border-gray-200 rounded-md h-7 px-2 shadow-sm ${className}`}
      aria-label="PayPal"
    >
      <span className="font-black italic text-[#003087] text-xs leading-none">Pay</span>
      <span className="font-black italic text-[#0070ba] text-xs leading-none">Pal</span>
    </div>
  );
}

export function ApplePayLogo({ className = "" }: PLProps) {
  return (
    <div
      data-brand-logo="apple-pay"
      className={`inline-flex items-center justify-center bg-black rounded-md h-7 px-2.5 shadow-sm ${className}`}
      aria-label="Apple Pay"
    >
      <svg viewBox="0 0 24 24" className="w-3 h-3 mr-0.5 fill-white" aria-hidden="true">
        <path d="M17.05 12.04c-.03-2.93 2.39-4.33 2.5-4.4-1.36-2-3.49-2.27-4.24-2.3-1.81-.18-3.53 1.07-4.45 1.07-.93 0-2.34-1.05-3.85-1.02-1.98.03-3.81 1.15-4.83 2.92-2.06 3.57-.53 8.85 1.48 11.75.98 1.42 2.16 3.02 3.71 2.96 1.49-.06 2.05-.96 3.85-.96 1.79 0 2.31.96 3.88.93 1.6-.03 2.61-1.45 3.59-2.88 1.13-1.65 1.6-3.26 1.63-3.35-.03-.01-3.13-1.2-3.16-4.76M14.13 3.83c.82-1 1.37-2.38 1.22-3.76-1.18.05-2.61.79-3.46 1.78-.76.88-1.43 2.29-1.25 3.64 1.32.1 2.66-.67 3.49-1.66" />
      </svg>
      <span className="font-semibold text-white text-[11px] leading-none">Pay</span>
    </div>
  );
}

export function GooglePayLogo({ className = "" }: PLProps) {
  return (
    <div
      data-brand-logo="white"
      className={`inline-flex items-center justify-center bg-white border border-gray-200 rounded-md h-7 px-2 shadow-sm ${className}`}
      aria-label="Google Pay"
    >
      <span className="text-[#4285f4] font-bold text-[11px] leading-none">G</span>
      <span className="text-[#ea4335] font-bold text-[11px] leading-none">o</span>
      <span className="text-[#fbbc04] font-bold text-[11px] leading-none">o</span>
      <span className="text-[#4285f4] font-bold text-[11px] leading-none">g</span>
      <span className="text-[#34a853] font-bold text-[11px] leading-none">l</span>
      <span className="text-[#ea4335] font-bold text-[11px] leading-none">e</span>
      <span className="text-gray-600 font-semibold text-[11px] leading-none ml-1">Pay</span>
    </div>
  );
}

export function KlarnaLogo({ className = "" }: PLProps) {
  return (
    <div
      data-brand-logo="klarna"
      className={`inline-flex items-center justify-center bg-[#ffa8cd] rounded-md h-7 px-2.5 shadow-sm ${className}`}
      aria-label="Klarna"
    >
      <span className="font-black text-black text-[11px] tracking-tight leading-none">Klarna.</span>
    </div>
  );
}

export function SepaLogo({ className = "" }: PLProps) {
  return (
    <div
      data-brand-logo="sepa"
      className={`inline-flex items-center justify-center bg-[#00519E] rounded-md h-7 px-2 shadow-sm ${className}`}
      aria-label="SEPA Überweisung"
    >
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mr-1 fill-white" aria-hidden="true">
        <path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1L2 6v2h20V6z" />
      </svg>
      <span className="font-extrabold text-white text-[11px] tracking-tight leading-none">
        SEPA
      </span>
    </div>
  );
}

export function AppleGooglePayLogo({ className = "" }: PLProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <ApplePayLogo />
      <GooglePayLogo />
    </div>
  );
}

export function PaymentLogoStrip({ className = "" }: PLProps) {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap justify-center ${className}`}>
      <VisaLogo />
      <MastercardLogo />
      <AmexLogo />
      <ApplePayLogo />
      <GooglePayLogo />
      <PaypalLogo />
      <KlarnaLogo />
    </div>
  );
}

// ── Clickable help-grid ─────────────────────────────────────────────
// Each card communicates that ChargebackPilot HELPS the user when they
// had problems with that payment method — not that they need to pay
// with that method here.

interface PaymentHelpCard {
  id: string; // matches Wizard PAYMENT_METHODS id
  label: string;
  sub: string;
  Logo: (props: PLProps) => ReactElement;
}

const PAYMENT_HELP_CARDS: PaymentHelpCard[] = [
  {
    id: "paypal",
    label: "Mit PayPal bezahlt?",
    sub: "Käuferschutz und typische Fristen prüfen",
    Logo: PaypalLogo,
  },
  {
    id: "visa_mastercard",
    label: "Mit Kreditkarte bezahlt?",
    sub: "Reklamation über kartenausgebende Bank prüfen",
    Logo: ({ className = "" }: PLProps) => (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <VisaLogo />
        <MastercardLogo />
      </div>
    ),
  },
  {
    id: "amex",
    label: "Mit American Express bezahlt?",
    sub: "Streitfall strukturiert vorbereiten",
    Logo: AmexLogo,
  },
  {
    id: "klarna",
    label: "Mit Klarna bezahlt?",
    sub: "Problem melden und Zahlungspause prüfen",
    Logo: KlarnaLogo,
  },
  {
    id: "apple_google_pay",
    label: "Apple Pay / Google Pay?",
    sub: "Hinterlegte Zahlungsart identifizieren",
    Logo: AppleGooglePayLogo,
  },
  {
    id: "bank_transfer",
    label: "Per Überweisung gezahlt?",
    sub: "Mögliche Schritte bei Bank und Händler prüfen",
    Logo: SepaLogo,
  },
];

export function PaymentHelpGrid({ className = "" }: PLProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      {PAYMENT_HELP_CARDS.map((card) => (
        <Link key={card.id} href={`/vorlagen-generator?payment=${card.id}`}>
          <div
            className="group bg-white border-2 border-border hover:border-primary rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 h-full flex items-center gap-4"
            data-testid={`payment-help-card-${card.id}`}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <card.Logo />
              </div>
              <div className="font-semibold text-sm leading-tight">{card.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{card.sub}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </Link>
      ))}
    </div>
  );
}
