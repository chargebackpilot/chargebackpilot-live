import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist", "public");
const serverEntry = path.join(root, "dist", "server", "entry-server.js");
const template = await fs.readFile(path.join(dist, "index.html"), "utf-8");
const { render } = await import(serverEntry);
const sitemap = await fs.readFile(path.join(root, "public", "sitemap.xml"), "utf-8");

const routeMeta = [
  ["/", "ChargebackPilot · KI-Hilfe für Chargeback, PayPal-Käuferschutz & Reklamation 2026", "Ware nicht erhalten, Flug ausgefallen, doppelt belastet? ChargebackPilot strukturiert deinen Fall mit KI und liefert unverbindliche Textentwürfe für deine Reklamation."],
  ["/vorlagen-generator", "Vorlagen-Generator · ChargebackPilot", "Erstelle in wenigen Schritten professionelle Reklamationsvorlagen für Händler, Bank/PayPal/Klarna und Eskalation."],
  ["/ratgeber", "Ratgeber & Chargeback-Guides 2026 | ChargebackPilot", "Über 30 Schritt-für-Schritt-Anleitungen für Käuferschutz, Chargeback und Reklamation — sortiert nach Zahlungsart, Anbieter und Problemtyp."],
  ["/paypal-chargeback", "PayPal Chargeback / Käuferschutz erfolgreich nutzen | ChargebackPilot", "PayPal Chargeback / Käuferschutz erfolgreich nutzen: typische Fristenhinweise, Belege und strukturierte Orientierung bei PayPal. Mit unverbindlichen Textentwürfen."],
  ["/amex-chargeback", "American Express Chargeback einleiten | ChargebackPilot", "American Express Chargeback einleiten: typische Fristenhinweise, Belege und strukturierte Orientierung bei Amex. Mit unverbindlichen Textentwürfen."],
  ["/visa-mastercard-chargeback", "Visa / Mastercard Chargeback: Geld zurück | ChargebackPilot", "Visa / Mastercard Chargeback: Geld zurück: typische Fristenhinweise, Belege und strukturierte Orientierung bei Kreditkarte. Mit unverbindlichen Textentwürfen."],
  ["/klarna-reklamation", "Klarna Reklamation & Käuferschutz | ChargebackPilot", "Klarna Reklamation & Käuferschutz: typische Fristenhinweise, Belege und strukturierte Orientierung bei Klarna. Mit unverbindlichen Textentwürfen."],
  ["/flug-chargeback", "Flug Chargeback / Reiserückerstattung | ChargebackPilot", "Flug Chargeback / Reiserückerstattung: typische Fristenhinweise, Belege und strukturierte Orientierung bei Flug/Reise. Mit unverbindlichen Textentwürfen."],
  ["/kiwi-rueckerstattung", "Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen | ChargebackPilot", "Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen: typische Fristenhinweise, Belege und strukturierte Orientierung bei Flug/Reise. Mit unverbindlichen Textentwürfen."],
  ["/lieferando-rueckerstattung", "Lieferando / Essen Rückerstattung | ChargebackPilot", "Lieferando / Essen Rückerstattung: typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen."],
  ["/wolt-rueckerstattung", "Wolt Rückerstattung (Essen kalt / nicht geliefert) | ChargebackPilot", "Wolt Rückerstattung (Essen kalt / nicht geliefert): typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen."],
  ["/ubereats-rueckerstattung", "Uber Eats Erstattung & Chargeback | ChargebackPilot", "Uber Eats Erstattung & Chargeback: typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen."],
  ["/ware-nicht-erhalten", "Chargeback: Ware nicht erhalten | ChargebackPilot", "Chargeback: Ware nicht erhalten: typische Fristenhinweise, Belege und strukturierte Orientierung bei Online-Shopping. Mit unverbindlichen Textentwürfen."],
  ["/abo-falle-chargeback", "Abo-Falle Chargeback | ChargebackPilot", "Abo-Falle Chargeback: typische Fristenhinweise, Belege und strukturierte Orientierung bei Abonnements. Mit unverbindlichen Textentwürfen."],
  ["/scam-shops-2026", "Scam-Shops 2026 erkennen & Geld zurückholen | ChargebackPilot", "Scam-Shops 2026: Warnsignale, Belege und nächste Schritte bei Fake-Shops, Käuferschutz und Chargeback."],
  ["/vergleich/paypal-vs-kreditkarte-vs-klarna", "PayPal vs Kreditkarte vs Klarna: Käuferschutz Vergleich 2026 | ChargebackPilot", "Welcher Weg ist in deinem Fall am besten? Vergleich von Fristen, Erfolgschancen und Vorgehen bei Rückerstattungen."],
];

const knownMeta = new Map(routeMeta.map(([route, title, description]) => [route, { title, description }]));
const sitemapRoutes = [...sitemap.matchAll(/<loc>https:\/\/chargebackpilot\.de([^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .filter((route) => route !== "/disclaimer");
const routes = [...new Set([...routeMeta.map(([route]) => route), ...sitemapRoutes])];

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function injectMeta(html, route, title, description) {
  const canonical = `https://chargebackpilot.de${route}`;
  return html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeAttr(title)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/>/i, `<meta name="description" content="${escapeAttr(description)}" />`)
    .replace(/<meta property="og:title" content=".*?"\s*\/>/i, `<meta property="og:title" content="${escapeAttr(title)}" />`)
    .replace(/<meta property="og:description" content=".*?"\s*\/>/i, `<meta property="og:description" content="${escapeAttr(description)}" />`)
    .replace(/<meta property="og:url" content=".*?"\s*\/>/i, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content=".*?"\s*\/>/i, `<meta name="twitter:title" content="${escapeAttr(title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\s*\/>/i, `<meta name="twitter:description" content="${escapeAttr(description)}" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/>/i, `<link rel="canonical" href="${canonical}" />`);
}

function fallbackMeta(route) {
  if (route.startsWith("/hilfe/")) {
    return {
      title: "Händler-spezifische Hilfe bei Reklamationen · ChargebackPilot",
      description: "Konkrete Leitfäden zu typischen Problemen bei bekannten Händlern inklusive Beweis-Checkliste und Eskalationspfad.",
    };
  }
  if (route.startsWith("/vergleich/")) {
    return {
      title: "PayPal vs Kreditkarte vs Klarna: Käuferschutz Vergleich 2026 | ChargebackPilot",
      description: "Welcher Weg ist in deinem Fall am besten? Vergleich von Fristen, Erfolgschancen und Vorgehen bei Rückerstattungen.",
    };
  }
  return {
    title: "ChargebackPilot · Chargeback & Reklamationshilfe",
    description: "ChargebackPilot unterstützt dich mit KI-gestützter Formulierungshilfe für Rückerstattungen und Reklamationen.",
  };
}

for (const route of routes) {
  const { title, description } = knownMeta.get(route) ?? fallbackMeta(route);
  const appHtml = render(route);
  const html = injectMeta(template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`), route, title, description);
  const file = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.slice(1), "index.html");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, html);
  console.log(`prerendered ${route}`);
}