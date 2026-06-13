import { GoogleGenAI } from "@google/genai";
import { type CaseAnalysis } from "@workspace/db";
import { logger } from "./logger";

const PRIMARY_KEY = process.env.GEMINI_API_KEY ?? "";
const FALLBACK_KEY = process.env.GEMINI_API_KEY_FALLBACK ?? "";

const primaryAi = PRIMARY_KEY ? new GoogleGenAI({ apiKey: PRIMARY_KEY }) : null;
const fallbackAi = FALLBACK_KEY ? new GoogleGenAI({ apiKey: FALLBACK_KEY }) : null;

export interface CaseInput {
  paymentMethod: string;
  problemType: string;
  merchantName: string;
  amount: number;
  paymentDate: string;
  merchantCountry?: string | null;
  merchantContacted: boolean;
  merchantResponse?: string | null;
  evidence: string[];
  description: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paypal: "PayPal",
  visa_mastercard: "Kreditkarte Visa/Mastercard",
  amex: "American Express",
  klarna: "Klarna",
  apple_google_pay: "Apple Pay / Google Pay",
  bank_transfer: "Banküberweisung",
  other: "Sonstiges",
};

const PROBLEM_TYPE_LABELS: Record<string, string> = {
  not_received: "Ware nicht erhalten",
  defective: "Ware defekt / anders als beschrieben",
  service_not_rendered: "Dienstleistung nicht erbracht",
  flight_travel: "Flug / Reise / Hotel Problem",
  subscription: "Abo / ungewollte Abbuchung",
  fraud: "Betrugs-/Scam-Verdacht",
  food_delivery: "Lieferdienst / Essen unbrauchbar",
  refund_promised: "Rückerstattung zugesagt aber nicht erhalten",
  other: "Sonstiges",
};

const EVIDENCE_LABELS: Record<string, string> = {
  receipt: "Zahlungsnachweis",
  order_confirmation: "Bestellbestätigung",
  email_thread: "E-Mail-Verlauf",
  chat_screenshot: "Chat-Screenshots",
  photos: "Fotos/Videos",
  tracking: "Tracking / Sendungsverfolgung",
  cancellation: "Stornierungsbestätigung",
  refund_promise: "Refund-Zusage",
  tos: "AGB/Screenshots",
  none: "Keine Beweise vorhanden",
};

