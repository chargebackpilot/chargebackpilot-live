import {
  STRUCTURED_QUESTIONS,
  MERCHANT_RESPONSE_OPTIONS,
  EVIDENCE_GROUPS,
} from "./wizard-constants";

const EVIDENCE_LABELS = EVIDENCE_GROUPS.flatMap((group) => group.items).reduce(
  (acc, item) => {
    acc[item.id] = item.label;
    return acc;
  },
  {} as Record<string, string>
);

export function buildDescription(
  structuredAnswers: Record<string, string>,
  problemType: string,
  purchaseAmount: string,
  disputedAmount: string,
  evidenceStatus: Record<string, "have" | "later" | "missing"> = {}
): string {
  const questions = STRUCTURED_QUESTIONS[problemType] ?? STRUCTURED_QUESTIONS.other;
  const parts: string[] = [];

  for (const q of questions) {
    const val = structuredAnswers[q.id];
    if (!val || val.trim() === "") continue;
    parts.push(`${q.label}\n${val.trim()}`);
  }

  if (
    purchaseAmount &&
    disputedAmount &&
    parseFloat(purchaseAmount) !== parseFloat(disputedAmount)
  ) {
    const pct = Math.round((parseFloat(disputedAmount) / parseFloat(purchaseAmount)) * 100);
    parts.push(
      `Kaufbetrag gesamt: ${purchaseAmount} EUR — streitiger Betrag: ${disputedAmount} EUR (${pct}% des Kaufbetrags)`
    );
  }

  const evidenceGroups = {
    Vorhanden: Object.entries(evidenceStatus)
      .filter(([, status]) => status === "have")
      .map(([id]) => EVIDENCE_LABELS[id] ?? id),
    "Noch zu sichern": Object.entries(evidenceStatus)
      .filter(([, status]) => status === "later")
      .map(([id]) => EVIDENCE_LABELS[id] ?? id),
    "Nicht vorhanden": Object.entries(evidenceStatus)
      .filter(([, status]) => status === "missing")
      .map(([id]) => EVIDENCE_LABELS[id] ?? id),
  };

  const evidenceLines = Object.entries(evidenceGroups)
    .filter(([, values]) => values.length > 0)
    .map(([label, values]) => `${label}: ${values.join(", ")}`);
  if (evidenceLines.length > 0) {
    parts.push(`Belegstatus\n${evidenceLines.join("\n")}`);
  }

  return parts.join("\n\n");
}

export function buildMerchantResponse(responseType: string, responseNote: string): string {
  const label = MERCHANT_RESPONSE_OPTIONS.find((o) => o.id === responseType)?.label ?? "";
  if (!label) return "";
  return responseNote.trim() ? `${label}: ${responseNote.trim()}` : label;
}

export function getDisputedPercent(purchase: string, disputed: string): number | null {
  const p = parseFloat(purchase);
  const d = parseFloat(disputed);
  if (!p || !d || d > p) return null;
  return Math.round((d / p) * 100);
}

export function extractSubject(template: string, fallback: string): string {
  const m = template.match(/^\s*Betreff:\s*(.+)$/im);
  return (m?.[1] ?? fallback).trim();
}

export function extractBody(template: string): string {
  // strip Betreff/Sehr geehrte/Mit freundlichen Grüßen wrapper for editable body
  const lines = template.split("\n");
  const start = lines.findIndex((l) => /sehr geehrte/i.test(l));
  const end = lines.findIndex((l) => /mit freundlichen gr/i.test(l));
  if (start === -1 || end === -1 || end <= start) return template;
  return lines
    .slice(start + 1, end)
    .join("\n")
    .trim();
}
