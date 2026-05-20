import { GoogleGenerativeAI } from "@google/generative-ai";
import { type CaseAnalysis } from "@workspace/db";
import { logger } from "./logger";

const PRIMARY_KEY = process.env.GEMINI_API_KEY || "";
const FALLBACK_KEY = process.env.GEMINI_API_KEY_FALLBACK || "";

console.log(`[Gemini Init] Primary key set: ${!!PRIMARY_KEY}, Fallback key set: ${!!FALLBACK_KEY}`);

const primaryAi = PRIMARY_KEY ? new GoogleGenerativeAI(PRIMARY_KEY) : null;
const fallbackAi = FALLBACK_KEY ? new GoogleGenerativeAI(FALLBACK_KEY) : null;

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
  fraud: "Betrug / Scam Verdacht",
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
WICHTIG: Du bist KEIN Anwalt, erteilst keine Rechtsberatung und fällst keine rechtlich bindenden Urteile. 
Formuliere Einschätzungen zu Erfolgschancen immer vorsichtig und im Konjunktiv (z. B. 'könnte', 'möglicherweise', 'es besteht die Aussicht'). Formuliere die Textvorlagen so, dass der Nutzer als Absender auftritt.

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
  "successProbability": <Ganzzahl 0-100>,
  "successProbabilityLabel": "Hoch" | "Mittel" | "Niedrig",
  "summary": "...",
  "reasoning": "...",
  "missingEvidence": ["..."],
  "nextSteps": ["..."],
  "recommendedCategory": "...",
  "legalBasis": ["..."],
  "counterarguments": ["..."],
  "urgencyLevel": "hoch" | "mittel" | "niedrig",
  "deadline": "...",
  "merchantTemplate": "...",
  "bankTemplate": "...",
  "escalationTemplate": "...",
  "disclaimer": "..."
}

