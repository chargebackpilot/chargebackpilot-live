import type { WizardFormData } from "./wizard-schema";
import { EVIDENCE_GROUPS, PAYMENT_METHODS, STRUCTURED_QUESTIONS } from "./wizard-constants";

export type EvidenceStatus = "have" | "later" | "missing";

export interface EvidenceRecommendation {
  id: string;
  label: string;
  reason: string;
}

export interface CaseQuality {
  score: number;
  label: string;
  description: string;
  tone: "emerald" | "blue" | "amber" | "slate";
  strengths: string[];
  missing: string[];
  haveCount: number;
  laterCount: number;
}

const EVIDENCE_LABELS = EVIDENCE_GROUPS.flatMap((group) => group.items).reduce(
  (acc, item) => {
    acc[item.id] = item.label;
    return acc;
  },
  {} as Record<string, string>
);

const PROBLEM_EVIDENCE: Record<string, Array<{ id: string; reason: string }>> = {
  not_received: [
    { id: "tracking", reason: "zeigt, ob und wie die Sendung zugestellt worden sein soll" },
    { id: "order_confirmation", reason: "belegt Bestellung, Datum und erwartete Ware" },
    { id: "email_thread", reason: "zeigt den bisherigen Kontakt mit dem Händler" },
  ],
  defective: [
    { id: "photos", reason: "macht Mangel oder Abweichung nachvollziehbar" },
    { id: "order_confirmation", reason: "zeigt, was eigentlich bestellt wurde" },
    { id: "email_thread", reason: "belegt Reklamation und Reaktion des Händlers" },
  ],
  service_not_rendered: [
    { id: "order_confirmation", reason: "belegt gebuchte Leistung und Leistungsdatum" },
    { id: "tos", reason: "zeigt, welche Leistung zugesagt wurde" },
    { id: "email_thread", reason: "belegt Kontaktversuche und Rückmeldungen" },
  ],
  flight_travel: [
    { id: "cancellation", reason: "belegt Storno, Flugänderung oder Ausfall" },
    { id: "receipt", reason: "ordnet Zahlung, Betrag und Buchung zu" },
    { id: "email_thread", reason: "zeigt Kontakt mit Airline, Portal oder Hotel" },
  ],
  subscription: [
    { id: "cancellation", reason: "belegt Kündigung oder Widerruf" },
    { id: "receipt", reason: "zeigt die strittige Abbuchung" },
    { id: "email_thread", reason: "belegt Nachfrage oder Widerspruch" },
  ],
  fraud: [
    { id: "receipt", reason: "belegt Zahlungsweg und Empfängerangaben" },
    { id: "tos", reason: "sichert Angebots- oder Shop-Screenshots" },
    { id: "order_confirmation", reason: "zeigt Bestellung, Produkt und Preis" },
  ],
  food_delivery: [
    { id: "order_confirmation", reason: "belegt Bestellung, Restaurant und Zeitpunkt" },
    { id: "photos", reason: "zeigt falsche, fehlende oder unbrauchbare Lieferung" },
    { id: "chat_screenshot", reason: "belegt App-Support und Rückmeldung" },
  ],
  refund_promised: [
    { id: "refund_promise", reason: "belegt die zugesagte Erstattung" },
    { id: "receipt", reason: "ordnet Betrag und Zahlung zu" },
    { id: "email_thread", reason: "zeigt, dass du nachgefragt hast" },
  ],
  other: [
    { id: "receipt", reason: "belegt die strittige Zahlung" },
    { id: "order_confirmation", reason: "zeigt, was vereinbart oder gekauft wurde" },
    { id: "email_thread", reason: "belegt Kontaktversuche und Reaktion" },
  ],
};

const PAYMENT_EVIDENCE: Record<string, Array<{ id: string; reason: string }>> = {
  paypal: [{ id: "chat_screenshot", reason: "hilft beim PayPal-Konfliktverlauf" }],
  visa_mastercard: [{ id: "receipt", reason: "ist meist zentral für die Umsatzreklamation" }],
  amex: [{ id: "receipt", reason: "ist meist zentral für die Kartenreklamation" }],
  klarna: [{ id: "chat_screenshot", reason: "hilft bei Klarna-App- oder Supportverlauf" }],
  apple_google_pay: [{ id: "receipt", reason: "zeigt die hinterlegte Karte oder Wallet-Zahlung" }],
  sepa: [{ id: "receipt", reason: "zeigt Mandat, Abbuchung oder Kontoumsatz" }],
  bank_transfer: [{ id: "receipt", reason: "zeigt Empfänger, IBAN und Überweisungsdatum" }],
};

export function getEvidenceLabel(id: string) {
  return EVIDENCE_LABELS[id] ?? id;
}

export function getPaymentLabel(id: string) {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id;
}

export function getEvidenceRecommendations(
  problemType: string,
  paymentMethod: string
): EvidenceRecommendation[] {
  const seen = new Set<string>();
  const combined = [
    ...(PROBLEM_EVIDENCE[problemType] ?? PROBLEM_EVIDENCE.other),
    ...(PAYMENT_EVIDENCE[paymentMethod] ?? []),
    { id: "receipt", reason: "ordnet Zahlung und Betrag eindeutig zu" },
  ];

  return combined
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.id !== "none";
    })
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      label: getEvidenceLabel(item.id),
      reason: item.reason,
    }));
}

