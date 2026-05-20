import { Link } from "wouter";
import { LogoLockup } from "../ui/Logo";

export function Footer() {
  return (
    <footer className="bg-muted py-12 border-t">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center mb-4">
              <LogoLockup size={28} />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Dein KI-Pilot für Chargebacks & Zahlungsreklamationen — schnell, strukturiert und professionell formuliert.
            </p>
            <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
              <strong>Wichtiger Hinweis:</strong> ChargebackPilot bietet keine Rechtsberatung, keine Rechtsdienstleistung und keine Vertretung gegenüber Banken, Zahlungsdienstleistern oder Händlern. Die KI-Analyse erfolgt über die Gemini API von Google LLC und dient ausschließlich der allgemeinen Formulierungshilfe.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm mb-1">Produkt</h3>
              <Link href="/fall-pruefen" className="text-sm text-muted-foreground hover:text-foreground">Fall kostenlos prüfen</Link>
              <Link href="/ratgeber" className="text-sm text-muted-foreground hover:text-foreground">Ratgeber</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm mb-1">Themen</h3>
              <Link href="/paypal-chargeback" className="text-sm text-muted-foreground hover:text-foreground">PayPal-Käuferschutz</Link>
              <Link href="/visa-mastercard-chargeback" className="text-sm text-muted-foreground hover:text-foreground">Kreditkarte</Link>
              <Link href="/klarna-reklamation" className="text-sm text-muted-foreground hover:text-foreground">Klarna</Link>
              <Link href="/flug-chargeback" className="text-sm text-muted-foreground hover:text-foreground">Flug & Reise</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm mb-1">Rechtliches</h3>
              <Link href="/agb" className="text-sm text-muted-foreground hover:text-foreground">AGB</Link>
              <Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground">Impressum</Link>
              <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground">Datenschutz</Link>
              <Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground">Disclaimer</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ChargebackPilot — Keine Rechtsberatung. Keine Erfolgsgarantie.</span>
          <span className="flex items-center gap-3">
            <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
            <span className="opacity-40">·</span>
            <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
