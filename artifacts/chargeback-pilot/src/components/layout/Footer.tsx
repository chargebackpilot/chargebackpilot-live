import { Link } from "wouter";
import { Plane } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted py-12 border-t">
      <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mb-4">
            <Plane className="w-6 h-6 rotate-45" />
            <span>ChargebackPilot</span>
          </Link>
          <p className="text-sm text-muted-foreground mb-4">
            Dein KI-Pilot für Chargebacks & Zahlungsreklamationen.
            Schnell, strukturiert und professionell formuliert.
          </p>
          <p className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-3">
            <strong>Wichtiger Hinweis:</strong> ChargebackPilot bietet keine Rechtsberatung, keine Rechtsdienstleistung und keine Vertretung gegenüber Banken, Zahlungsdienstleistern oder Händlern. Die Inhalte dienen nur der allgemeinen Information und Formulierungshilfe.
          </p>
        </div>
        
        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-sm">Produkt</h3>
            <Link href="/fall-pruefen" className="text-sm text-muted-foreground hover:text-foreground">Fall prüfen</Link>
            <Link href="/ratgeber" className="text-sm text-muted-foreground hover:text-foreground">Ratgeber</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-sm">Rechtliches</h3>
            <Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground">Impressum</Link>
            <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground">Datenschutz</Link>
            <Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
