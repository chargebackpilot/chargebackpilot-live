// Central catalog for programmatic SEO pages: /hilfe/:merchantSlug/:problemSlug
// Each combo produces a long-tail page targeting "<merchant> <problem>" searches.

export interface ProblemDef {
  slug: string;
  label: string;
  /** Search-friendly phrase for h1/title. */
  searchPhrase: string;
  /** Default payment methods that apply to this problem. */
  paymentMethods: ("paypal" | "kreditkarte" | "klarna" | "lastschrift" | "apple_pay")[];
  /** Wizard prefill key (matches Wizard PROBLEM_TYPES ids). */
  wizardProblemId: string;
}

export interface MerchantDef {
  slug: string;
  name: string;
  /** Sector for grouping. */
  sector:
    | "marketplace"
    | "airline"
    | "travel"
    | "food_delivery"
    | "subscription"
    | "fashion"
    | "electronics"
    | "logistics"
    | "app_store";
  /** Country of incorporation — affects EU consumer-rights notes. */
  country: string;
  /** Trustworthiness signal: "trusted" | "mixed" | "risky" | "scam_reported". */
  trustLevel: "trusted" | "mixed" | "risky" | "scam_reported";
  /** Short factual blurb (no defamation). */
  description: string;
  /** Slugs of problems applicable to this merchant. */
  problems: string[];
}

export const PROBLEMS: ProblemDef[] = [
  {
    slug: "ware-nicht-erhalten",
    label: "Ware nicht erhalten",
    searchPhrase: "Ware nicht erhalten",
    paymentMethods: ["paypal", "kreditkarte", "klarna"],
    wizardProblemId: "not_received",
  },
  {
    slug: "ware-defekt",
    label: "Ware defekt oder falsch geliefert",
    searchPhrase: "Ware defekt oder falsch beschrieben",
    paymentMethods: ["paypal", "kreditkarte", "klarna"],
    wizardProblemId: "defective",
  },
  {
    slug: "flug-storniert",
    label: "Flug gestrichen oder verschoben",
    searchPhrase: "Flug gestrichen oder umgebucht",
    paymentMethods: ["kreditkarte", "paypal"],
    wizardProblemId: "flight_travel",
  },
  {
    slug: "hotel-anders-als-beschrieben",
    label: "Hotel anders als beschrieben",
    searchPhrase: "Hotel oder Unterkunft mangelhaft",
    paymentMethods: ["kreditkarte", "paypal"],
    wizardProblemId: "flight_travel",
  },
  {
    slug: "abbuchung-ohne-zustimmung",
    label: "Unberechtigte Abbuchung / Abo-Falle",
    searchPhrase: "ungewollte Abbuchung oder Abo-Falle",
    paymentMethods: ["lastschrift", "kreditkarte", "paypal"],
    wizardProblemId: "subscription",
  },
  {
    slug: "lieferung-falsch",
    label: "Lieferung falsch oder unbrauchbar",
    searchPhrase: "Essenslieferung falsch oder unbrauchbar",
    paymentMethods: ["paypal", "kreditkarte"],
    wizardProblemId: "food_delivery",
  },
  {
    slug: "betrugsverdacht",
    label: "Betrugsverdacht / Fake-Shop",
    searchPhrase: "Fake-Shop oder Betrug",
    paymentMethods: ["kreditkarte", "paypal"],
    wizardProblemId: "fraud",
  },
];

