import { Link } from "wouter";
import { LogoLockup } from "../ui/Logo";
import { Facebook, Instagram, Linkedin, type LucideIcon } from "lucide-react";
import { SOCIAL_PROFILES } from "@/data/social-profiles";
import { openNewWizardCase } from "@/lib/case-persistence";

const SOCIAL_LINKS: {
  label: string;
  href: string;
  icon?: LucideIcon;
}[] = [
  { label: "LinkedIn", href: SOCIAL_PROFILES.linkedin, icon: Linkedin },
  { label: "X", href: SOCIAL_PROFILES.x },
  { label: "Facebook", href: SOCIAL_PROFILES.facebook, icon: Facebook },
  { label: "Instagram", href: SOCIAL_PROFILES.instagram, icon: Instagram },
];

function SocialMark({ Icon }: { Icon?: LucideIcon }) {
  if (Icon) return <Icon className="h-3.5 w-3.5" aria-hidden="true" />;

  return (
    <span className="text-[13px] font-black leading-none" aria-hidden="true">
      X
    </span>
  );
}

function SocialProfileIcon({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: string;
  icon?: LucideIcon;
}) {
  const className =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-background text-slate-500 transition hover:border-primary/35 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-700 dark:text-slate-400";

  if (!href) {
    return (
      <span
        className={`${className} cursor-default opacity-55`}
        role="img"
        aria-label={`${label} Profil noch nicht hinterlegt`}
        title={`${label} Profil noch nicht hinterlegt`}
      >
        <SocialMark Icon={Icon} />
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`${label} Profil öffnen`}
      title={`${label} Profil öffnen`}
    >
      <SocialMark Icon={Icon} />
    </a>
  );
}

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
            KI-gestützte Text-Generierung für Chargebacks und Käuferschutz. Strukturierte
            Briefvorlagen für PayPal, Visa, Mastercard und Klarna.
          </p>
          <div className="mb-4 flex items-center gap-2" aria-label="Social Media Profile">
            {SOCIAL_LINKS.map((profile) => (
              <SocialProfileIcon key={profile.label} {...profile} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
            <strong>Wichtiger Hinweis:</strong> ChargebackPilot bietet keine Rechtsberatung, keine
            Rechtsdienstleistung und keine Vertretung gegenüber Banken, Zahlungsdienstleistern oder
            Händlern. Die KI-Textgenerierung erfolgt über die Gemini API von Google LLC und dient
            ausschließlich der allgemeinen Formulierungshilfe.
          </p>
        </div>

        <div>
          <h2 className="font-bold mb-4 text-base">Produkt</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/vorlagen-generator?new=1"
                onClick={(e) => {
                  e.preventDefault();
                  handleNewCaseClick();
                }}
                className="hover:text-foreground transition-colors"
              >
                Kostenloser Fall-Check
              </Link>
            </li>
            <li>
              <Link href="/ratgeber" className="hover:text-foreground transition-colors">
                Ratgeber
              </Link>
            </li>
            <li>
              <Link
                href="/vergleich/paypal-vs-kreditkarte-vs-klarna"
                className="hover:text-foreground transition-colors"
              >
                Käuferschutz-Vergleich
              </Link>
            </li>
            <li>
              <Link href="/scam-shops-2026" className="hover:text-foreground transition-colors">
                Shop-Warnsignale erkennen
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold mb-4 text-base">Themen</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/paypal-chargeback" className="hover:text-foreground transition-colors">
                PayPal-Käuferschutz
              </Link>
            </li>
            <li>
              <Link
                href="/visa-mastercard-chargeback"
                className="hover:text-foreground transition-colors"
              >
                Kreditkarte
              </Link>
            </li>
            <li>
              <Link href="/klarna-reklamation" className="hover:text-foreground transition-colors">
                Klarna
              </Link>
            </li>
            <li>
              <Link href="/flug-chargeback" className="hover:text-foreground transition-colors">
                Flug & Reise
              </Link>
            </li>
            <li>
              <Link href="/ware-nicht-erhalten" className="hover:text-foreground transition-colors">
                Ware nicht erhalten
              </Link>
            </li>
            <li>
              <Link
                href="/abo-falle-chargeback"
                className="hover:text-foreground transition-colors"
              >
                Abo-Falle
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold mb-4 text-base">Anbieter</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/hilfe/amazon" className="hover:text-foreground transition-colors">
                Amazon
              </Link>
            </li>
            <li>
              <Link href="/hilfe/temu" className="hover:text-foreground transition-colors">
                Temu
              </Link>
            </li>
            <li>
              <Link href="/hilfe/kiwi" className="hover:text-foreground transition-colors">
                Kiwi.com
              </Link>
            </li>
            <li>
              <Link href="/hilfe/lieferando" className="hover:text-foreground transition-colors">
                Lieferando
              </Link>
            </li>
            <li>
              <Link href="/hilfe/ryanair" className="hover:text-foreground transition-colors">
                Ryanair
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold mb-4 text-base">Rechtliches</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/impressum" className="hover:text-foreground transition-colors">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="hover:text-foreground transition-colors">
                Datenschutz
              </Link>
            </li>
            <li>
              <Link href="/ueber-uns" className="hover:text-foreground transition-colors">
                Über uns
              </Link>
            </li>
            <li>
              <Link href="/methodik" className="hover:text-foreground transition-colors">
                Methodik
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="hover:text-foreground transition-colors">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="/agb" className="hover:text-foreground transition-colors">
                AGB
              </Link>
            </li>
            <li>
              <Link href="/widerruf" className="hover:text-foreground transition-colors">
                Widerruf
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl pt-8 border-t text-center text-sm text-muted-foreground">
        <p className="mb-2">
          ChargebackPilot ist ein unabhängiges Software-Tool und bietet keine Rechtsberatung oder
          rechtliche Vertretung an.
        </p>
        <p>
          Alle generierten Texte sind Formulierungshilfen und müssen vom Nutzer selbstständig auf
          Richtigkeit geprüft und versendet werden.
        </p>
        <p className="mt-4">
          &copy; {new Date().getFullYear()} ChargebackPilot. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