export function countEvidenceStatuses(data: Partial<WizardFormData>) {
  const haveFromEvidence = new Set((data.evidence ?? []).filter((id) => id !== "none"));
  const statusValues = Object.entries(data.evidenceStatus ?? {}).filter(([id]) => id !== "none");
  const have = new Set(haveFromEvidence);
  let later = 0;
  let missing = 0;

  for (const [id, status] of statusValues) {
    if (status === "have") have.add(id);
    if (status === "later") later += 1;
    if (status === "missing") missing += 1;
  }

  return {
    have: have.size,
    later,
    missing,
    explicitNone: (data.evidence ?? []).includes("none"),
  };
}

function requiredAnswersComplete(data: Partial<WizardFormData>) {
  const questions = STRUCTURED_QUESTIONS[data.problemType ?? ""] ?? STRUCTURED_QUESTIONS.other;
  const required = questions.filter((question) => question.required);
  if (required.length === 0) {
    return Object.values(data.structuredAnswers ?? {}).some((value) => value.trim().length > 0);
  }
  return required.every((question) => {
    const value = data.structuredAnswers?.[question.id] ?? "";
    return value.trim().length > 0;
  });
}

export function getCaseQuality(data: Partial<WizardFormData>): CaseQuality {
  const strengths: string[] = [];
  const missing: string[] = [];
  const evidenceCounts = countEvidenceStatuses(data);
  let score = 0;

  if (data.paymentMethod) {
    score += 10;
    strengths.push("Zahlungsweg klar");
  } else {
    missing.push("Zahlungsart auswählen");
  }

  if (data.problemType) {
    score += 10;
    strengths.push("Problemtyp eingeordnet");
  } else {
    missing.push("Problemtyp wählen");
  }

  if ((data.merchantName ?? "").trim().length >= 2) {
    score += 12;
    strengths.push("Anbieter benannt");
  } else {
    missing.push("Anbieter oder Händler benennen");
  }

  if (data.paymentDate) {
    score += 8;
    strengths.push("Zahlungsdatum vorhanden");
  } else {
    missing.push("Zahlungsdatum ergänzen");
  }

  if (data.disputedAmount || data.purchaseAmount) {
    score += 10;
    strengths.push("Betrag angegeben");
  } else {
    missing.push("streitigen Betrag angeben");
  }

  if (data.merchantContacted) {
    score += 8;
    strengths.push("Händlerkontakt dokumentiert");
    if (data.merchantResponseType) score += 4;
    else missing.push("Händlerreaktion auswählen");
  } else {
    missing.push("Kontaktversuch mit Händler prüfen");
  }

  if (evidenceCounts.have >= 2) {
    score += 16;
    strengths.push("Belege gut vorbereitet");
  } else if (evidenceCounts.have === 1) {
    score += 10;
    strengths.push("erster Beleg vorhanden");
    missing.push("weitere Belege ergänzen");
  } else if (evidenceCounts.later > 0) {
    score += 5;
    missing.push("markierte Belege noch sichern");
  } else if (evidenceCounts.explicitNone) {
    score += 2;
    missing.push("Belege möglichst nachträglich sichern");
  } else {
    missing.push("Beleglage einordnen");
  }

  if (requiredAnswersComplete(data)) {
    score += 14;
    strengths.push("Falldetails beantwortet");
  } else {
    missing.push("Falldetails vervollständigen");
  }

  const capped = Math.min(100, score);
  if (capped >= 80) {
    return {
      score: capped,
      label: "Sehr gut vorbereitet",
      description: "Die wichtigsten Angaben sind da. Die Textentwürfe können konkret werden.",
      tone: "emerald",
      strengths: strengths.slice(0, 4),
      missing: missing.slice(0, 3),
      haveCount: evidenceCounts.have,
      laterCount: evidenceCounts.later,
    };
  }
  if (capped >= 60) {
    return {
      score: capped,
      label: "Solide vorbereitet",
      description: "Der Fall ist nutzbar strukturiert. Ein paar Belege oder Details helfen noch.",
      tone: "blue",
      strengths: strengths.slice(0, 4),
      missing: missing.slice(0, 3),
      haveCount: evidenceCounts.have,
      laterCount: evidenceCounts.later,
    };
  }
  if (capped >= 40) {
    return {
      score: capped,
      label: "Noch ausbaufähig",
      description: "Die Richtung stimmt. Ergänze vor der Analyse die wichtigsten Pflichtangaben.",
      tone: "amber",
      strengths: strengths.slice(0, 4),
      missing: missing.slice(0, 3),
      haveCount: evidenceCounts.have,
      laterCount: evidenceCounts.later,
    };
  }
  return {
    score: capped,
    label: "Kurzer Check nötig",
    description: "Starte mit Zahlungsart, Problem, Anbieter, Datum und Betrag.",
    tone: "slate",
    strengths: strengths.slice(0, 4),
    missing: missing.slice(0, 3),
    haveCount: evidenceCounts.have,
    laterCount: evidenceCounts.later,
  };
}

export function getPaymentNextStep(paymentMethod: string) {
  switch (paymentMethod) {
    case "paypal":
      return "PayPal-Konfliktcenter und Käuferschutz-Regeln prüfen.";
    case "visa_mastercard":
    case "amex":
      return "Kartenumsatz bei der kartenausgebenden Bank nachvollziehbar reklamieren.";
    case "klarna":
      return "Problem früh in Klarna melden und offene Forderung dort klären.";
    case "apple_google_pay":
      return "Hinterlegte Karte oder Wallet-Zahlung identifizieren und dort prüfen.";
    case "sepa":
      return "SEPA-Lastschrift und mögliche Rückgaberegeln bei der Bank prüfen.";
    case "bank_transfer":
      return "Überweisungsbeleg sichern und Händlerkontakt sauber dokumentieren.";
    default:
      return "Zahlungsweg und Anbieterregeln vor dem nächsten Schritt prüfen.";
  }
}