export const MERCHANTS: MerchantDef[] = [
  // ── Marketplaces ───────────────────────────────────────────────
  {
    slug: "temu",
    name: "Temu",
    sector: "marketplace",
    country: "China",
    trustLevel: "mixed",
    description:
      "Chinesischer Online-Marktplatz mit besonders niedrigen Preisen. Häufige Beschwerden betreffen Lieferzeiten, Produktqualität und Rückerstattungen.",
    problems: ["ware-nicht-erhalten", "ware-defekt", "betrugsverdacht"],
  },
  {
    slug: "shein",
    name: "Shein",
    sector: "fashion",
    country: "Singapur / China",
    trustLevel: "mixed",
    description:
      "Fast-Fashion-Plattform mit Sitz in Singapur. Häufige Beschwerden zu Größen, Materialqualität und verspäteten Lieferungen.",
    problems: ["ware-nicht-erhalten", "ware-defekt"],
  },
  {
    slug: "wish",
    name: "Wish",
    sector: "marketplace",
    country: "USA",
    trustLevel: "risky",
    description:
      "US-Marktplatz mit Schwerpunkt auf chinesische Drittanbieter. Verbraucherzentralen warnen regelmäßig vor Produkt- und Lieferproblemen.",
    problems: ["ware-nicht-erhalten", "ware-defekt", "betrugsverdacht"],
  },
  {
    slug: "aliexpress",
    name: "AliExpress",
    sector: "marketplace",
    country: "China",
    trustLevel: "mixed",
    description:
      "Chinesischer Marktplatz (Alibaba-Gruppe). Käuferschutz vorhanden, Bearbeitungszeit oft mehrere Wochen.",
    problems: ["ware-nicht-erhalten", "ware-defekt"],
  },
  {
    slug: "amazon",
    name: "Amazon",
    sector: "marketplace",
    country: "USA / Deutschland",
    trustLevel: "trusted",
    description:
      "Größter Online-Händler in Deutschland. Eigener A-bis-Z--Schutz; bei Drittanbietern oft zusätzlicher Chargeback nötig.",
    problems: ["ware-nicht-erhalten", "ware-defekt", "abbuchung-ohne-zustimmung"],
  },
  {
    slug: "zalando",
    name: "Zalando",
    sector: "fashion",
    country: "Deutschland",
    trustLevel: "trusted",
    description:
      "Deutscher Modehändler mit etabliertem Kundenservice. Typische Reklamationen betreffen Rücksendungen, fehlende Pakete oder fehlerhafte Artikel.",
    problems: ["ware-nicht-erhalten", "ware-defekt", "abbuchung-ohne-zustimmung"],
  },
  {
    slug: "otto",
    name: "OTTO",
    sector: "marketplace",
    country: "Deutschland",
    trustLevel: "trusted",
    description:
      "Deutscher Onlinehändler und Marktplatz. Bei Liefer- oder Qualitätsproblemen ist eine klare Trennung zwischen OTTO und Drittanbieter praktisch wichtig.",
    problems: ["ware-nicht-erhalten", "ware-defekt"],
  },
  {
    slug: "ebay",
    name: "eBay",
    sector: "marketplace",
    country: "USA / Deutschland",
    trustLevel: "mixed",
    description:
      "Internationaler Marktplatz mit privaten und gewerblichen Verkäufern. Bei Streitfällen sind Belege zum Artikelzustand, Versand und Verkäuferkontakt entscheidend.",
    problems: ["ware-nicht-erhalten", "ware-defekt", "betrugsverdacht"],
  },
  {
    slug: "vinted",
    name: "Vinted",
    sector: "marketplace",
    country: "Litauen",
    trustLevel: "mixed",
    description:
      "Secondhand-Marktplatz für private Verkäufe. Häufige Klärungspunkte sind Versandstatus, Artikelzustand und die Kommunikation im Plattform-Chat.",
    problems: ["ware-nicht-erhalten", "ware-defekt", "betrugsverdacht"],
  },
  {
    slug: "etsy",
    name: "Etsy",
    sector: "marketplace",
    country: "USA / Irland",
    trustLevel: "mixed",
    description:
      "Marktplatz für handgemachte, kreative und personalisierte Waren. Bei Problemen helfen klare Screenshots von Angebot, Lieferstatus und Verkäuferkontakt.",
    problems: ["ware-nicht-erhalten", "ware-defekt"],
  },

  // ── Airlines ───────────────────────────────────────────────────
  {
    slug: "ryanair",
    name: "Ryanair",
    sector: "airline",
    country: "Irland",
    trustLevel: "mixed",
    description:
      "Irischer Billigflieger. EU-Fluggastrechte (VO 261/2004) gelten; Erstattungen oft erst nach Mahnung oder Chargeback.",
    problems: ["flug-storniert"],
  },
  {
    slug: "lufthansa",
    name: "Lufthansa",
    sector: "airline",
    country: "Deutschland",
    trustLevel: "trusted",
    description:
      "Deutsche Premium-Airline. Erstattungsprozess seit 2020 deutlich verbessert, aber bei Stornierungen ist ein Chargeback weiterhin sinnvoll als Druckmittel.",
    problems: ["flug-storniert"],
  },
  {
    slug: "eurowings",
    name: "Eurowings",
    sector: "airline",
    country: "Deutschland",
    trustLevel: "trusted",
    description:
      "Lufthansa-Tochter mit Fokus auf europäische Strecken. EU-Fluggastrechte gelten in vollem Umfang.",
    problems: ["flug-storniert"],
  },

  // ── Travel / Hotels ────────────────────────────────────────────
  {
    slug: "booking",
    name: "Booking.com",
    sector: "travel",
    country: "Niederlande",
    trustLevel: "trusted",
    description:
      "Weltweit größte Hotelbuchungsplattform. Vermittler-Rolle — bei Problemen vor Ort ist Eskalation an Booking + ggf. Chargeback der schnellste Weg.",
    problems: ["hotel-anders-als-beschrieben", "flug-storniert"],
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    sector: "travel",
    country: "USA / Irland",
    trustLevel: "trusted",
    description:
      "Privatunterkunfts-Plattform mit eigenem AirCover-Schutz. Bei abgelehnten Beschwerden ist Chargeback über die Kreditkarte möglich.",
    problems: ["hotel-anders-als-beschrieben"],
  },

  // ── Food delivery ──────────────────────────────────────────────
  {
    slug: "lieferando",
    name: "Lieferando",
    sector: "food_delivery",
    country: "Niederlande / Deutschland",
    trustLevel: "trusted",
    description:
      "Größter Lieferdienst in Deutschland. Häufige Gründe für Chargebacks sind unvollständige, kalte oder gar nicht gelieferte Bestellungen.",
    problems: ["lieferung-falsch", "ware-nicht-erhalten", "abbuchung-ohne-zustimmung"],
  },
  {
    slug: "wolt",
    name: "Wolt",
    sector: "food_delivery",
    country: "Finnland",
    trustLevel: "trusted",
    description:
      "Lebensmittel- und Essenslieferant. Erstattungen werden oft beim Support angefragt, wenn das Essen kalt ankommt oder fehlt.",
    problems: ["lieferung-falsch", "ware-nicht-erhalten"],
  },
  {
    slug: "uber-eats",
    name: "Uber Eats",
    sector: "food_delivery",
    country: "USA / Niederlande",
    trustLevel: "trusted",
    description:
      "Internationaler Essenslieferdienst. Wenn Bestellungen storniert werden oder Fahrer den Umweg nehmen, kommt das Essen oft kalt an.",
    problems: ["lieferung-falsch", "ware-nicht-erhalten"],
  },

  // ── Logistics / parcel delivery ─────────────────────────────────
  {
    slug: "dhl",
    name: "DHL",
    sector: "logistics",
    country: "Deutschland",
    trustLevel: "trusted",
    description:
      "Paketdienstleister in Deutschland. Bei nicht zugestellten Sendungen ist zusätzlich zum Händlerkontakt oft der Tracking- und Zustellnachweis relevant.",
    problems: ["ware-nicht-erhalten"],
  },
  {
    slug: "hermes",
    name: "Hermes",
    sector: "logistics",
    country: "Deutschland",
    trustLevel: "mixed",
    description:
      "Paketdienstleister für Privat- und Händlerlieferungen. Für Reklamationen sind Sendungsnummer, Zustellstatus und Kontakt zum Vertragspartner wichtig.",
    problems: ["ware-nicht-erhalten"],
  },

  // ── Travel aggregator ───────────────────────────────────────────
  {
    slug: "kiwi",
    name: "Kiwi.com",
    sector: "travel",
    country: "Tschechien",
    trustLevel: "mixed",
    description:
      "Flugsuchmaschine und Buchungsportal. Verlangt oft hohe eigene Gebühren für die Erstattung von Steuern und Flughafengebühren.",
    problems: ["flug-storniert", "abbuchung-ohne-zustimmung"],
  },

  // ── Subscription services ──────────────────────────────────────
  {
    slug: "spotify",
    name: "Spotify",
    sector: "subscription",
    country: "Schweden",
    trustLevel: "trusted",
    description:
      "Music-Streaming-Marktführer. Bei nicht erkannten Abbuchungen ist die SEPA-Lastschriftrückgabe der schnellste Weg.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
  {
    slug: "netflix",
    name: "Netflix",
    sector: "subscription",
    country: "USA",
    trustLevel: "trusted",
    description:
      "Streaming-Anbieter. Bei doppelten oder unautorisierten Abbuchungen kontaktiert man zuerst Netflix-Support; Chargeback als Notfallhebel.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
  {
    slug: "dazn",
    name: "DAZN",
    sector: "subscription",
    country: "Großbritannien",
    trustLevel: "mixed",
    description:
      "Sport-Streaming-Dienst. Häufige Verbraucherbeschwerden zu Preisanpassungen und Kündigungsmöglichkeiten.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
  {
    slug: "sky",
    name: "Sky Deutschland",
    sector: "subscription",
    country: "Deutschland",
    trustLevel: "mixed",
    description:
      "Pay-TV- und Streaming-Anbieter. Häufige Themen sind nicht akzeptierte Kündigungen und automatische Vertragsverlängerungen.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
  {
    slug: "apple",
    name: "Apple / iTunes",
    sector: "subscription",
    country: "USA",
    trustLevel: "trusted",
    description:
      "App-Store und Abo-Plattform. Für In-App-Käufe oder Abo-Abbuchungen ist Apples eigene Erstattung der erste Weg.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
  {
    slug: "google-play",
    name: "Google Play",
    sector: "app_store",
    country: "USA / Irland",
    trustLevel: "trusted",
    description:
      "App-Store und Zahlungsplattform für Android-Apps, In-App-Käufe und Abonnements. Bei unklaren Abbuchungen ist die Bestellnummer aus dem Google-Konto zentral.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
];

// ── Helpers ───────────────────────────────────────────────────────
export function getMerchant(slug: string): MerchantDef | null {
  return MERCHANTS.find((m) => m.slug === slug) ?? null;
}

export function getProblem(slug: string): ProblemDef | null {
  return PROBLEMS.find((p) => p.slug === slug) ?? null;
}

export function getAllMerchantProblemPaths(): { merchant: string; problem: string }[] {
  const out: { merchant: string; problem: string }[] = [];
  for (const m of MERCHANTS) {
    for (const p of m.problems) {
      out.push({ merchant: m.slug, problem: p });
    }
  }
  return out;
}

export interface GeneratedCopy {
  title: string;
  metaDescription: string;
  category: string;
  /** 2-3 paragraph intro for the article — primary SEO body copy. */
  intro: string[];
  whenApplies: string[];
  evidence: string[];
  merchantFocus: string[];
  paymentNextStep: { title: string; text: string };
  steps: string[];
  /** Deadlines & timing info, payment-method-aware. */
  deadlines: { label: string; value: string; note: string }[];
  /** Legal basis paragraphs (BGB, EU-Verordnungen) — neutral information, no advice. */
  legalBasis: { title: string; text: string }[];
  /** Concrete reason-code / dispute category for the chosen payment method. */
  disputeCategory: { method: string; code: string; explainer: string };
  mistakes: string[];
  faq: { q: string; a: string }[];
}

/**
 * Generates SEO copy for a merchant×problem combo. All content is factual,
 * non-defamatory, and links the user toward the wizard with prefilled context.
 */
export function generateMerchantProblemCopy(
  merchant: MerchantDef,
  problem: ProblemDef
): GeneratedCopy {
  const m = merchant.name;
  const phrase = problem.searchPhrase;
  const sectorWord = sectorLabel(merchant.sector);

  const title = `${m} ${problem.label} — Reklamation strukturiert vorbereiten 2026`;
  const metaDescription = `Du hast bei ${m} Probleme mit ${phrase.toLowerCase()}? Strukturierte Orientierung 2026: Belege, typische Fristenhinweise und unverbindliche Textentwürfe für Händler, Bank oder Zahlungsdienstleister.`;

  const whenApplies = applicableScenarios(merchant, problem);
  const evidence = evidenceForProblem(problem);
  const merchantFocus = merchantFocusForCombo(merchant, problem);
  const paymentNextStep = paymentNextStepForCombo(problem, merchant);
  const steps = stepsForCombo(merchant, problem);
  const mistakes = commonMistakes(problem);
  const faq = faqForCombo(merchant, problem, sectorWord);
  const intro = introParagraphs(merchant, problem, sectorWord);
  const deadlines = deadlinesForCombo(problem);
  const legalBasis = legalBasisForProblem(problem);
  const disputeCategory = disputeCategoryForCombo(problem);

  return {
    title,
    metaDescription,
    category: `${m} ${problem.label}`,
    intro,
    whenApplies,
    evidence,
    merchantFocus,
    paymentNextStep,
    steps,
    deadlines,
    legalBasis,
    disputeCategory,
    mistakes,
    faq,
  };
}

function merchantFocusForCombo(m: MerchantDef, p: ProblemDef): string[] {
  const sectorHints: Record<MerchantDef["sector"], string[]> = {
    marketplace: [
      "Prüfe, ob du direkt beim Händler oder bei einem Drittanbieter auf dem Marktplatz gekauft hast.",
      "Sichere die Verkäuferangaben, Angebotsseite und jede Nachricht im Plattform-Postfach als Screenshot.",
    ],
    fashion: [
      "Dokumentiere Paketstatus, Retourenbeleg und Artikelzustand getrennt, damit Lieferung und Rücksendung klar nachvollziehbar bleiben.",
      "Bewahre E-Mails zur Bestellung, Versandbestätigung und möglichen Retoure zusammen mit Zeitstempeln auf.",
    ],
    airline: [
      "Halte Buchungscode, Ticketnummer und offizielle Stornierungs- oder Umbuchungsnachricht getrennt bereit.",
      "Notiere, ob dir Gutschein, Umbuchung oder Erstattung angeboten wurde und ob bereits Teilbeträge geflossen sind.",
    ],
    travel: [
      "Sichere Buchungsbestätigung, Anbieterrolle und Kommunikation mit Portal und Leistungserbringer getrennt.",
      "Dokumentiere Zusatzkosten, Stornierungsbedingungen und jede Antwort auf deine Erstattungsanfrage.",
    ],
    food_delivery: [
      "Erstelle direkt nach Lieferung Fotos von Zustand, Temperaturproblem, falschen Artikeln oder fehlenden Positionen.",
      "Sichere Bestellübersicht, Support-Chat und Erstattungsentscheidung in der App, bevor der Verlauf verschwindet.",
    ],
    subscription: [
      "Lege Vertragsabschluss, Kündigung, Abbuchungsdatum und genutzte E-Mail-Adresse chronologisch nebeneinander.",
      "Prüfe, ob es sich um ein vergessenes Abo, eine Verlängerung oder eine aus deiner Sicht unautorisierte Zahlung handelt.",
    ],
    electronics: [
      "Dokumentiere Seriennummer, Fotos des Defekts und Originalbeschreibung, damit Abweichung oder Mangel erkennbar bleiben.",
      "Sichere Reparatur-, Rücksende- oder Supportnummern, falls der Händler Nachbesserung angeboten hat.",
    ],
    logistics: [
      "Unterscheide zwischen Versanddienstleister, Absender und Händler, weil dein Vertragspartner oft nicht der Paketdienst ist.",
      "Sichere Sendungsnummer, Zustellnachweis, Ablageort-Foto und jede Nachforschung zum Paketstatus.",
    ],
    app_store: [
      "Sichere Bestellnummer, App-Name, Google-/Apple-Konto und den Zeitpunkt der Abbuchung aus dem Store-Konto.",
      "Prüfe zuerst die Erstattungsfunktion im App-Store, bevor du Bank oder Zahlungsdienstleister einschaltest.",
    ],
  };

  const problemHints: Record<string, string> = {
    "ware-nicht-erhalten": `Für ${m.name} ist besonders wichtig, dass Tracking-Status, Lieferadresse und Kontaktversuche zeitlich zusammenpassen.`,
    "ware-defekt": `Bei ${m.name} sollte die Abweichung zwischen Produktbeschreibung und erhaltener Ware mit Fotos oder Screenshots belegbar sein.`,
    "flug-storniert": `Bei ${m.name} sollten Stornierungsgrund, angebotene Alternative und gewünschte Erstattung sauber getrennt werden.`,
    "hotel-anders-als-beschrieben": `Bei ${m.name} helfen Fotos direkt vor Ort und eine zeitnahe Mängelmeldung an Unterkunft oder Plattform.`,
    "abbuchung-ohne-zustimmung": `Bei ${m.name} solltest du zuerst prüfen, ob ein Konto, Abo oder Probemonat die Abbuchung ausgelöst haben kann.`,
    "lieferung-falsch": `Bei ${m.name} zählen schnelle Fotos, App-Supportverlauf und die genaue Abweichung von der Bestellung besonders stark.`,
    betrugsverdacht: `Bei ${m.name} sollten Website-Screenshots, Verkäuferdaten und Zahlungsbeleg gesichert werden, ohne unbelegte Vorwürfe zu formulieren.`,
  };

  return [...(sectorHints[m.sector] ?? []), problemHints[p.slug] ?? ""].filter(Boolean);
}

function paymentNextStepForCombo(p: ProblemDef, m: MerchantDef): { title: string; text: string } {
  if (p.paymentMethods.includes("paypal")) {
    return {
      title: "Wenn du mit PayPal gezahlt hast",
      text: `Öffne den Fall im PayPal-Konfliktcenter, lade die wichtigsten Belege hoch und eskaliere erst nach einem dokumentierten Lösungsversuch mit ${m.name}. Prüfe die aktuellen PayPal-Fristen direkt im Konto.`,
    };
  }
  if (p.paymentMethods.includes("kreditkarte")) {
    return {
      title: "Wenn du per Kreditkarte gezahlt hast",
      text: `Bitte deine kartenausgebende Bank sachlich um Prüfung einer Umsatzreklamation. Nenne Betrag, Datum, ${m.name}, den Problemtyp und verweise auf die beigefügten Belege.`,
    };
  }
  if (p.paymentMethods.includes("klarna")) {
    return {
      title: "Wenn du über Klarna gezahlt hast",
      text: `Melde das Problem zeitnah im Klarna-Konto, prüfe eine mögliche Zahlungspause und halte die Kommunikation mit ${m.name} schriftlich fest.`,
    };
  }
  if (p.paymentMethods.includes("lastschrift")) {
    return {
      title: "Wenn per Lastschrift abgebucht wurde",
      text: `Prüfe mit deiner Bank, ob eine Lastschriftrückgabe oder eine Klärung wegen nicht autorisierter Zahlung in Betracht kommt. Dokumentiere parallel die Anfrage an ${m.name}.`,
    };
  }
  return {
    title: "Nächster Zahlungsschritt",
    text: `Prüfe zuerst die Regeln deiner konkreten Zahlungsart und sichere die Kommunikation mit ${m.name}, bevor du den Fall eskalierst.`,
  };
}

// ── Long-form intro paragraphs (primary SEO body) ─────────────────
function introParagraphs(m: MerchantDef, p: ProblemDef, sector: string): string[] {
  const para1 = `Wenn du bei ${m.name} mit ${p.searchPhrase.toLowerCase()} konfrontiert bist, kommen 2026 je nach Zahlungsart und Einzelfall verschiedene Reklamationswege in Betracht. ${m.name} (${sector}, Sitz in ${m.country}) ist für deutsche Verbraucher grundsätzlich erreichbar — wichtig ist vor allem, den Sachverhalt nachvollziehbar zu dokumentieren und typische Fristen direkt beim jeweiligen Anbieter zu prüfen.`;
  const para2 = `Typische Anlaufstellen sind PayPal-Käuferschutz, Kreditkarten-Reklamation/Chargeback über die kartenausgebende Bank, SEPA-Lastschriftrückgabe oder Klarna-Käuferschutz. Welcher Weg bei dir sinnvoll ist, hängt davon ab, womit du bei ${m.name} bezahlt hast und welche Anbieterregeln gelten — die Hinweise weiter unten dienen als allgemeine Orientierung.`;
  const para3 = `Praktisch ist meist hilfreich, ${m.name} zunächst nachweisbar direkt zu kontaktieren und eine angemessene Rückmeldefrist zu setzen. ChargebackPilot unterstützt dich dabei mit unverbindlichen Textentwürfen — von der ersten Reklamation bis zu einer möglichen Nachricht an Bank oder Zahlungsdienstleister. Die KI-gestützte Strukturierung ist kostenlos; vollständige Entwürfe als PDF kosten einmalig 0,99 € Endpreis.`;
  return [para1, para2, para3];
}

// ── Deadlines / timing matrix per problem ─────────────────────────
function deadlinesForCombo(p: ProblemDef): { label: string; value: string; note: string }[] {
  const out: { label: string; value: string; note: string }[] = [
    {
      label: "PayPal Käuferschutz",
      value: "häufig 180 Tage",
      note: "ab Zahlungsdatum — bitte konkrete Frist und Eskalationsregeln direkt bei PayPal prüfen",
    },
    {
      label: "Kreditkarten-Reklamation",
      value: "oft 60–120 Tage",
      note: "Frist und Verfahren variieren je Bank und Kartennetzwerk; bitte direkt bei der kartenausgebenden Bank prüfen",
    },
    {
      label: "Klarna-Käuferschutz",
      value: "zeitnah melden",
      note: "Problem im Klarna-Konto melden und mögliche Zahlungspause nach Anbieterregeln prüfen",
    },
    {
      label: "SEPA-Lastschrift",
      value: "typisch 8 Wochen",
      note: "Rückgabemöglichkeiten hängen von Autorisierung und Einzelfall ab; bitte bei deiner Bank prüfen",
    },
  ];
  if (p.slug === "flug-storniert") {
    out.push({
      label: "EU-Fluggastrechte",
      value: "oft mehrere Jahre",
      note: "mögliche Ansprüche und Verjährung hängen vom Einzelfall ab; Belege trotzdem früh sichern",
    });
  }
  if (p.slug === "abbuchung-ohne-zustimmung") {
    out.push({
      label: "Nicht autorisierte SEPA-Lastschrift",
      value: "bis zu 13 Monate möglich",
      note: "bei fehlender Autorisierung können längere Fristen gelten; bitte direkt bei der Bank prüfen",
    });
  }
  return out;
}

// ── Legal basis (factual, no advice) ──────────────────────────────
function legalBasisForProblem(p: ProblemDef): { title: string; text: string }[] {
  const base: { title: string; text: string }[] = [
    {
      title: "Allgemeine Orientierung: Vertragsrecht und Pflichtverletzungen",
      text: "Bei Nichtlieferung oder Schlechtleistung können je nach Einzelfall vertragliche Rechte in Betracht kommen. Eine nachvollziehbare schriftliche Dokumentation hilft, den Sachverhalt gegenüber Händler oder Zahlungsdienstleister verständlich darzustellen.",
    },
    {
      title: "Allgemeine Orientierung: Kaufrechtliche Mängelrechte",
      text: "Bei mangelhafter Ware können je nach Fall Nacherfüllung, Minderung oder Rückabwicklung eine Rolle spielen. Welche Rechte konkret bestehen, hängt vom Vertrag, Zeitpunkt und den Belegen ab.",
    },
    {
      title: "Allgemeine Orientierung: nicht autorisierte Zahlungen",
      text: "Bei nicht autorisierten Zahlungen können besondere Regeln gegenüber der Bank gelten. Ob eine Zahlung autorisiert war und welche Frist gilt, sollte direkt mit der Bank geklärt werden.",
    },
  ];
  if (p.slug === "flug-storniert") {
    base.push({
      title: "Allgemeine Orientierung: EU-Fluggastrechte",
      text: "Bei Annullierung, Nichtbeförderung oder erheblicher Verspätung können je nach Strecke, Ursache und Einzelfall Erstattungs- oder Ausgleichsansprüche in Betracht kommen. Belege und Kommunikation sollten früh gesichert werden.",
    });
  }
  if (p.slug === "abbuchung-ohne-zustimmung") {
    base.push({
      title: "Fernabsatzrecht: § 312g BGB Widerrufsrecht 14 Tage",
      text: "Bei online abgeschlossenen Verbraucherverträgen kann ein Widerrufsrecht bestehen. Fristbeginn, Belehrung und Ausnahmen hängen vom konkreten Vertrag ab und sollten im Einzelfall geprüft werden.",
    });
  }
  return base;
}

// ── Dispute category (Reason-Code) per problem ────────────────────
function disputeCategoryForCombo(p: ProblemDef): {
  method: string;
  code: string;
  explainer: string;
} {
  const map: Record<string, { method: string; code: string; explainer: string }> = {
    "ware-nicht-erhalten": {
      method: "Visa / Mastercard",
      code: "13.1 Merchandise/Services Not Received",
      explainer:
        "Diese Kategorie kann in Betracht kommen, wenn bezahlte Ware oder Dienstleistungen nicht angekommen sind. Hilfreich sind Bestellbestätigung, Lieferstatus und dokumentierte Kontaktversuche.",
    },
    "ware-defekt": {
      method: "Visa / Mastercard",
      code: "13.3 Not as Described or Defective Merchandise/Services",
      explainer:
        "Greift, wenn die Ware erheblich von der Beschreibung abweicht oder defekt ankommt. Beweislage: Fotos des Mangels, Original-Produktbeschreibung als Screenshot, Schriftwechsel mit dem Händler.",
    },
    "flug-storniert": {
      method: "Visa / Mastercard",
      code: "13.1 Services Not Received (Annullierung)",
      explainer:
        "Bei gestrichenen Flügen kann je nach Zahlungsart eine Reklamation beim Zahlungsdienstleister zusätzlich zur direkten Erstattungsklärung geprüft werden. Bereits erhaltene Zahlungen sollten transparent angegeben werden.",
    },
    "hotel-anders-als-beschrieben": {
      method: "Visa / Mastercard",
      code: "13.3 Not as Described",
      explainer:
        "Wenn eine Unterkunft erheblich von der Beschreibung abweicht, kann eine Reklamation beim Anbieter oder Zahlungsdienstleister in Betracht kommen. Fotos und eine zeitnahe Meldung vor Ort sind praktisch hilfreich.",
    },
    "abbuchung-ohne-zustimmung": {
      method: "SEPA / Visa",
      code: "10.4 Other Fraud — Card Absent Environment",
      explainer:
        "Bei möglicherweise unautorisierten Abbuchungen sollte zuerst geprüft werden, ob eine Autorisierung, ein vergessenes Abo oder ein Missbrauchsfall vorliegt. Die passende Kategorie hängt vom Ergebnis dieser Prüfung ab.",
    },
    "lieferung-falsch": {
      method: "PayPal / Visa",
      code: "13.3 Not as Described — Falsche Lieferung",
      explainer:
        "Lieferung kam komplett falsch oder unbrauchbar an. Bei PayPal eröffnest du den Käuferschutzfall mit Foto der erhaltenen Ware vs. bestellter Ware.",
    },
    betrugsverdacht: {
      method: "Visa / Mastercard / Amex",
      code: "10.4 Fraud — Card Absent",
      explainer:
        "Bei Verdacht auf Fake-Shop sind Screenshots, Zahlungsnachweis, Kontaktversuche und ggf. eine Anzeige wichtige Dokumente. Ob eine Rückbuchung gelingt, entscheidet der Zahlungsdienstleister im Einzelfall.",
    },
  };
  return (
    map[p.slug] ?? {
      method: "Visa / Mastercard",
      code: "13.1 Services Not Received",
      explainer:
        "Mögliche Kategorie für nicht erbrachte Leistungen. ChargebackPilot gibt hierzu nur eine unverbindliche Orientierung auf Basis deiner Angaben.",
    }
  );
}

function sectorLabel(s: MerchantDef["sector"]): string {
  switch (s) {
    case "marketplace":
      return "Marktplatz";
    case "airline":
      return "Airline";
    case "travel":
      return "Reiseplattform";
    case "food_delivery":
      return "Lieferdienst";
    case "subscription":
      return "Abo-Anbieter";
    case "fashion":
      return "Modeshop";
    case "electronics":
      return "Elektronikhändler";
    case "logistics":
      return "Paketdienstleister";
    case "app_store":
      return "App-Store";
  }
}

function applicableScenarios(m: MerchantDef, p: ProblemDef): string[] {
  const base: Record<string, string[]> = {
    "ware-nicht-erhalten": [
      `Deine Bestellung bei ${m.name} ist nicht angekommen, obwohl der Liefertermin überschritten ist.`,
      "Die Sendungsverfolgung steht seit Tagen still oder zeigt einen unklaren Status.",
      `${m.name} oder der Versanddienstleister reagiert nicht innerhalb angemessener Frist.`,
    ],
    "ware-defekt": [
      `Die Lieferung von ${m.name} weicht erheblich von der Beschreibung ab oder ist defekt.`,
      "Die Ware wurde unvollständig oder beschädigt geliefert.",
      `${m.name} verweigert nach Reklamation die Erstattung oder Nachlieferung.`,
    ],
    "flug-storniert": [
      `${m.name} hat deinen Flug gestrichen oder erheblich verschoben.`,
      "Es liegt eine Verspätung von mehr als 3 Stunden bei Ankunft am Zielort vor.",
      `${m.name} bietet nur einen Gutschein an, obwohl je nach Fall eine Auszahlung geprüft werden kann.`,
    ],
    "hotel-anders-als-beschrieben": [
      `Die über ${m.name} gebuchte Unterkunft entspricht nicht der Beschreibung (Lage, Sauberkeit, Ausstattung).`,
      "Ein erheblicher Mangel wurde dokumentiert und vor Ort gerügt.",
      `${m.name} oder der Anbieter verweigert eine angemessene Minderung oder Stornierung.`,
    ],
    "abbuchung-ohne-zustimmung": [
      `${m.name} hat eine Zahlung abgebucht, der du nicht zugestimmt hast (z. B. nach Probemonat).`,
      "Eine Kündigung wurde nicht beachtet oder ein Vertrag heimlich verlängert.",
      "Du erkennst die Abbuchung auf deinem Konto/Karte nicht wieder.",
    ],
    "lieferung-falsch": [
      `${m.name} hat die Bestellung falsch, unvollständig oder unbrauchbar geliefert.`,
      "Das Essen kam kalt, verschüttet oder mit den falschen Komponenten an.",
      `${m.name} verweigert über die App eine vollständige Erstattung.`,
    ],
    betrugsverdacht: [
      `Du hast den begründeten Verdacht, dass es sich bei ${m.name} oder einem Drittanbieter um einen Fake-Shop handelt.`,
      "Die Website ist plötzlich offline oder du erhältst keine Antwort mehr.",
      "Du hast eine Anzeige bei der Polizei erstattet (empfohlen).",
    ],
  };
  return base[p.slug] ?? [];
}

function evidenceForProblem(p: ProblemDef): string[] {
  const generic = [
    "Bestellbestätigung / Buchungsnummer",
    "Zahlungsnachweis (Kontoauszug, PayPal-Transaktion)",
  ];
  const specific: Record<string, string[]> = {
    "ware-nicht-erhalten": ["Tracking-Screenshot", "E-Mails an Händler", "Lieferadresse / -datum"],
    "ware-defekt": [
      "Fotos des Mangels",
      "Produktbeschreibung als Screenshot",
      "Schriftwechsel mit Händler",
    ],
    "flug-storniert": [
      "Buchungscode / e-Ticket",
      "Stornierungsmail der Airline",
      "Boarding-Pass falls vorhanden",
      "Belege für entstandene Mehrkosten",
    ],
    "hotel-anders-als-beschrieben": [
      "Fotos vom Mangel",
      "Buchungsdetails / inseriertes Angebot",
      "Schriftliche Mängelrüge an der Rezeption",
    ],
    "abbuchung-ohne-zustimmung": [
      "Kontoauszug",
      "Kündigungsmail mit Datum",
      "AGB / Vertragsabschluss-Bestätigung",
    ],
    "lieferung-falsch": [
      "Foto der Lieferung",
      "Bestellbestätigung in der App",
      "Screenshot des Support-Chats",
    ],
    betrugsverdacht: [
      "Screenshots der Website",
      "WHOIS-Auskunft (falls verfügbar)",
      "Polizei-Anzeigenbestätigung",
      "E-Mail-Verlauf",
    ],
  };
  return [...generic, ...(specific[p.slug] ?? [])];
}

function stepsForCombo(m: MerchantDef, p: ProblemDef): string[] {
  const direct = `Kontaktiere ${m.name} zuerst über den offiziellen Support-Kanal (App, E-Mail, Hilfecenter) und setze eine schriftliche Frist von 14 Tagen.`;
  const document =
    "Dokumentiere lückenlos: Datum, Uhrzeit, Gesprächspartner, Inhalt — am besten per E-Mail, weil schriftlich beweisbar.";
  const pay = paymentSpecificStep(p, m);
  const escalate = `Bei ausbleibender Reaktion: sende eine sachliche Erinnerung an ${m.name} und prüfe parallel die Reklamationswege deines Zahlungsdienstleisters.`;
  const final =
    "Prüfe, ob ein Käuferschutz- oder Chargeback-Verfahren in Betracht kommt — ChargebackPilot erstellt dafür unverbindliche Formulierungsvorschläge.";
  return [direct, document, pay, escalate, final];
}

function paymentSpecificStep(p: ProblemDef, m: MerchantDef): string {
  if (p.paymentMethods.includes("paypal")) {
    return `Wenn du mit PayPal gezahlt hast, öffne innerhalb von 180 Tagen einen Fall im PayPal-Konfliktcenter (Käuferschutz) — wichtig: vom Konflikt zum Antrag eskalieren innerhalb von 20 Tagen.`;
  }
  if (p.paymentMethods.includes("kreditkarte")) {
    return `Wenn du per Kreditkarte gezahlt hast, fordere bei deiner Bank den Chargeback mit Reason-Code "Goods/Services not received" bzw. "Not as described" an — meist innerhalb von 60–120 Tagen ab Kontoauszug.`;
  }
  if (p.paymentMethods.includes("klarna")) {
    return `Bei Klarna-Zahlung melde das Problem zeitnah im Klarna-Konto und prüfe, ob eine Zahlungspause nach den Klarna-Regeln möglich ist.`;
  }
  return `Prüfe je nach Zahlungsart (${p.paymentMethods.join(", ")}), welche Rückforderungsoption die kürzeste Frist hat.`;
}

function commonMistakes(p: ProblemDef): string[] {
  const generic = [
    "Typische Fristen zu spät geprüft — bei PayPal, Bank oder Kartenausgeber gelten unterschiedliche Regeln.",
    "Keine schriftliche Dokumentation — nur telefonische Beschwerden sind im Streitfall praktisch wertlos.",
    "Gutschein oder Teilangebot ungeprüft akzeptiert — dadurch kann die spätere Durchsetzung schwieriger werden.",
  ];
  const specific: Record<string, string[]> = {
    "ware-nicht-erhalten": [
      "Nur den Versanddienstleister kontaktieren — häufig ist zusätzlich der Händler als Vertragspartner einzubeziehen.",
    ],
    "ware-defekt": [
      "Die Ware ohne Rücksprache zurücksenden — ohne RMA-Nummer geht die Rückerstattung oft verloren.",
    ],
    "flug-storniert": [
      "Eine Umbuchung akzeptieren und damit auf die Geldrückerstattung verzichten.",
    ],
    "abbuchung-ohne-zustimmung": [
      "Mit der Klärung bis zur nächsten Abbuchung warten — Bank und Anbieter sollten zeitnah kontaktiert werden.",
    ],
  };
  return [...generic, ...(specific[p.slug] ?? [])];
}

function faqForCombo(m: MerchantDef, p: ProblemDef, sector: string): { q: string; a: string }[] {
  return [
    {
      q: `Wie schnell sollte ich bei ${m.name} reklamieren?`,
      a: `Möglichst zeitnah. Setze ${m.name} eine angemessene schriftliche Rückmeldefrist und prüfe parallel die konkreten Fristen bei PayPal, Bank, Klarna oder Kartenausgeber. Anbieterregeln können je nach Fall abweichen.`,
    },
    {
      q: `Welche Faktoren verbessern die Nachvollziehbarkeit meines Falls bei ${m.name}?`,
      a: `Wichtig sind vor allem klare Belege, eine verständliche Chronologie, Zahlungsnachweise und ein dokumentierter Kontaktversuch. Ob ein Zahlungsdienstleister ein Verfahren annimmt oder entscheidet, hängt vom Einzelfall und den jeweiligen Regeln ab.`,
    },
    {
      q: `Was passiert, wenn ${m.name} den Chargeback bestreitet?`,
      a: `Dann kann deine Bank oder dein Zahlungsdienstleister weitere Belege anfordern. Eine klare, sachliche Dokumentation hilft, Rückfragen nachvollziehbar zu beantworten. ChargebackPilot unterstützt dich mit Formulierungsvorschlägen für typische Einwände.`,
    },
    {
      q: `Sollte ich ${m.name} vorher kontaktieren, bevor ich Zahlungsdienstleister einschalte?`,
      a: `In vielen Verfahren ist ein dokumentierter Lösungsversuch praktisch hilfreich oder wird vom Anbieter erwartet. Eine sachliche E-Mail mit angemessener Rückmeldefrist ist deshalb meist sinnvoll. ChargebackPilot liefert dafür unverbindliche Textentwürfe.`,
    },
    {
      q: `Welche Beweise sind im Chargeback-Verfahren am wichtigsten?`,
      a: `Schriftliches schlägt mündliches. Die wertvollsten Beweise: Bestellbestätigung mit Datum, Kontoauszug/PayPal-Transaktion, E-Mail-Verlauf mit ${m.name} (besonders deren ablehnende Antwort oder Schweigen), Tracking-Screenshots und Fotos. Telefonate ohne schriftliche Bestätigung zählen im Zweifel nicht.`,
    },
    {
      q: `Was kostet die Hilfe von ChargebackPilot?`,
      a: `Die KI-Ersteinschätzung deines Falls ist komplett kostenlos. Wenn du die fertigen Textvorlagen (Händler-Anschreiben, Bank-Chargeback-Antrag, Eskalationsschreiben) freischalten willst, zahlst du einmalig 0,99 € Endpreis pro Fall. Eine Flatrate für unbegrenzte Fälle gibt es für 9,99 € Endpreis (12 Monate).`,
    },
    {
      q: `Kann ich gegen ${m.name} auch klagen, wenn der Chargeback scheitert?`,
      a: `Weitere Schritte außerhalb des Zahlungsdienstleisters können je nach Streitwert und Sachverhalt möglich sein, etwa Verbraucherzentrale, Schlichtung oder anwaltliche Prüfung. ChargebackPilot bietet hierfür keine Vertretung und keine Rechtsberatung, kann aber bei der strukturierten Belegaufbereitung helfen.`,
    },
    {
      q: `Ist ChargebackPilot eine Rechtsberatung?`,
      a: `Nein. ChargebackPilot stellt keine Rechtsberatung und keine Rechtsdienstleistung im Sinne des RDG dar. Wir liefern KI-gestützte Formulierungshilfe und strukturierte Vorlagen für deinen Käuferschutz-Antrag. Bei komplexen Streitwerten empfehlen wir die Verbraucherzentrale oder einen Fachanwalt für Verbraucherrecht.`,
    },
  ];
}