WICHTIGE RICHTLINIEN:
- Antworte NUR im JSON-Format.
- Antworte IMMER auf Deutsch.
- Die Textvorlagen sollen den spezifischen Sachverhalt (${input.merchantName}, ${input.amount.toFixed(2)} EUR, ${input.paymentDate}) konkret aufgreifen.`;
}

async function callGemini(genAI: any, prompt: string): Promise<CaseAnalysis> {
  // Wir probieren gemini-1.5-flash, was der Standardname ist.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("[Gemini] Sending request to gemini-1.5-flash...");
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
        // Manche Versionen haben Probleme mit responseMimeType in v1beta
      },
    });

    const response = await result.response;
    const rawText = response.text();
    
    if (!rawText) {
      throw new Error("Gemini returned empty text");
    }

    // JSON Extraktion verbessern
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON found in response");
    }

    const jsonText = rawText.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonText) as CaseAnalysis;

    if (!parsed.strength || !parsed.merchantTemplate) {
      throw new Error("JSON missing critical fields");
    }

    return parsed;
  } catch (error: any) {
    console.error("[Gemini API Detail Error]", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      stack: error.stack
    });
    throw error;
  }
}

export async function analyzeWithGemini(input: CaseInput): Promise<CaseAnalysis> {
  const prompt = buildPrompt(input);

  // Try primary key first
  if (primaryAi) {
    console.log("[Gemini] Attempting analysis with primary key...");
    try {
      const result = await callGemini(primaryAi, prompt);
      console.log("[Gemini] Primary key SUCCESS");
      return result;
    } catch (err: any) {
      console.warn(`[Gemini] Primary key FAILED: ${err?.message || err}`);
    }
  }

  // Try fallback key
  if (fallbackAi) {
    console.log("[Gemini] Attempting analysis with fallback key...");
    try {
      const result = await callGemini(fallbackAi, prompt);
      console.log("[Gemini] Fallback key SUCCESS");
      return result;
    } catch (err: any) {
      console.error(`[Gemini] Fallback key FAILED: ${err?.message || err}`);
    }
  }

  console.warn("[Gemini] All API keys failed or missing. Using local fallback logic.");
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
    missingEvidence: input.evidence.includes("none") || input.evidence.length === 0
      ? ["Zahlungsnachweis (Kontoauszug oder Screenshot der Abbuchung)", "Kommunikationsverlauf mit dem Händler"]
      : [],
    nextSteps: [
      `${input.merchantContacted ? "Händler erneut schriftlich kontaktieren und Frist setzen" : "Händler schriftlich kontaktieren – nutze die generierte Händler-Vorlage"}`,
      `Chargeback bei ${paymentLabel} einleiten – nutze die generierte Bank-Vorlage`,
      "Alle Belege sicher aufbewahren (Screenshots, E-Mails, Quittungen)",
      "Fristen beachten und zeitnah handeln",
    ],
    recommendedCategory: "Chargeback – Streitfall einleiten",
    legalBasis: ["§ 437 BGB – Rechte des Käufers bei Sachmängeln", "EU-Zahlungsdiensterichtlinie (PSD2)"],
    counterarguments: [
      "Händler könnte behaupten, die Ware sei zugestellt worden – daher Tracking-Dokumente sichern",
      "Bank könnte auf eigene Handlung des Verbrauchers hinweisen – klare Dokumentation ist wichtig",
    ],
    urgencyLevel: "mittel",
    deadline:
      paymentLabel === "PayPal"
        ? "PayPal Käuferschutz: 180 Tage ab Zahldatum. Handeln Sie zeitnah!"
        : "Chargeback-Fristen variieren: meist 60–120 Tage ab Kontoauszugsdatum. Bitte sofort handeln!",
    merchantTemplate: `Betreff: Formelle Reklamation – Transaktion vom ${input.paymentDate} über ${input.amount.toFixed(2)} EUR\n\nSehr geehrte Damen und Herren,\n\nich wende mich an Sie bezüglich einer Transaktion vom ${input.paymentDate} in Höhe von ${input.amount.toFixed(2)} EUR bei Ihrem Unternehmen (${input.merchantName}).\n\n${input.description}\n\nIch fordere Sie auf, mir den Betrag von ${input.amount.toFixed(2)} EUR bis spätestens 14 Tage nach Eingang dieses Schreibens zurückzuerstatten.\n\nMit freundlichen Grüßen\n\n---\nKeine Rechtsberatung. ChargebackPilot.de`,
    bankTemplate: `Betreff: Antrag auf Chargeback – ${input.merchantName} – ${input.amount.toFixed(2)} EUR – ${input.paymentDate}\n\nSehr geehrte Damen und Herren,\n\nIch beantrage die Einleitung eines Chargeback-Verfahrens für folgende Transaktion:\n• Händler: ${input.merchantName}\n• Betrag: ${input.amount.toFixed(2)} EUR\n• Datum: ${input.paymentDate}\n• Zahlungsmethode: ${paymentLabel}\n\n${input.description}\n\nMit freundlichen Grüßen\n\n---\nKeine Rechtsberatung. ChargebackPilot.de`,
    escalationTemplate: `Betreff: Eskalation – Ungelöster Streitfall – ${input.merchantName} – ${input.amount.toFixed(2)} EUR\n\nSehr geehrte Damen und Herren,\n\nDer bisherige Chargeback-Antrag für obigen Fall blieb erfolglos. Ich wende mich daher an die zuständige Schlichtungsstelle und bitte um Überprüfung.\n\nMit freundlichen Grüßen\n\n---\nKeine Rechtsberatung. ChargebackPilot.de`,
    disclaimer:
      "Keine Rechtsberatung. Keine Erfolgsgarantie. ChargebackPilot bietet allgemeine Informationen und KI-gestützte Formulierungshilfe. Die generierten Texte ersetzen keine anwaltliche Beratung.",
  };
}