function buildPrompt(input: CaseInput): string {
  const evidenceList = input.evidence.map((e) => EVIDENCE_LABELS[e] || e).join(", ") || "Keine";
  const paymentLabel = PAYMENT_METHOD_LABELS[input.paymentMethod] || input.paymentMethod;
  const problemLabel = PROBLEM_TYPE_LABELS[input.problemType] || input.problemType;

  return `Du bist ein neutraler KI-Sprachassistent. Deine Aufgabe ist es, Verbraucher-Sachverhalte logisch zu strukturieren und sachliche, formelle Textentwürfe für Reklamationen zu generieren.
WICHTIG: Du bist KEIN Anwalt, erteilst keine Rechtsberatung, prüfst keine Ansprüche verbindlich und fällst keine rechtlich bindenden Urteile.
Formuliere alle Einschätzungen vorsichtig, unverbindlich und im Konjunktiv (z. B. 'könnte', 'möglicherweise', 'kommt in Betracht'). Formuliere die Textentwürfe so, dass der Nutzer als Absender auftritt und sie vor Versand selbst prüfen muss.

FALLDATEN:
- Zahlungsmethode: ${paymentLabel}
- Problemtyp: ${problemLabel}
- Händler: ${input.merchantName}
- Betrag: ${input.amount.toFixed(2)} EUR
- Zahlungsdatum: ${input.paymentDate}
- Land des Händlers: ${input.merchantCountry || "Nicht angegeben"}
- Händler bereits kontaktiert: ${input.merchantContacted ? "Ja" : "Nein"}
- Antwort des Händlers: ${input.merchantResponse || "Keine"}
- Vorhandene Beweise: ${evidenceList}
- Fallbeschreibung: ${input.description}

Analysiere diesen Fall und antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt (kein Markdown, keine Erklärungen außerhalb des JSON) mit folgender Struktur:

{
  "strength": "stark" | "mittel" | "schwach",
  "strengthLabel": "Starke Ausgangslage" | "Mittlere Ausgangslage" | "Schwache Ausgangslage",
  "successProbability": <Ganzzahl 0-100, nur interne grobe Orientierung zur Sortierung; keine verbindliche Erfolgsprognose>,
  "successProbabilityLabel": "Hoch" | "Mittel" | "Niedrig",
  "summary": "<2-3 Sätze prägnante Fallzusammenfassung aus Sicht des Verbrauchers>",
  "reasoning": "<4-6 Sätze vorsichtige, unverbindliche Einordnung: Zahlungsmethode, Beweislage, Problemtyp, praktische Anbieterregeln>",
  "missingEvidence": ["<Fehlender Beweis 1 mit konkreter Erklärung warum er wichtig ist>", ...],
  "nextSteps": [
    "<Möglicher Schritt 1 mit sachlicher Orientierung, typischen Fristenhinweisen und ggf. offiziellen Anlaufstellen>",
    ...mindestens 4 Schritte...
  ],
  "recommendedCategory": "<Möglicherweise passende Chargeback-/Käuferschutz-Kategorie; falls unsicher, deutlich als Orientierung kennzeichnen>",
  "legalBasis": [
    "<Allgemeiner rechtlicher Orientierungshinweis, z.B. mögliche Käuferrechte bei Sachmängeln; keine Anspruchsprüfung>",
    ...mindestens 2 Rechtsgrundlagen...
  ],
  "counterarguments": [
    "<Mögliche Rückfrage oder Einwendung des Händlers/der Bank und sachlicher Antwortvorschlag>",
    ...mindestens 2 Gegenargumente...
  ],
  "urgencyLevel": "hoch" | "mittel" | "niedrig",
  "deadline": "<Vorsichtiger Fristenhinweis: z.B. 'PayPal nennt häufig 180 Tage ab Zahlung. Bitte konkrete Frist im Konto/bei PayPal prüfen.'>",
  "merchantTemplate": "<Sachlicher Textentwurf an den Händler auf Deutsch, formell, max 150 Wörter>",
  "bankTemplate": "<Sachlicher Textentwurf an Bank/PayPal/Klarna auf Deutsch, max 150 Wörter>",
  "escalationTemplate": "<Sachlicher Eskalationsentwurf für Schlichtungsstelle oder Verbraucherzentrale, max 150 Wörter>",
  "disclaimer": "Keine Rechtsberatung. ChargebackPilot bietet allgemeine Informationen und unverbindliche Textentwürfe. Die generierten Inhalte ersetzen keine anwaltliche Beratung und stellen keine Rechtsdienstleistung dar. Bitte vor Versand selbst prüfen."
}

WICHTIGE RICHTLINIEN FÜR DIE ANALYSE:
- Sei realistisch und vorsichtig. Keine falschen Hoffnungen, keine Garantien, keine verbindlichen Rechtsaussagen.
- Die successProbability ist nur eine interne grobe Orientierung und soll nicht wie eine verbindliche Erfolgsprognose klingen.
- Für PayPal/Kreditkarten: Ein Käuferschutz-/Chargeback-Verfahren kann in Betracht kommen, wenn Belege und Anbieterregeln passen.
- Für Banküberweisung: weise vorsichtig darauf hin, dass direkte Händlerkommunikation oft wichtiger ist.
- Die Textentwürfe müssen sachlich, vollständig und vom Nutzer vor Versand prüfbar sein.
- Nutze keine verbindliche Anspruchsprüfung. Allgemeine Normen oder Anbieterregeln nur vorsichtig als Orientierung nennen.
- Erwähne typische Fristen nur als allgemeine Hinweise und fordere immer zur Prüfung beim Anbieter/Zahlungsdienstleister auf.
- Die Vorlagen sollen den spezifischen Sachverhalt (${input.merchantName}, ${input.amount.toFixed(2)} EUR, ${input.paymentDate}) konkret aufgreifen
- Antworte IMMER auf Deutsch
- KEIN Markdown in den Template-Feldern, nur plain text mit Zeilenumbrüchen`;
}

