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
  sector: "marketplace" | "airline" | "travel" | "food_delivery" | "subscription" | "fashion" | "electronics";
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
    description: "Chinesischer Online-Marktplatz mit besonders niedrigen Preisen. Häufige Beschwerden betreffen Lieferzeiten, Produktqualität und Rückerstattungen.",
    problems: ["ware-nicht-erhalten", "ware-defekt", "betrugsverdacht"],
  },
  {
    slug: "shein",
    name: "Shein",
    sector: "fashion",
    country: "Singapur / China",
    trustLevel: "mixed",
    description: "Fast-Fashion-Plattform mit Sitz in Singapur. Häufige Beschwerden zu Größen, Materialqualität und verspäteten Lieferungen.",
    problems: ["ware-nicht-erhalten", "ware-defekt"],
  },
  {
    slug: "wish",
    name: "Wish",
    sector: "marketplace",
    country: "USA",
    trustLevel: "risky",
    description: "US-Marktplatz mit Schwerpunkt auf chinesische Drittanbieter. Verbraucherzentralen warnen regelmäßig vor Produkt- und Lieferproblemen.",
    problems: ["ware-nicht-erhalten", "ware-defekt", "betrugsverdacht"],
  },
  {
    slug: "aliexpress",
    name: "AliExpress",
    sector: "marketplace",
    country: "China",
    trustLevel: "mixed",
    description: "Chinesischer Marktplatz (Alibaba-Gruppe). Käuferschutz vorhanden, Bearbeitungszeit oft mehrere Wochen.",
    problems: ["ware-nicht-erhalten", "ware-defekt"],
  },
  {
    slug: "amazon",
    name: "Amazon",
    sector: "marketplace",
    country: "USA / Deutschland",
    trustLevel: "trusted",
    description: "Größter Online-Händler in Deutschland. Eigener A-bis-Z--Schutz; bei Drittanbietern oft zusätzlicher Chargeback nötig.",
    problems: ["ware-nicht-erhalten", "ware-defekt", "abbuchung-ohne-zustimmung"],
  },

  // ── Airlines ───────────────────────────────────────────────────
  {
    slug: "ryanair",
    name: "Ryanair",
    sector: "airline",
    country: "Irland",
    trustLevel: "mixed",
    description: "Irischer Billigflieger. EU-Fluggastrechte (VO 261/2004) gelten; Erstattungen oft erst nach Mahnung oder Chargeback.",
    problems: ["flug-storniert"],
  },
  {
    slug: "lufthansa",
    name: "Lufthansa",
    sector: "airline",
    country: "Deutschland",
    trustLevel: "trusted",
    description: "Deutsche Premium-Airline. Erstattungsprozess seit 2020 deutlich verbessert, aber bei Stornierungen ist ein Chargeback weiterhin sinnvoll als Druckmittel.",
    problems: ["flug-storniert"],
  },
  {
    slug: "eurowings",
    name: "Eurowings",
    sector: "airline",
    country: "Deutschland",
    trustLevel: "trusted",
    description: "Lufthansa-Tochter mit Fokus auf europäische Strecken. EU-Fluggastrechte gelten in vollem Umfang.",
    problems: ["flug-storniert"],
  },

  // ── Travel / Hotels ────────────────────────────────────────────
  {
    slug: "booking",
    name: "Booking.com",
    sector: "travel",
    country: "Niederlande",
    trustLevel: "trusted",
    description: "Weltweit größte Hotelbuchungsplattform. Vermittler-Rolle — bei Problemen vor Ort ist Eskalation an Booking + ggf. Chargeback der schnellste Weg.",
    problems: ["hotel-anders-als-beschrieben", "flug-storniert"],
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    sector: "travel",
    country: "USA / Irland",
    trustLevel: "trusted",
    description: "Privatunterkunfts-Plattform mit eigenem AirCover-Schutz. Bei abgelehnten Beschwerden ist Chargeback über die Kreditkarte möglich.",
    problems: ["hotel-anders-als-beschrieben"],
  },

  // ── Food delivery ──────────────────────────────────────────────
  {
    slug: "lieferando",
    name: "Lieferando",
    sector: "food_delivery",
    country: "Niederlande / Deutschland",
    trustLevel: "trusted",
    description: "Größter Lieferdienst in Deutschland. Häufige Gründe für Chargebacks sind unvollständige, kalte oder gar nicht gelieferte Bestellungen.",
    problems: ["lieferung-falsch", "ware-nicht-erhalten", "abbuchung-ohne-zustimmung"],
  },
  {
    slug: "wolt",
    name: "Wolt",
    sector: "food_delivery",
    country: "Finnland",
    trustLevel: "trusted",
    description: "Lebensmittel- und Essenslieferant. Erstattungen werden oft beim Support angefragt, wenn das Essen kalt ankommt oder fehlt.",
    problems: ["lieferung-falsch", "ware-nicht-erhalten"],
  },
  {
    slug: "ubereats",
    name: "Uber Eats",
    sector: "food_delivery",
    country: "USA / Niederlande",
    trustLevel: "trusted",
    description: "Internationaler Essenslieferdienst. Wenn Bestellungen storniert werden oder Fahrer den Umweg nehmen, kommt das Essen oft kalt an.",
    problems: ["lieferung-falsch", "ware-nicht-erhalten"],
  },
  {
    slug: "kiwicom",
    name: "Kiwi.com",
    sector: "travel",
    country: "Tschechien",
    trustLevel: "mixed",
    description: "Flugsuchmaschine und Buchungsportal. Verlangt oft hohe eigene Gebühren für die Erstattung von Steuern und Flughafengebühren.",
    problems: ["flug-storniert", "abbuchung-ohne-zustimmung"],
  },

  // ── Subscription services ──────────────────────────────────────
  {
    slug: "spotify",
    name: "Spotify",
    sector: "subscription",
    country: "Schweden",
    trustLevel: "trusted",
    description: "Music-Streaming-Marktführer. Bei nicht erkannten Abbuchungen ist die SEPA-Lastschriftrückgabe der schnellste Weg.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
  {
    slug: "netflix",
    name: "Netflix",
    sector: "subscription",
    country: "USA",
    trustLevel: "trusted",
    description: "Streaming-Anbieter. Bei doppelten oder unautorisierten Abbuchungen kontaktiert man zuerst Netflix-Support; Chargeback als Notfallhebel.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
  {
    slug: "dazn",
    name: "DAZN",
    sector: "subscription",
    country: "Großbritannien",
    trustLevel: "mixed",
    description: "Sport-Streaming-Dienst. Häufige Verbraucherbeschwerden zu Preisanpassungen und Kündigungsmöglichkeiten.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
  {
    slug: "sky",
    name: "Sky Deutschland",
    sector: "subscription",
    country: "Deutschland",
    trustLevel: "mixed",
    description: "Pay-TV- und Streaming-Anbieter. Häufige Themen sind nicht akzeptierte Kündigungen und automatische Vertragsverlängerungen.",
    problems: ["abbuchung-ohne-zustimmung"],
  },
  {
    slug: "apple",
    name: "Apple / iTunes",
    sector: "subscription",
    country: "USA",
    trustLevel: "trusted",
    description: "App-Store und Abo-Plattform. Für In-App-Käufe oder Abo-Abbuchungen ist Apples eigene Erstattung der erste Weg.",
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
  problem: ProblemDef,
): GeneratedCopy {
  const m = merchant.name;
  const phrase = problem.searchPhrase;
  const sectorWord = sectorLabel(merchant.sector);

  const title = `${m} ${problem.label} — Geld zurück 2026`;
  const metaDescription = `Du hast bei ${m} Probleme mit ${phrase.toLowerCase()}? Schritt-für-Schritt-Anleitung 2026: Beweise, Fristen, fertige Textvorlagen für PayPal, Kreditkarten-Chargeback und Verbraucherbrief.`;

  const whenApplies = applicableScenarios(merchant, problem);
  const evidence = evidenceForProblem(problem);
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
    steps,
    deadlines,
    legalBasis,
    disputeCategory,
    mistakes,
    faq,
  };
}

// ── Long-form intro paragraphs (primary SEO body) ─────────────────
function introParagraphs(m: MerchantDef, p: ProblemDef, sector: string): string[] {
  const para1 =
    `Wenn du bei ${m.name} mit ${p.searchPhrase.toLowerCase()} konfrontiert bist, gibt es 2026 mehrere konkrete Wege, dein Geld zurückzuholen. ${m.name} (${sector}, Sitz in ${m.country}) ist für deutsche Verbraucher grundsätzlich erreichbar — entscheidend ist, dass du den richtigen Reklamationsweg wählst und die Fristen einhältst, die je nach Zahlungsart unterschiedlich sind. Wer wahllos Mails schreibt, verliert oft wertvolle Zeit; wer strukturiert vorgeht, hat deutlich höhere Chancen auf eine Erstattung.`;
  const para2 =
    `Die größten Hebel sind 2026: der Käuferschutz bei PayPal (bis 180 Tage), das Chargeback-Verfahren der Banken bei Kreditkartenzahlung (60–120 Tage Frist je Bank), die SEPA-Lastschriftrückgabe (8 Wochen ohne Begründung) sowie der Klarna-Käuferschutz. Welcher Hebel bei dir greift, hängt davon ab, womit du bei ${m.name} bezahlt hast — die Anleitung weiter unten zeigt für jede Zahlungsart den exakten Klick-Pfad und die richtige Reason-Code-Begründung.`;
  const para3 =
    `Wichtig: Vor jedem Chargeback oder Käuferschutz-Antrag musst du nachweisbar versucht haben, ${m.name} direkt zu erreichen. Eine schriftliche Frist von 14 Tagen reicht in der Regel aus und ist juristisch sauber. ChargebackPilot übernimmt dabei die Formulierung — von der ersten Reklamation bis zum Eskalations-Anschreiben an deine Bank. Die KI-gestützte Strukturierung ist kostenlos; nur die fertigen Vorlagen als PDF kosten einmalig 0,99 € (inkl. MwSt.).`;
  return [para1, para2, para3];
}

// ── Deadlines / timing matrix per problem ─────────────────────────
function deadlinesForCombo(p: ProblemDef): { label: string; value: string; note: string }[] {
  const out: { label: string; value: string; note: string }[] = [
    { label: "PayPal Käuferschutz", value: "180 Tage", note: "ab Zahlungsdatum — Fall im Konfliktcenter eröffnen, innerhalb 20 Tagen zum Antrag eskalieren" },
    { label: "Kreditkarten-Chargeback", value: "60–120 Tage", note: "ab Datum des Kontoauszugs — Frist variiert je Bank (oft 60 Tage Visa/Mastercard, bis 120 Tage Amex)" },
    { label: "Klarna-Käuferschutz", value: "Sofort melden", note: "offene Rechnung im Klarna-Konto pausieren, um Mahnkosten zu vermeiden" },
    { label: "SEPA-Lastschrift zurückgeben", value: "8 Wochen", note: "ab Belastung — formlos bei deiner Bank ohne Begründung möglich" },
  ];
  if (p.slug === "flug-storniert") {
    out.push({ label: "EU-Fluggastrechte (VO 261/2004)", value: "3 Jahre", note: "Ausgleichszahlungen verjähren erst nach 3 Jahren — also nicht in Panik" });
  }
  if (p.slug === "abbuchung-ohne-zustimmung") {
    out.push({ label: "Nicht autorisierte SEPA-Lastschrift", value: "13 Monate", note: "wenn du der Abbuchung nie zugestimmt hast, kannst du sie 13 Monate lang zurückgeben (§ 675x BGB)" });
  }
  return out;
}

// ── Legal basis (factual, no advice) ──────────────────────────────
function legalBasisForProblem(p: ProblemDef): { title: string; text: string }[] {
  const base: { title: string; text: string }[] = [
    {
      title: "Vertragsrecht: § 280 BGB Schadensersatz wegen Pflichtverletzung",
      text: "Wenn ein Händler seine vertraglichen Pflichten verletzt (Nichtlieferung, Schlechtleistung), hast du nach § 280 BGB grundsätzlich Anspruch auf Schadensersatz. Vorausgesetzt ist eine schriftliche Fristsetzung — daher dokumentiert ChargebackPilot jeden Reklamationsschritt mit Datum.",
    },
    {
      title: "Kaufrecht: §§ 437 ff. BGB Mängelrechte",
      text: "Bei Sachmängeln hast du als Verbraucher zunächst Anspruch auf Nacherfüllung (Reparatur oder Ersatzlieferung), danach auf Rücktritt oder Minderung. Wichtig: Die Beweislast liegt in den ersten 12 Monaten beim Händler (§ 477 BGB), das spielt dem Verbraucher in die Karten.",
    },
    {
      title: "Zahlungsdiensterecht: § 675x BGB nicht autorisierte Zahlungen",
      text: "Wurde eine Lastschrift ohne dein Einverständnis ausgeführt, hast du gegenüber deiner Bank einen Erstattungsanspruch — auch noch nach 8 Wochen, wenn der Vorgang gar nicht autorisiert war. Im Streit gilt: die Bank trägt die Beweislast für die Autorisierung (§ 675w BGB).",
    },
  ];
  if (p.slug === "flug-storniert") {
    base.push({
      title: "EU-Fluggastrechte (VO (EG) Nr. 261/2004)",
      text: "Bei Annullierung, Nichtbeförderung oder erheblicher Verspätung (> 3 Stunden) stehen dir je nach Distanz pauschal 250 €, 400 € oder 600 € zu — zusätzlich zur Rückerstattung des Ticketpreises. Anspruch besteht in 6 Jahren (BGH-Rechtsprechung), praktisch laufen aber Belege schneller weg.",
    });
  }
  if (p.slug === "abbuchung-ohne-zustimmung") {
    base.push({
      title: "Fernabsatzrecht: § 312g BGB Widerrufsrecht 14 Tage",
      text: "Bei online abgeschlossenen Verbraucherverträgen hast du 14 Tage Widerrufsrecht. Wurde die Belehrung fehlerhaft erteilt, verlängert sich diese Frist auf bis zu 12 Monate plus 14 Tage. Sehr häufig bei Abo-Fallen anwendbar.",
    });
  }
  return base;
}

// ── Dispute category (Reason-Code) per problem ────────────────────
function disputeCategoryForCombo(p: ProblemDef): { method: string; code: string; explainer: string } {
  const map: Record<string, { method: string; code: string; explainer: string }> = {
    "ware-nicht-erhalten": {
      method: "Visa / Mastercard",
      code: "13.1 Merchandise/Services Not Received",
      explainer: "Diese Reason-Code wird verwendet, wenn die bezahlte Ware oder Dienstleistung den Käufer nie erreicht hat. Erforderlich: Bestellbestätigung, fehlender Liefernachweis, dokumentierter Kontaktversuch beim Händler.",
    },
    "ware-defekt": {
      method: "Visa / Mastercard",
      code: "13.3 Not as Described or Defective Merchandise/Services",
      explainer: "Greift, wenn die Ware erheblich von der Beschreibung abweicht oder defekt ankommt. Beweislage: Fotos des Mangels, Original-Produktbeschreibung als Screenshot, Schriftwechsel mit dem Händler.",
    },
    "flug-storniert": {
      method: "Visa / Mastercard",
      code: "13.1 Services Not Received (Annullierung)",
      explainer: "Bei gestrichenen Flügen reichst du den Chargeback parallel zum EU-261-Antrag ein. Wichtig: gleicher Sachverhalt darf nicht doppelt erstattet werden — daher ehrlich angeben, was bereits gezahlt wurde.",
    },
    "hotel-anders-als-beschrieben": {
      method: "Visa / Mastercard",
      code: "13.3 Not as Described",
      explainer: "Wenn das Hotelzimmer erheblich abweicht, kannst du anteilig per Chargeback zurückbuchen lassen. Mängel müssen am Anreisetag dokumentiert und der Rezeption gemeldet sein.",
    },
    "abbuchung-ohne-zustimmung": {
      method: "SEPA / Visa",
      code: "10.4 Other Fraud — Card Absent Environment",
      explainer: "Bei klar unautorisierten Abbuchungen ist der Fraud-Reason-Code der stärkste Hebel. Vorher prüfen, ob es sich nicht doch um ein vergessenes Abo handelt (das wäre kein Fraud, sondern eine zivilrechtliche Streitigkeit).",
    },
    "lieferung-falsch": {
      method: "PayPal / Visa",
      code: "13.3 Not as Described — Falsche Lieferung",
      explainer: "Lieferung kam komplett falsch oder unbrauchbar an. Bei PayPal eröffnest du den Käuferschutzfall mit Foto der erhaltenen Ware vs. bestellter Ware.",
    },
    "betrugsverdacht": {
      method: "Visa / Mastercard / Amex",
      code: "10.4 Fraud — Card Absent",
      explainer: "Klassischer Fake-Shop-Fall: keine Lieferung, kein Support, oft Shop bereits offline. Polizei-Anzeige als Beweis hinzufügen erhöht Chargeback-Quote auf bis zu 90 %.",
    },
  };
  return map[p.slug] ?? {
    method: "Visa / Mastercard",
    code: "13.1 Services Not Received",
    explainer: "Standard-Reason-Code für nicht erbrachte Leistungen. ChargebackPilot wählt den exakt passenden Code basierend auf deinen Antworten.",
  };
}

function sectorLabel(s: MerchantDef["sector"]): string {
  switch (s) {
    case "marketplace": return "Marktplatz";
    case "airline": return "Airline";
    case "travel": return "Reiseplattform";
    case "food_delivery": return "Lieferdienst";
    case "subscription": return "Abo-Anbieter";
    case "fashion": return "Modeshop";
    case "electronics": return "Elektronikhändler";
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
      `${m.name} bietet nur einen Gutschein an, obwohl gesetzlich Geldrückerstattung verlangt werden kann.`,
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
    "betrugsverdacht": [
      `Du hast den begründeten Verdacht, dass es sich bei ${m.name} oder einem Drittanbieter um einen Fake-Shop handelt.`,
      "Die Website ist plötzlich offline oder du erhältst keine Antwort mehr.",
      "Du hast eine Anzeige bei der Polizei erstattet (empfohlen).",
    ],
  };
  return base[p.slug] ?? [];
}

function evidenceForProblem(p: ProblemDef): string[] {
  const generic = ["Bestellbestätigung / Buchungsnummer", "Zahlungsnachweis (Kontoauszug, PayPal-Transaktion)"];
  const specific: Record<string, string[]> = {
    "ware-nicht-erhalten": ["Tracking-Screenshot", "E-Mails an Händler", "Lieferadresse / -datum"],
    "ware-defekt": ["Fotos des Mangels", "Produktbeschreibung als Screenshot", "Schriftwechsel mit Händler"],
    "flug-storniert": ["Buchungscode / e-Ticket", "Stornierungsmail der Airline", "Boarding-Pass falls vorhanden", "Belege für entstandene Mehrkosten"],
    "hotel-anders-als-beschrieben": ["Fotos vom Mangel", "Buchungsdetails / inseriertes Angebot", "Schriftliche Mängelrüge an der Rezeption"],
    "abbuchung-ohne-zustimmung": ["Kontoauszug", "Kündigungsmail mit Datum", "AGB / Vertragsabschluss-Bestätigung"],
    "lieferung-falsch": ["Foto der Lieferung", "Bestellbestätigung in der App", "Screenshot des Support-Chats"],
    "betrugsverdacht": ["Screenshots der Website", "WHOIS-Auskunft (falls verfügbar)", "Polizei-Anzeigenbestätigung", "E-Mail-Verlauf"],
  };
  return [...generic, ...(specific[p.slug] ?? [])];
}

function stepsForCombo(m: MerchantDef, p: ProblemDef): string[] {
  const direct = `Kontaktiere ${m.name} zuerst über den offiziellen Support-Kanal (App, E-Mail, Hilfecenter) und setze eine schriftliche Frist von 14 Tagen.`;
  const document = "Dokumentiere lückenlos: Datum, Uhrzeit, Gesprächspartner, Inhalt — am besten per E-Mail, weil schriftlich beweisbar.";
  const pay = paymentSpecificStep(p, m);
  const escalate = `Bei ausbleibender Reaktion: eskaliere mit unserer KI-generierten Mahnung an ${m.name} und kündige Chargeback / Käuferschutz konkret an.`;
  const final = "Beantragen den Chargeback / Käuferschutz mit der passenden Begründung — ChargebackPilot erstellt dir den exakten Wortlaut samt Reason-Code.";
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
    return `Bei Klarna-Zahlung nutze den Käuferschutz im Klarna-Konto und stoppe die offene Rechnung sofort, um Mahnkosten zu vermeiden.`;
  }
  return `Prüfe je nach Zahlungsart (${p.paymentMethods.join(", ")}), welche Rückforderungsoption die kürzeste Frist hat.`;
}

function commonMistakes(p: ProblemDef): string[] {
  const generic = [
    "Frist verpasst — bei PayPal sind es 180 Tage, bei Kreditkarte oft nur 60–120 Tage ab Kontoauszug.",
    "Keine schriftliche Dokumentation — nur telefonische Beschwerden sind im Streitfall praktisch wertlos.",
    "Gutschein statt Geld akzeptiert — damit verfallen viele gesetzliche Rückforderungsrechte.",
  ];
  const specific: Record<string, string[]> = {
    "ware-nicht-erhalten": ["Den Versanddienstleister verklagen statt den Verkäufer — falsch: Vertragspartner ist der Händler."],
    "ware-defekt": ["Die Ware ohne Rücksprache zurücksenden — ohne RMA-Nummer geht die Rückerstattung oft verloren."],
    "flug-storniert": ["Eine Umbuchung akzeptieren und damit auf die Geldrückerstattung verzichten."],
    "abbuchung-ohne-zustimmung": ["Mit Kündigung warten bis nach der nächsten Abbuchung — pauschal jede SEPA-Lastschrift kann 8 Wochen lang ohne Begründung zurückgegeben werden."],
  };
  return [...generic, ...(specific[p.slug] ?? [])];
}

function faqForCombo(m: MerchantDef, p: ProblemDef, sector: string): { q: string; a: string }[] {
  return [
    {
      q: `Wie schnell muss ich bei ${m.name} reklamieren?`,
      a: `So früh wie möglich. Setze ${m.name} eine schriftliche Frist von 14 Tagen. Die externen Fristen (PayPal 180 Tage, Kreditkarte 60–120 Tage, SEPA-Lastschrift 8 Wochen) laufen unabhängig davon weiter — handle nicht erst kurz vor Ablauf, sonst bist du auf den guten Willen deiner Bank angewiesen.`,
    },
    {
      q: `Wie hoch sind meine Erfolgschancen mit einem Chargeback gegen ${m.name}?`,
      a: `${m.name} ist als ${sector} grundsätzlich erreichbar für Chargebacks. Entscheidend sind drei Faktoren: (1) die Qualität deiner Beweise, (2) der richtige Reason-Code und (3) ein dokumentierter vorheriger Kontaktversuch. Erfahrungsgemäß sind sauber begründete Chargebacks bei Visa/Mastercard zu 60–80 % erfolgreich — bei dokumentierten Fake-Shop-Fällen sogar deutlich höher.`,
    },
    {
      q: `Was passiert, wenn ${m.name} den Chargeback bestreitet?`,
      a: `Dann startet die sogenannte Pre-Arbitration-Phase: deine Bank fordert weitere Beweise an, ${m.name} darf widersprechen. Wer die besseren strukturierten Belege liefert, gewinnt. ChargebackPilot bereitet dich von Anfang an auf typische Händler-Gegenargumente vor, sodass deine Position bereits in Runde 1 stark formuliert ist.`,
    },
    {
      q: `Muss ich ${m.name} vorher kontaktieren, bevor ich einen Chargeback einreiche?`,
      a: `Ja, das ist juristisch und praktisch fast immer Voraussetzung. PayPal verlangt eine vorherige Konfliktphase, Banken erwarten eine dokumentierte Reklamation beim Händler. Eine einfache E-Mail mit 14-Tage-Frist reicht — den exakten Wortlaut liefert dir ChargebackPilot.`,
    },
    {
      q: `Welche Beweise sind im Chargeback-Verfahren am wichtigsten?`,
      a: `Schriftliches schlägt mündliches. Die wertvollsten Beweise: Bestellbestätigung mit Datum, Kontoauszug/PayPal-Transaktion, E-Mail-Verlauf mit ${m.name} (besonders deren ablehnende Antwort oder Schweigen), Tracking-Screenshots und Fotos. Telefonate ohne schriftliche Bestätigung zählen im Zweifel nicht.`,
    },
    {
      q: `Was kostet die Hilfe von ChargebackPilot?`,
      a: `Die KI-Ersteinschätzung deines Falls ist komplett kostenlos. Wenn du die fertigen Textvorlagen (Händler-Anschreiben, Bank-Chargeback-Antrag, Eskalationsschreiben) freischalten willst, zahlst du einmalig 0,99 € (inkl. MwSt.) pro Fall. Eine Flatrate für unbegrenzte Fälle gibt es für 9,99 € (inkl. MwSt.) (12 Monate).`,
    },
    {
      q: `Kann ich gegen ${m.name} auch klagen, wenn der Chargeback scheitert?`,
      a: `Ja. Der Chargeback ist nur der schnellste Weg — er ersetzt nicht deinen zivilrechtlichen Anspruch. Bei höheren Streitwerten lohnt sich oft die Verbraucherzentrale, ein Schlichtungsverfahren oder eine Klage vor dem Amts-/Landgericht. ChargebackPilot bietet hierfür keine Vertretung, hilft aber bei der Aufbereitung deiner Belege.`,
    },
    {
      q: `Ist ChargebackPilot eine Rechtsberatung?`,
      a: `Nein. ChargebackPilot stellt keine Rechtsberatung und keine Rechtsdienstleistung im Sinne des RDG dar. Wir liefern KI-gestützte Formulierungshilfe und strukturierte Vorlagen für deinen Käuferschutz-Antrag. Bei komplexen Streitwerten empfehlen wir die Verbraucherzentrale oder einen Fachanwalt für Verbraucherrecht.`,
    },
  ];
}
