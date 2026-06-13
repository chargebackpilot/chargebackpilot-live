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
    title: "PayPal Chargeback / Käuferschutz strukturiert vorbereiten | ChargebackPilot",
    description:
      "PayPal Chargeback und Käuferschutz sauber unterscheiden: Konfliktcenter, Eskalation, Belege und Zahlungsweg strukturiert vorbereiten.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "payments",
  },
  {
    path: "/amex-chargeback",
    title: "American Express Chargeback einleiten | ChargebackPilot",
    description:
      "American Express Chargeback vorbereiten: Umsatz, Händlerkontakt, Belege und Reklamationsgrund sachlich für Amex einordnen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/visa-mastercard-chargeback",
    title: "Visa / Mastercard Chargeback vorbereiten | ChargebackPilot",
    description:
      "Visa und Mastercard Chargeback vorbereiten: Kartenumsatz, Händlerkontakt, Reason-Code-Einordnung und Belege für die Bank strukturieren.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/klarna-reklamation",
    title: "Klarna Reklamation & Käuferschutz | ChargebackPilot",
    description:
      "Klarna Reklamation vorbereiten: Rechnung, Retoure, Problemmeldung und Händlerkommunikation strukturiert dokumentieren.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/flug-chargeback",
    title: "Flug Chargeback / Reiserückerstattung | ChargebackPilot",
    description:
      "Flug Chargeback und Reiserückerstattung vorbereiten: Stornierung, Buchung, Händlerkontakt und Zahlungsweg nachvollziehbar sortieren.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "travel",
  },
  {
    path: "/kiwi-rueckerstattung",
    title: "Kiwi.com Rückerstattung: Steuern, Gebühren & Zahlungsweg prüfen | ChargebackPilot",
    description:
      "Kiwi.com Rückerstattung prüfen: Steuern, Gebühren, Buchungsdaten und möglichen Zahlungsweg strukturiert vorbereiten.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "travel",
  },
  {
    path: "/lieferando-rueckerstattung",
    title: "Lieferando / Essen Rückerstattung | ChargebackPilot",
    description:
      "Lieferando Rückerstattung bei kaltem, falschem oder fehlendem Essen: Fotos, Zeitstempel, Supportverlauf und Zahlungsweg strukturieren.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "food",
  },
  {
    path: "/wolt-rueckerstattung",
    title: "Wolt Rückerstattung (Essen kalt / nicht geliefert) | ChargebackPilot",
    description:
      "Wolt Rückerstattung vorbereiten: fehlende, kalte oder falsche Lieferung dokumentieren und Supportverlauf samt Zahlungsweg sortieren.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "food",
  },
  {
    path: "/ubereats-rueckerstattung",
    title: "Uber Eats Erstattung & Chargeback | ChargebackPilot",
    description:
      "Uber Eats Erstattung und mögliche Zahlungsreklamation vorbereiten: App-Status, Fotos, Support-Tickets und Zahlungsweg strukturiert sammeln.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "food",
  },
  {
    path: "/ware-nicht-erhalten",
    title: "Chargeback: Ware nicht erhalten | ChargebackPilot",
    description:
      "Ware nicht erhalten? Chargeback, PayPal Käuferschutz oder Klarna-Reklamation mit Tracking, Händlerkontakt und Zahlungsnachweis vorbereiten.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "shopping",
  },
  {
    path: "/abo-falle-chargeback",
    title: "Abo-Falle Chargeback | ChargebackPilot",
    description:
      "Abo-Falle Chargeback vorbereiten: ungewollte Abbuchungen, Kündigungsnachweis, Vertragsgrundlage und Zahlungsweg sachlich prüfen.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "subscriptions",
  },
  {
    path: "/chargeback-antrag-vorlage",
    title: "Chargeback Antrag Vorlage für Bank & Kreditkarte | ChargebackPilot",
    description:
      "Chargeback Antrag Vorlage für Bank und Kreditkarte: Sachverhalt, Belege, Händlerkontakt und Umsatzreklamation strukturiert vorbereiten.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/paypal-kaeuferschutz-vorlage",
    title: "PayPal Käuferschutz Vorlage: Fall sachlich formulieren | ChargebackPilot",
    description:
      "PayPal Käuferschutz Vorlage: Konflikt sachlich formulieren, Belege ordnen und Eskalation im PayPal-Konto nachvollziehbar vorbereiten.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/klarna-reklamation-vorlage",
    title: "Klarna Reklamation Vorlage: Problem melden & Zahlung klären | ChargebackPilot",
    description:
      "Klarna Reklamation Vorlage: Problem im Klarna-Konto melden, Rechnung oder Retoure klären und Händlerkommunikation strukturiert dokumentieren.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/ware-nicht-erhalten-musterbrief",
    title: "Ware nicht erhalten Musterbrief an Händler, PayPal oder Bank | ChargebackPilot",
    description:
      "Ware nicht erhalten Musterbrief: Händlerkontakt, Tracking, Zahlungsnachweis und Käuferschutz oder Chargeback strukturiert vorbereiten.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/abo-falle-musterbrief",
    title: "Abo-Falle Musterbrief: Abbuchung widersprechen | ChargebackPilot",
    description:
      "Abo-Falle Musterbrief für ungewollte Abbuchungen: Anbieter anschreiben, Kündigung dokumentieren und Zahlungsreklamation vorbereiten.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/rueckerstattung-haendler-vorlage",
    title: "Rückerstattung Händler Vorlage: sachlich Erstattung anfordern | ChargebackPilot",
    description:
      "Rückerstattung Händler Vorlage: Retoure, nicht erbrachte Leistung, Erstattungszusage und Zahlungsnachweis sachlich zusammenfassen.",
    changefreq: "monthly",
    priority: 0.8,
    type: "guide",
    section: "templates",
  },
  {
    path: "/visa-reason-code-13-1",
    title: "Visa Reason Code 13.1: Ware oder Leistung nicht erhalten | ChargebackPilot",
    description:
      "Visa Reason Code 13.1 verständlich erklärt: Ware oder Leistung nicht erhalten, Belege ordnen und Chargeback-Anfrage bei der Bank vorbereiten.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/mastercard-chargeback-reason-code",
    title: "Mastercard Chargeback Reason Codes: Fall richtig einordnen | ChargebackPilot",
    description:
      "Mastercard Chargeback Reason Codes: typische Reklamationsgründe, Belege und sachliche Vorbereitung für die Bank.",
    changefreq: "monthly",
    priority: 0.7,
    type: "guide",
    section: "payments",
  },
  {
    path: "/scam-shops-2026",
    title: "Fake-Shop-Verdacht & auffällige Online-Shops 2026 | ChargebackPilot",
    description:
      "Verdacht auf Fake-Shop oder auffälligen Online-Shop? Die wichtigsten Warnsignale 2026 plus strukturierte Orientierung zu Chargeback, PayPal-Käuferschutz und möglicher Lastschrift-Rückgabe.",
    changefreq: "weekly",
    priority: 0.8,
    type: "guide",
    section: "trust",
  },
  {
    path: "/vergleich/paypal-vs-kreditkarte-vs-klarna",
    title:
      "PayPal vs. Kreditkarte vs. Klarna — welcher Käuferschutz ist 2026 besser? | ChargebackPilot",
    description:
      "Vergleich 2026: PayPal-Käuferschutz, Kreditkarten-Reklamation und Klarna-Käuferschutz im Überblick. Typische Fristen, Abläufe und Vor- und Nachteile — als unverbindliche Orientierung.",
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