function isQuotaOrRateError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  return (
    lower.includes("quota") ||
    lower.includes("rate") ||
    lower.includes("resource_exhausted") ||
    lower.includes("resource exhausted") ||
    lower.includes("429") ||
    lower.includes("exceeded") ||
    lower.includes("limit")
  );
}

async function callGemini(client: GoogleGenAI, prompt: string): Promise<CaseAnalysis> {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      maxOutputTokens: 32768,
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text ?? "";
  const parsed = JSON.parse(rawText) as CaseAnalysis;

  if (
    typeof parsed.strength !== "string" ||
    typeof parsed.successProbability !== "number" ||
    typeof parsed.merchantTemplate !== "string"
  ) {
    throw new Error("Invalid Gemini response structure");
  }

  return parsed;
}

export async function analyzeWithGemini(input: CaseInput): Promise<CaseAnalysis> {
  const prompt = buildPrompt(input);

  // Try primary key first (if configured)
  if (primaryAi) {
    try {
      const result = await callGemini(primaryAi, prompt);
      logger.info({ key: "primary" }, "Gemini analysis succeeded");
      return result;
    } catch (err) {
      const quotaErr = isQuotaOrRateError(err);
      logger.warn(
        { err: err instanceof Error ? err.message : String(err), quotaErr },
        quotaErr
          ? "Primary Gemini key quota/rate-limited, trying fallback key"
          : "Primary Gemini call failed, trying fallback key"
      );
    }
  } else {
    logger.warn("GEMINI_API_KEY not set, using fallback key directly");
  }

  // Try fallback key (if configured)
  if (fallbackAi) {
    try {
      const result = await callGemini(fallbackAi, prompt);
      logger.info({ key: "fallback" }, "Gemini analysis succeeded via fallback key");
      return result;
    } catch (err) {
      logger.error(
        { err: err instanceof Error ? err.message : String(err) },
        "Both Gemini keys failed, using local fallback analysis"
      );
    }
  }

  logger.warn("No functional Gemini API keys available, using local fallback analysis");
  return buildFallbackAnalysis(input);
}

