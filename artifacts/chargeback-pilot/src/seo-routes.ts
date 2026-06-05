export interface SeoRouteMeta {
  path: string;
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

export const SITE_ORIGIN = "https://chargebackpilot.de";

export const SEO_ROUTES: SeoRouteMeta[] = [
  {
    path: "/",
    title: "ChargebackPilot · KI-Hilfe für Chargeback, PayPal-Käuferschutz & Reklamation 2026",
    description: "Ware nicht erhalten, Flug ausgefallen, doppelt belastet? ChargebackPilot strukturiert deinen Fall mit KI und liefert unverbindliche Textentwürfe für deine Reklamation.",
  },
  {
    path: "/ratgeber",
    title: "Ratgeber & Chargeback-Guides 2026 | ChargebackPilot",
    description: "Über 30 Schritt-für-Schritt-Anleitungen für Käuferschutz, Chargeback und Reklamation — sortiert nach Zahlungsart, Anbieter und Problemtyp.",
  },
  { path: "/paypal-chargeback", title: "PayPal Chargeback / Käuferschutz erfolgreich nutzen | ChargebackPilot", description: "PayPal Chargeback / Käuferschutz erfolgreich nutzen: typische Fristenhinweise, Belege und strukturierte Orientierung bei PayPal. Mit unverbindlichen Textentwürfen." },
  { path: "/amex-chargeback", title: "American Express Chargeback einleiten | ChargebackPilot", description: "American Express Chargeback einleiten: typische Fristenhinweise, Belege und strukturierte Orientierung bei Amex. Mit unverbindlichen Textentwürfen." },
  { path: "/visa-mastercard-chargeback", title: "Visa / Mastercard Chargeback: Geld zurück | ChargebackPilot", description: "Visa / Mastercard Chargeback: Geld zurück: typische Fristenhinweise, Belege und strukturierte Orientierung bei Kreditkarte. Mit unverbindlichen Textentwürfen." },
  { path: "/klarna-reklamation", title: "Klarna Reklamation & Käuferschutz | ChargebackPilot", description: "Klarna Reklamation & Käuferschutz: typische Fristenhinweise, Belege und strukturierte Orientierung bei Klarna. Mit unverbindlichen Textentwürfen." },
  { path: "/flug-chargeback", title: "Flug Chargeback / Reiserückerstattung | ChargebackPilot", description: "Flug Chargeback / Reiserückerstattung: typische Fristenhinweise, Belege und strukturierte Orientierung bei Flug/Reise. Mit unverbindlichen Textentwürfen." },
  { path: "/kiwi-rueckerstattung", title: "Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen | ChargebackPilot", description: "Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen: typische Fristenhinweise, Belege und strukturierte Orientierung bei Flug/Reise. Mit unverbindlichen Textentwürfen." },
  { path: "/lieferando-rueckerstattung", title: "Lieferando / Essen Rückerstattung | ChargebackPilot", description: "Lieferando / Essen Rückerstattung: typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen." },
  { path: "/wolt-rueckerstattung", title: "Wolt Rückerstattung (Essen kalt / nicht geliefert) | ChargebackPilot", description: "Wolt Rückerstattung (Essen kalt / nicht geliefert): typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen." },
  { path: "/ubereats-rueckerstattung", title: "Uber Eats Erstattung & Chargeback | ChargebackPilot", description: "Uber Eats Erstattung & Chargeback: typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen." },
  { path: "/ware-nicht-erhalten", title: "Chargeback: Ware nicht erhalten | ChargebackPilot", description: "Chargeback: Ware nicht erhalten: typische Fristenhinweise, Belege und strukturierte Orientierung bei Online-Shopping. Mit unverbindlichen Textentwürfen." },
  { path: "/abo-falle-chargeback", title: "Abo-Falle Chargeback | ChargebackPilot", description: "Abo-Falle Chargeback: typische Fristenhinweise, Belege und strukturierte Orientierung bei Abonnements. Mit unverbindlichen Textentwürfen." },
  { path: "/scam-shops-2026", title: "Scam-Shops 2026 erkennen & Geld zurückholen | ChargebackPilot", description: "Scam-Shops 2026: Warnsignale, Belege und nächste Schritte bei Fake-Shops, Käuferschutz und Chargeback." },
  { path: "/vergleich/paypal-vs-kreditkarte-vs-klarna", title: "PayPal vs Kreditkarte vs Klarna: Käuferschutz Vergleich 2026 | ChargebackPilot", description: "Welcher Weg ist in deinem Fall am besten? Vergleich von Fristen, Erfolgschancen und Vorgehen bei Rückerstattungen." },
  { path: "/impressum", title: "Impressum · ChargebackPilot", description: "Impressum von ChargebackPilot gemäß den geltenden Informationspflichten für Online-Angebote in Deutschland." },
  { path: "/datenschutz", title: "Datenschutzerklärung · ChargebackPilot", description: "Datenschutzerklärung von ChargebackPilot mit Informationen zur Datenverarbeitung, Rechtsgrundlagen und Betroffenenrechten." },
  { path: "/agb", title: "Allgemeine Geschäftsbedingungen (AGB) · ChargebackPilot", description: "Allgemeine Geschäftsbedingungen von ChargebackPilot für Nutzung, Leistungsumfang, Vergütung und Haftung." },
  { path: "/widerruf", title: "Widerrufsbelehrung · ChargebackPilot", description: "Widerrufsbelehrung von ChargebackPilot mit Fristen, Voraussetzungen und Musterinformationen für Verbraucher." },
];

export function findSeoRoute(pathname: string) {
  return SEO_ROUTES.find((route) => route.path === pathname);
}