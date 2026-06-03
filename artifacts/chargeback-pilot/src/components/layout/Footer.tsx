import { Link } from "wouter";
import { useLocation } from "wouter";
import { LogoLockup } from "../ui/Logo";

export function Footer() {
  const [pathname] = useLocation();

  return (
    <footer className="bg-muted/20 border-t py-12 px-4 mt-auto">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
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
            <li><Link href="/vorlagen-generator" className="hover:text-foreground transition-colors">Vorlagen generieren</Link></li>
            <li><Link href="/ratgeber" className="hover:text-foreground transition-colors">Ratgeber</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Themen</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/paypal-chargeback" className="hover:text-foreground transition-colors">PayPal-Käuferschutz</Link></li>
            <li><Link href="/visa-mastercard-chargeback" className="hover:text-foreground transition-colors">Kreditkarte</Link></li>
            <li><Link href="/klarna-reklamation" className="hover:text-foreground transition-colors">Klarna</Link></li>
            <li><Link href="/flug-chargeback" className="hover:text-foreground transition-colors">Flug & Reise</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Rechtliches</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link></li>
            <li><Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link></li>
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