function buildFallbackAnalysis(input: CaseInput): CaseAnalysis {
  const paymentLabel = PAYMENT_METHOD_LABELS[input.paymentMethod] || input.paymentMethod;
  const problemLabel = PROBLEM_TYPE_LABELS[input.problemType] || input.problemType;
  const strongMethods = ["paypal", "visa_mastercard", "amex"];
  const mediumMethods = ["klarna", "apple_google_pay"];
  let score = 0;
  if (strongMethods.includes(input.paymentMethod)) score += 35;
  else if (mediumMethods.includes(input.paymentMethod)) score += 20;
  else score += 5;

  const strongProblems = ["not_received", "fraud", "refund_promised"];
  const mediumProblems = ["defective", "service_not_rendered", "subscription"];
  if (strongProblems.includes(input.problemType)) score += 25;
  else if (mediumProblems.includes(input.problemType)) score += 15;
  else score += 8;

  score += Math.min(input.evidence.filter((e) => e !== "none").length * 8, 30);
  if (input.merchantContacted) score += 10;

  const probability = Math.min(Math.max(score, 5), 92);
  const strength = probability >= 65 ? "stark" : probability >= 40 ? "mittel" : "schwach";
  const strengthLabel =
    strength === "stark"
      ? "Starke Ausgangslage"
      : strength === "mittel"
        ? "Mittlere Ausgangslage"
        : "Schwache Ausgangslage";

  return {
    strength,
    strengthLabel,
    successProbability: probability,
    successProbabilityLabel: probability >= 65 ? "Hoch" : probability >= 40 ? "Mittel" : "Niedrig",
    summary: `Ihr Fall (${problemLabel} bei ${input.merchantName} über ${input.amount.toFixed(2)} EUR via ${paymentLabel}) wurde analysiert. Die Ausgangslage ist ${strengthLabel.toLowerCase()}.`,
    reasoning: `Die Einschätzung basiert auf der Zahlungsmethode (${paymentLabel}), dem Problemtyp (${problemLabel}) sowie ${input.evidence.filter((e) => e !== "none").length} vorliegenden Beweismitteln. ${input.merchantContacted ? "Der Händler wurde bereits kontaktiert, was die Position stärkt." : "Der Händler sollte zunächst direkt kontaktiert werden."}`,
    missingEvidence:
      input.evidence.includes("none") || input.evidence.length === 0
        ? [
            "Zahlungsnachweis (Kontoauszug oder Screenshot der Abbuchung)",
            "Kommunikationsverlauf mit dem Händler",
          ]
        : [],
    nextSteps: [
      `${input.merchantContacted ? "Händler erneut schriftlich kontaktieren und eine angemessene Antwortfrist vorschlagen" : "Händler schriftlich kontaktieren – nutze den generierten Textentwurf als Ausgangspunkt"}`,
      `Prüfe bei ${paymentLabel}, ob ein Käuferschutz- oder Reklamationsverfahren in Betracht kommt – nutze den Textentwurf nur nach eigener Prüfung`,
      "Alle Belege sicher aufbewahren (Screenshots, E-Mails, Quittungen)",
      "Typische Fristen direkt beim Zahlungsdienstleister prüfen und zeitnah handeln",
    ],
    recommendedCategory: "Mögliche Zahlungsreklamation prüfen",
    legalBasis: [
      "§ 437 BGB – Rechte des Käufers bei Sachmängeln",
      "EU-Zahlungsdiensterichtlinie (PSD2)",
    ],
    counterarguments: [
      "Händler könnte behaupten, die Ware sei zugestellt worden – daher Tracking-Dokumente sichern",
      "Bank könnte auf eigene Handlung des Verbrauchers hinweisen – klare Dokumentation ist wichtig",
    ],
    urgencyLevel: "mittel",
    deadline:
      input.paymentMethod === "paypal"
        ? "PayPal nennt häufig 180 Tage ab Zahlung. Bitte die konkrete Frist direkt im PayPal-Konto prüfen."
        : "Fristen für Reklamationen/Chargeback variieren je nach Bank und Zahlungsart. Bitte die konkrete Frist direkt beim Zahlungsdienstleister prüfen.",
    merchantTemplate: `Betreff: Reklamation – Transaktion vom ${input.paymentDate} über ${input.amount.toFixed(2)} EUR\n\nSehr geehrte Damen und Herren,\n\nich wende mich an Sie bezüglich einer Transaktion vom ${input.paymentDate} in Höhe von ${input.amount.toFixed(2)} EUR bei Ihrem Unternehmen (${input.merchantName}).\n\n${input.description}\n\nBitte prüfen Sie den Vorgang und teilen Sie mir schriftlich mit, wie Sie die Angelegenheit lösen möchten. Ich bitte um Rückmeldung innerhalb einer angemessenen Frist.\n\nMit freundlichen Grüßen\n\n---\nFormulierungshilfe, keine Rechtsberatung. Vor Versand prüfen.`,
    bankTemplate: `Betreff: Bitte um Prüfung einer Zahlungsreklamation – ${input.merchantName} – ${input.amount.toFixed(2)} EUR – ${input.paymentDate}\n\nSehr geehrte Damen und Herren,\n\nich bitte um Prüfung, ob für folgende Transaktion eine Zahlungsreklamation bzw. ein Chargeback-Verfahren in Betracht kommt:\n• Händler: ${input.merchantName}\n• Betrag: ${input.amount.toFixed(2)} EUR\n• Datum: ${input.paymentDate}\n• Zahlungsmethode: ${paymentLabel}\n\n${input.description}\n\nMit freundlichen Grüßen\n\n---\nKeine Rechtsberatung. ChargebackPilot.de`,
    escalationTemplate: `Betreff: Bitte um weitere Orientierung – ungelöster Streitfall – ${input.merchantName} – ${input.amount.toFixed(2)} EUR\n\nSehr geehrte Damen und Herren,\n\nfür den oben genannten Vorgang konnte bislang keine nachvollziehbare Klärung erreicht werden. Ich bitte um Orientierung, welche weiteren Schritte oder Unterlagen für eine Prüfung sinnvoll sein könnten.\n\nMit freundlichen Grüßen\n\n---\nKeine Rechtsberatung. ChargebackPilot.de`,
    disclaimer:
      "Keine Rechtsberatung. ChargebackPilot bietet allgemeine Informationen und Textvorlagen. Die generierten Texte ersetzen keine anwaltliche Beratung.",
  };
}
