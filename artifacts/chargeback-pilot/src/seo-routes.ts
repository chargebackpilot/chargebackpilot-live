import { generateMerchantProblemCopy, getMerchant, getProblem } from "@/data/merchants";
import { isIndexableMerchantProblemPath, SEO_QUALITY_CONFIG } from "@/seo-quality";

export type SeoRouteType = "landing" | "guide" | "legal" | "trust" | "compare";
export type SitemapChangeFreq = "weekly" | "monthly" | "yearly";

export interface SeoRouteMeta {
  path: string;
  title: string;
  description: string;
  changefreq: SitemapChangeFreq;
  priority: number;
  type: SeoRouteType;
  section?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export const SITE_ORIGIN = "https://chargebackpilot.de";
export const SEO_LASTMOD = SEO_QUALITY_CONFIG.lastmod;

export function isMerchantProblemPath(pathname: string) {
  return /^\/hilfe\/[^/]+\/[^/]+$/.test(normalizeRoutePath(pathname));
}

export function isIndexableRoutePath(pathname: string) {
  const normalized = normalizeRoutePath(pathname);
  if (isMerchantProblemPath(normalized)) return isIndexableMerchantProblemPath(normalized);
  const meta = findSeoRoute(normalized);
  return !meta?.noindex;
}

export const SEO_ROUTES: SeoRouteMeta[] = [
  {
    path: "/",
    title: "ChargebackPilot · KI-Hilfe für Chargeback, PayPal-Käuferschutz & Reklamation 2026",
    description:
      "Ware nicht erhalten, Flug ausgefallen, doppelt belastet? ChargebackPilot strukturiert deinen Fall mit KI und liefert unverbindliche Textentwürfe für deine Reklamation.",
    changefreq: "weekly",
    priority: 1.0,
    type: "landing",
    section: "core",
  },
  {
    path: "/ratgeber",
    title: "Ratgeber & Chargeback-Guides 2026 | ChargebackPilot",
    description:
      "Praxisnahe Schritt-für-Schritt-Anleitungen für Käuferschutz, Chargeback und Reklamation — sortiert nach Zahlungsart, Anbieter und Problemtyp.",
    changefreq: "weekly",
    priority: 0.8,
    type: "guide",
    section: "content",
  },
  {
    path: "/vorlagen-generator",
    title: "Vorlagen-Generator · ChargebackPilot",
    description:
      "Erstelle in wenigen Schritten professionelle Reklamationsvorlagen für Händler, Bank/PayPal/Klarna und Eskalation.",
    changefreq: "weekly",
    priority: 0.9,
    type: "landing",
    section: "core",
  },
  {
    path: "/paypal-chargeback",
    title: "PayPal Chargeback / Käuferschutz erfolgreich nutzen | ChargebackPilot",
    description:
      "PayPal Chargeback / Käuferschutz erfolgreich nutzen: typische Fristenhinweise, Belege und strukturierte Orientierung bei PayPal. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "payments",
  },
  {
    path: "/amex-chargeback",
    title: "American Express Chargeback einleiten | ChargebackPilot",
    description:
      "American Express Chargeback einleiten: typische Fristenhinweise, Belege und strukturierte Orientierung bei Amex. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/visa-mastercard-chargeback",
    title: "Visa / Mastercard Chargeback: Geld zurück | ChargebackPilot",
    description:
      "Visa / Mastercard Chargeback: Geld zurück: typische Fristenhinweise, Belege und strukturierte Orientierung bei Kreditkarte. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/klarna-reklamation",
    title: "Klarna Reklamation & Käuferschutz | ChargebackPilot",
    description:
      "Klarna Reklamation & Käuferschutz: typische Fristenhinweise, Belege und strukturierte Orientierung bei Klarna. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/flug-chargeback",
    title: "Flug Chargeback / Reiserückerstattung | ChargebackPilot",
    description:
      "Flug Chargeback / Reiserückerstattung: typische Fristenhinweise, Belege und strukturierte Orientierung bei Flug/Reise. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "travel",
  },
  {
    path: "/kiwi-rueckerstattung",
    title: "Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen | ChargebackPilot",
    description:
      "Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen: typische Fristenhinweise, Belege und strukturierte Orientierung bei Flug/Reise. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "travel",
  },
  {
    path: "/lieferando-rueckerstattung",
    title: "Lieferando / Essen Rückerstattung | ChargebackPilot",
    description:
      "Lieferando / Essen Rückerstattung: typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "food",
  },
  {
    path: "/wolt-rueckerstattung",
    title: "Wolt Rückerstattung (Essen kalt / nicht geliefert) | ChargebackPilot",
    description:
      "Wolt Rückerstattung (Essen kalt / nicht geliefert): typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "food",
  },
  {
    path: "/ubereats-rueckerstattung",
    title: "Uber Eats Erstattung & Chargeback | ChargebackPilot",
    description:
      "Uber Eats Erstattung & Chargeback: typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "food",
  },
  {
    path: "/ware-nicht-erhalten",
    title: "Chargeback: Ware nicht erhalten | ChargebackPilot",
    description:
      "Chargeback: Ware nicht erhalten: typische Fristenhinweise, Belege und strukturierte Orientierung bei Online-Shopping. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "shopping",
  },
  {
    path: "/abo-falle-chargeback",
    title: "Abo-Falle Chargeback | ChargebackPilot",
    description:
      "Abo-Falle Chargeback: typische Fristenhinweise, Belege und strukturierte Orientierung bei Abonnements. Mit unverbindlichen Textentwürfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "subscriptions",
  },
  {
    path: "/chargeback-antrag-vorlage",
    title: "Chargeback Antrag Vorlage für Bank & Kreditkarte | ChargebackPilot",
    description:
      "Chargeback Antrag Vorlage: sachlicher Mustertext für Bank, Visa, Mastercard und Amex mit Belegen, Fristenhinweisen und strukturierter Fallbeschreibung.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/paypal-kaeuferschutz-vorlage",
    title: "PayPal Käuferschutz Vorlage: Fall richtig formulieren | ChargebackPilot",
    description:
      "PayPal Käuferschutz Vorlage für Ware nicht erhalten, abweichende Ware und Konflikt-Eskalation. Mit sachlicher Struktur und Beleg-Checkliste.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/klarna-reklamation-vorlage",
    title: "Klarna Reklamation Vorlage: Problem melden | ChargebackPilot",
    description:
      "Klarna Reklamation Vorlage: Ware fehlt, Retoure nicht verbucht oder Rechnung klären. Sachlicher Textentwurf mit Belegen und nächsten Schritten.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/ware-nicht-erhalten-musterbrief",
    title: "Ware nicht erhalten Musterbrief | ChargebackPilot",
    description:
      "Ware nicht erhalten? Musterbrief für Händler, PayPal, Klarna oder Bank mit Tracking, Zahlungsnachweis und strukturierter Fristsetzung.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/abo-falle-musterbrief",
    title: "Abo-Falle Musterbrief: Abbuchung widersprechen | ChargebackPilot",
    description:
      "Abo-Falle Musterbrief für ungewollte Abbuchungen, Kündigungsnachweis und Rückbuchungsprüfung bei Bank, Kreditkarte oder PayPal.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/rueckerstattung-haendler-vorlage",
    title: "Rückerstattung Händler Vorlage | ChargebackPilot",
    description:
      "Rückerstattung vom Händler sachlich fordern: Vorlage für Retoure, nicht erbrachte Leistung, Erstattungszusage und Zahlungsnachweis.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/visa-reason-code-13-1",
    title: "Visa Reason Code 13.1: Ware nicht erhalten | ChargebackPilot",
    description:
      "Visa Reason Code 13.1 verständlich erklärt: Ware oder Leistung nicht erhalten, Belege ordnen und Chargeback-Anfrage bei der Bank vorbereiten.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/mastercard-chargeback-reason-code",
    title: "Mastercard Chargeback Reason Codes | ChargebackPilot",
    description:
      "Mastercard Chargeback Reason Codes: typische Reklamationsgründe, Belege und sachliche Vorbereitung für die Bank.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/scam-shops-2026",
    title: "Scam-Shops 2026 erkennen & Geld zurückholen | ChargebackPilot",
    description:
      "Scam-Shops 2026: Warnsignale, Belege und nächste Schritte bei Fake-Shops, Käuferschutz und Chargeback.",
    changefreq: "weekly",
    priority: 0.8,
    type: "guide",
    section: "trust",
  },
  {
    path: "/vergleich/paypal-vs-kreditkarte-vs-klarna",
    title: "PayPal vs Kreditkarte vs Klarna: Käuferschutz Vergleich 2026 | ChargebackPilot",
    description:
      "Welcher Weg ist in deinem Fall am besten? Vergleich von Fristen, Erfolgschancen und Vorgehen bei Rückerstattungen.",
    changefreq: "monthly",
    priority: 0.8,
    type: "compare",
    section: "trust",
  },
  {
    path: "/impressum",
    title: "Impressum · ChargebackPilot",
    description:
      "Impressum von ChargebackPilot gemäß den geltenden Informationspflichten für Online-Angebote in Deutschland.",
    changefreq: "yearly",
    priority: 0.3,
    type: "legal",
    section: "legal",
  },
  {
    path: "/datenschutz",
    title: "Datenschutzerklärung · ChargebackPilot",
    description:
      "Datenschutzerklärung von ChargebackPilot mit Informationen zur Datenverarbeitung, Rechtsgrundlagen und Betroffenenrechten.",
    changefreq: "yearly",
    priority: 0.3,
    type: "legal",
    section: "legal",
  },
  {
    path: "/ueber-uns",
    title: "Über ChargebackPilot · Verbraucherhilfe mit KI",
    description:
      "Was ChargebackPilot ist, für wen das Tool gedacht ist und warum es keine Rechtsberatung, sondern strukturierte Verbraucherhilfe mit KI bietet.",
    changefreq: "yearly",
    priority: 0.3,
    type: "trust",
    section: "trust",
  },
  {
    path: "/methodik",
    title: "So funktioniert die Einschätzung · ChargebackPilot",
    description:
      "Transparente Methodik von ChargebackPilot: Wie die KI-Einschätzung entsteht, welche Daten verwendet werden und wo die Grenzen der automatischen Orientierung liegen.",
    changefreq: "yearly",
    priority: 0.3,
    type: "trust",
    section: "trust",
  },
  {
    path: "/disclaimer",
    title: "Disclaimer · Keine Rechtsberatung · ChargebackPilot",
    description:
      "Wichtige Hinweise zum Leistungsumfang von ChargebackPilot: keine Rechtsberatung, keine Vertretung und keine Erfolgsgarantie.",
    changefreq: "yearly",
    priority: 0.3,
    type: "legal",
    section: "legal",
  },
  {
    path: "/agb",
    title: "Allgemeine Geschäftsbedingungen (AGB) · ChargebackPilot",
    description:
      "Allgemeine Geschäftsbedingungen von ChargebackPilot für Nutzung, Leistungsumfang, Vergütung und Haftung.",
    changefreq: "yearly",
    priority: 0.3,
    type: "legal",
    section: "legal",
  },
  {
    path: "/widerruf",
    title: "Widerrufsbelehrung · ChargebackPilot",
    description:
      "Widerrufsbelehrung von ChargebackPilot mit Fristen, Voraussetzungen und Musterinformationen für Verbraucher.",
    changefreq: "yearly",
    priority: 0.3,
    type: "legal",
    section: "legal",
  },
];

export function normalizeRoutePath(pathname: string) {
  return pathname.replace(/\/$/, "") || "/";
}

export function findSeoRoute(pathname: string) {
  const normalized = normalizeRoutePath(pathname);
  return SEO_ROUTES.find((route) => route.path === normalized);
}

export function getRouteMeta(pathname: string): SeoRouteMeta | null {
  const normalized = normalizeRoutePath(pathname);
  const staticMeta = findSeoRoute(normalized);
  if (staticMeta) return staticMeta;

  const merchantProblemMatch = normalized.match(/^\/hilfe\/([^/]+)\/([^/]+)$/);
  if (merchantProblemMatch) {
    const merchant = getMerchant(merchantProblemMatch[1]);
    const problem = getProblem(merchantProblemMatch[2]);
    if (!merchant || !problem || !merchant.problems.includes(problem.slug)) return null;
    const copy = generateMerchantProblemCopy(merchant, problem);
    return {
      path: normalized,
      title: `${copy.title} | ChargebackPilot`,
      description: copy.metaDescription,
      changefreq: "monthly",
      priority: 0.6,
      type: "guide",
      section: merchant.sector,
      noindex: !isIndexableMerchantProblemPath(normalized),
    };
  }

  const merchantIndexMatch = normalized.match(/^\/hilfe\/([^/]+)$/);
  if (merchantIndexMatch) {
    const merchant = getMerchant(merchantIndexMatch[1]);
    if (!merchant) return null;
    return {
      path: normalized,
      title: `${merchant.name} Reklamation & Chargeback 2026 | ChargebackPilot`,
      description: `Probleme mit ${merchant.name}? Hier findest du Schritt-für-Schritt-Anleitungen für alle häufigen ${merchant.name}-Probleme: Lieferung, Defekte, Erstattung und mehr.`,
      changefreq: "monthly",
      priority: 0.7,
      type: "guide",
      section: merchant.sector,
    };
  }

  return null;
}
