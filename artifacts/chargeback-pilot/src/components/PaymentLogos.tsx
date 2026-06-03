import type { ReactElement } from "react";
import { Link } from "wouter";
import { LifeBuoy, ArrowRight } from "lucide-react";

interface PLProps { className?: string }

function TextBadge({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-md border border-gray-200 bg-white h-7 px-2.5 text-[11px] font-semibold text-slate-700 shadow-sm ${className}`}>
      {label}
    </span>
  );
}

export function VisaLogo({ className = "" }: PLProps) {
  return <TextBadge label="Visa" className={className} />;
}

export function MastercardLogo({ className = "" }: PLProps) {
  return <TextBadge label="Mastercard" className={className} />;
}

export function AmexLogo({ className = "" }: PLProps) {
  return <TextBadge label="American Express" className={className} />;
}

export function PaypalLogo({ className = "" }: PLProps) {
  return <TextBadge label="PayPal" className={className} />;
}

export function ApplePayLogo({ className = "" }: PLProps) {
  return <TextBadge label="Apple Pay" className={className} />;
}

export function GooglePayLogo({ className = "" }: PLProps) {
  return <TextBadge label="Google Pay" className={className} />;
}

export function KlarnaLogo({ className = "" }: PLProps) {
  return <TextBadge label="Klarna" className={className} />;
}

export function SepaLogo({ className = "" }: PLProps) {
  return <TextBadge label="SEPA" className={className} />;
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
  { id: "paypal", label: "Mit PayPal bezahlt?", sub: "Käuferschutz und typische Fristen prüfen", Logo: PaypalLogo },
  { id: "visa_mastercard", label: "Mit Kreditkarte bezahlt?", sub: "Reklamation über kartenausgebende Bank prüfen", Logo: VisaLogo },
  { id: "amex", label: "Mit American Express bezahlt?", sub: "Streitfall strukturiert vorbereiten", Logo: AmexLogo },
  { id: "klarna", label: "Mit Klarna bezahlt?", sub: "Problem melden und Zahlungspause prüfen", Logo: KlarnaLogo },
  { id: "apple_google_pay", label: "Apple Pay / Google Pay?", sub: "Hinterlegte Zahlungsart identifizieren", Logo: AppleGooglePayLogo },
  { id: "bank_transfer", label: "Per Überweisung gezahlt?", sub: "Mögliche Schritte bei Bank und Händler prüfen", Logo: SepaLogo },
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
