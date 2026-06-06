import { Link } from "wouter";
import { LogoLockup } from "../ui/Logo";
import { openNewWizardCase } from "@/lib/case-persistence";

export function Footer() {
  const handleNewCaseClick = () => {
    openNewWizardCase();
  };

  return (
    <footer className="bg-muted/20 border-t py-12 px-4 mt-auto">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-6 gap-8 mb-8">
        <div className="md:col-span-2">
          <Link href="/" className="inline-block mb-4">
            <LogoLockup size={24} />
          </Link>
          <p className="text-sm text-muted-foreground mb-4 max-w-md leading-relaxed">
            KI-gestützte Text-Generierung für Chargebacks und Käuferschutz. 
            Strukturierte Briefvorlagen für PayPal, Visa, Mastercard und Klarna.
          </p>
          <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
            <strong>Wichtiger Hinweis:</strong> ChargebackPilot bietet keine Rechtsberatung, keine Rechtsdienstleistung und keine Vertretung gegenüber Banken, Zahlungsdienstleistern oder Händlern. Die KI-Textgenerierung erfolgt über die Gemini API von Google LLC und dient ausschließlich der allgemeinen Formulierungshilfe.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-4">Produkt</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/vorlagen-generator?new=1" onClick={(e) => { e.preventDefault(); handleNewCaseClick(); }} className="hover:text-foreground transition-colors">Kostenloser Fall-Check</Link></li>
            <li><Link href="/ratgeber" className="hover:text-foreground transition-colors">Ratgeber</Link></li>
            <li><Link href="/vergleich/paypal-vs-kreditkarte-vs-klarna" className="hover:text-foreground transition-colors">Käuferschutz-Vergleich</Link></li>
            <li><Link href="/scam-shops-2026" className="hover:text-foreground transition-colors">Scam-Shops erkennen</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Themen</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/paypal-chargeback" className="hover:text-foreground transition-colors">PayPal-Käuferschutz</Link></li>
            <li><Link href="/visa-mastercard-chargeback" className="hover:text-foreground transition-colors">Kreditkarte</Link></li>
            <li><Link href="/klarna-reklamation" className="hover:text-foreground transition-colors">Klarna</Link></li>
            <li><Link href="/flug-chargeback" className="hover:text-foreground transition-colors">Flug & Reise</Link></li>
            <li><Link href="/ware-nicht-erhalten" className="hover:text-foreground transition-colors">Ware nicht erhalten</Link></li>
            <li><Link href="/abo-falle-chargeback" className="hover:text-foreground transition-colors">Abo-Falle</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Anbieter</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/hilfe/amazon" className="hover:text-foreground transition-colors">Amazon</Link></li>
            <li><Link href="/hilfe/temu" className="hover:text-foreground transition-colors">Temu</Link></li>
            <li><Link href="/hilfe/kiwi" className="hover:text-foreground transition-colors">Kiwi.com</Link></li>
            <li><Link href="/hilfe/lieferando" className="hover:text-foreground transition-colors">Lieferando</Link></li>
            <li><Link href="/hilfe/ryanair" className="hover:text-foreground transition-colors">Ryanair</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Rechtliches</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link></li>
            <li><Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link></li>
            <li><Link href="/ueber-uns" className="hover:text-foreground transition-colors">Über uns</Link></li>
            <li><Link href="/methodik" className="hover:text-foreground transition-colors">Methodik</Link></li>
            <li><Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link></li>
            <li><Link href="/agb" className="hover:text-foreground transition-colors">AGB</Link></li>
            <li><Link href="/widerruf" className="hover:text-foreground transition-colors">Widerruf</Link></li>
            
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto max-w-7xl pt-8 border-t text-center text-sm text-muted-foreground">
        <p className="mb-2">
          ChargebackPilot ist ein unabhängiges Software-Tool und bietet keine Rechtsberatung oder rechtliche Vertretung an. 
        </p>
        <p>
          Alle generierten Texte sind Formulierungshilfen und müssen vom Nutzer selbstständig auf Richtigkeit geprüft und versendet werden.
        </p>
        <p className="mt-4">
          &copy; {new Date().getFullYear()} ChargebackPilot. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
