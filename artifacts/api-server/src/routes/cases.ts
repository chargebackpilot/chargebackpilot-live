import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable, type CaseAnalysis } from "@workspace/db";
import { CreateCaseBody, GetCaseParams } from "@workspace/api-zod";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

function analyzeCaseStrength(
  paymentMethod: string,
  problemType: string,
  evidence: string[],
  merchantContacted: boolean,
  merchantResponse: string | null | undefined,
): { strength: "stark" | "mittel" | "schwach"; score: number } {
  let score = 0;

  const strongMethods = ["paypal", "visa_mastercard", "amex"];
  const mediumMethods = ["klarna", "apple_google_pay"];

  if (strongMethods.includes(paymentMethod)) score += 3;
  else if (mediumMethods.includes(paymentMethod)) score += 2;
  else score += 0;

  const strongProblems = ["not_received", "fraud", "refund_promised"];
  const mediumProblems = ["defective", "service_not_rendered", "subscription"];
  if (strongProblems.includes(problemType)) score += 3;
  else if (mediumProblems.includes(problemType)) score += 2;
  else score += 1;

  const highValueEvidence = ["payment_proof", "refund_promise", "email_history", "cancellation_confirmation"];
  const mediumValueEvidence = ["order_confirmation", "chat_screenshots", "photos_videos", "tracking"];

  evidence.forEach((e) => {
    if (highValueEvidence.includes(e)) score += 2;
    else if (mediumValueEvidence.includes(e)) score += 1;
  });

  if (merchantContacted) score += 1;
  if (merchantResponse && merchantResponse.length > 10) score += 1;

  if (score >= 10) return { strength: "stark", score };
  if (score >= 5) return { strength: "mittel", score };
  return { strength: "schwach", score };
}

function getMissingEvidence(evidence: string[], paymentMethod: string, problemType: string): string[] {
  const missing: string[] = [];
  if (!evidence.includes("payment_proof")) missing.push("Zahlungsnachweis (Kontoauszug, Screenshot der Abbuchung)");
  if (!evidence.includes("order_confirmation") && ["not_received", "defective"].includes(problemType))
    missing.push("Bestellbestätigung oder Kaufbeleg");
  if (!evidence.includes("email_history") && !evidence.includes("chat_screenshots"))
    missing.push("Kommunikationsverlauf mit dem Händler (E-Mails, Chats)");
  if (problemType === "defective" && !evidence.includes("photos_videos"))
    missing.push("Fotos oder Videos des defekten Produkts");
  if (problemType === "refund_promised" && !evidence.includes("refund_promise"))
    missing.push("Schriftliche Rückerstattungszusage des Händlers");
  if (problemType === "not_received" && !evidence.includes("tracking"))
    missing.push("Tracking-Informationen oder Lieferstatus");
  return missing;
}

function getRecommendedCategory(paymentMethod: string, problemType: string): string {
  const map: Record<string, Record<string, string>> = {
    paypal: {
      not_received: "PayPal Käuferschutz – Artikel nicht erhalten",
      defective: "PayPal Käuferschutz – Artikel wesentlich anders als beschrieben",
      fraud: "PayPal Käuferschutz – Nicht autorisierte Transaktion",
      default: "PayPal Käuferschutz",
    },
    visa_mastercard: {
      not_received: "Chargeback Reason Code 30 – Ware nicht erhalten",
      defective: "Chargeback Reason Code 53 – Ware nicht wie beschrieben",
      fraud: "Chargeback Reason Code 10.4 / 4853 – Nicht autorisierte Transaktion",
      subscription: "Chargeback Reason Code 41 – Stornierte Wiederkehrende Transaktion",
      default: "Chargeback über kartenausgebende Bank",
    },
    amex: {
      not_received: "American Express Dispute – Goods/Services Not Received",
      defective: "American Express Dispute – Not as Described",
      fraud: "American Express Dispute – Fraud",
      default: "American Express Dispute",
    },
    klarna: {
      not_received: "Klarna Käuferschutz – Bestellung nicht angekommen",
      defective: "Klarna Streitfall – Artikel entspricht nicht der Beschreibung",
      default: "Klarna Reklamation / Käuferschutz",
    },
    default: { default: "Direkte Reklamation beim Händler, dann Chargeback über Zahlungsdienstleister" },
  };

  const methodMap = map[paymentMethod] || map["default"];
  return methodMap[problemType] || methodMap["default"];
}

function generateMerchantTemplate(
  merchantName: string,
  amount: number,
  paymentDate: string,
  problemType: string,
  description: string,
): string {
  const problemDescriptions: Record<string, string> = {
    not_received: `Ich habe eine Bestellung aufgegeben, die Ware jedoch bis heute nicht erhalten. Trotz mehrfacher Nachfrage konnte keine Lösung gefunden werden.`,
    defective: `Die gelieferte Ware entspricht nicht der Produktbeschreibung bzw. ist defekt. Eine einvernehmliche Lösung konnte bisher nicht erzielt werden.`,
    service_not_rendered: `Die bezahlte Dienstleistung wurde nicht erbracht. Eine Rückerstattung wurde bisher nicht vorgenommen.`,
    flight_travel: `Meine Reise/Flug hat nicht wie vereinbart stattgefunden bzw. wurde nicht erstattet.`,
    subscription: `Es wurden Abbuchungen vorgenommen, zu denen ich kein aktives Abonnement unterhalte bzw. dieses wirksam gekündigt habe.`,
    fraud: `Es wurde eine Abbuchung von meinem Konto vorgenommen, die ich nicht autorisiert habe.`,
    refund_promised: `Sie haben mir eine Rückerstattung zugesagt, die bis heute nicht auf meinem Konto eingegangen ist.`,
    default: `Es liegt ein Problem mit meiner Transaktion vor, das ich hiermit schriftlich reklamiere.`,
  };

  const problemText = problemDescriptions[problemType] || problemDescriptions["default"];

  return `Betreff: Formelle Reklamation – Transaktion vom ${paymentDate} über ${amount.toFixed(2)} EUR

Sehr geehrte Damen und Herren,

ich wende mich an Sie bezüglich einer Transaktion vom ${paymentDate} in Höhe von ${amount.toFixed(2)} EUR bei Ihrem Unternehmen (${merchantName}).

${problemText}

Sachverhalt: ${description}

Ich fordere Sie hiermit auf, mir den Betrag von ${amount.toFixed(2)} EUR bis spätestens 14 Tage nach Eingang dieses Schreibens vollständig zurückzuerstatten. Sollte innerhalb dieser Frist keine Einigung erzielt werden, behalte ich mir vor, ein Rückbuchungsverfahren (Chargeback) bei meinem Zahlungsdienstleister einzuleiten.

Bitte bestätigen Sie den Eingang dieser Reklamation schriftlich.

Mit freundlichen Grüßen

---
Hinweis: Dieses Schreiben wurde mithilfe von ChargebackPilot.de erstellt. ChargebackPilot bietet keine Rechtsberatung. Bitte passen Sie diesen Text ggf. an Ihren individuellen Sachverhalt an.`;
}

function generateBankTemplate(
  merchantName: string,
  amount: number,
  paymentDate: string,
  paymentMethod: string,
  problemType: string,
  recommendedCategory: string,
  description: string,
): string {
  const methodNames: Record<string, string> = {
    paypal: "PayPal",
    visa_mastercard: "Visa/Mastercard Kreditkarte",
    amex: "American Express Kreditkarte",
    klarna: "Klarna",
    apple_google_pay: "Apple Pay / Google Pay",
    bank_transfer: "Banküberweisung",
    other: "Zahlungsdienstleister",
  };

  const methodName = methodNames[paymentMethod] || "Zahlungsdienstleister";

  return `Betreff: Antrag auf Rückbuchung (Chargeback) – Transaktion ${paymentDate} – ${merchantName} – ${amount.toFixed(2)} EUR

Sehr geehrte Damen und Herren,

ich beantrage hiermit die Einleitung eines Rückbuchungsverfahrens (Chargeback) für folgende Transaktion:

• Händler: ${merchantName}
• Betrag: ${amount.toFixed(2)} EUR
• Datum: ${paymentDate}
• Zahlungsmethode: ${methodName}
• Streitkategorie: ${recommendedCategory}

Sachverhalt: ${description}

Ich habe den Händler bereits kontaktiert und um Lösung gebeten, jedoch ohne Erfolg. Ich bitte daher um Einleitung des Chargeback-Verfahrens gemäß den geltenden Netzwerkregeln.

Alle relevanten Belege stelle ich auf Anforderung gerne zur Verfügung.

Mit freundlichen Grüßen

---
Hinweis: Dieses Schreiben wurde mithilfe von ChargebackPilot.de erstellt. ChargebackPilot bietet keine Rechtsberatung. Bitte passen Sie diesen Text ggf. an Ihren individuellen Sachverhalt an.`;
}

function getNextSteps(
  paymentMethod: string,
  merchantContacted: boolean,
  strength: "stark" | "mittel" | "schwach",
): string[] {
  const steps: string[] = [];

  if (!merchantContacted) {
    steps.push("Kontaktieren Sie zuerst den Händler schriftlich mit der generierten Händler-Vorlage.");
    steps.push("Setzen Sie eine Frist von 14 Tagen für die Rückmeldung.");
  } else {
    steps.push("Sie haben den Händler bereits kontaktiert – gut. Dokumentieren Sie alle Antworten.");
  }

  if (paymentMethod === "paypal") {
    steps.push("Öffnen Sie einen Streitfall im PayPal Resolution Center unter paypal.com/disputes.");
    steps.push("Sie haben in der Regel 180 Tage ab Zahlung Zeit für einen PayPal Käuferschutzantrag.");
  } else if (["visa_mastercard", "amex"].includes(paymentMethod)) {
    steps.push("Wenden Sie sich schriftlich an Ihre kartenausgebende Bank und beantragen Sie einen Chargeback.");
    steps.push("Beachten Sie die Fristen: meist 60–120 Tage ab Kontoauszugsdatum.");
  } else if (paymentMethod === "klarna") {
    steps.push("Eröffnen Sie eine Reklamation direkt in der Klarna App unter 'Einkäufe' → 'Streitfall melden'.");
  }

  if (strength === "schwach") {
    steps.push("Sammeln Sie weitere Beweise, bevor Sie das Chargeback-Verfahren einleiten.");
  }

  steps.push("Bewahren Sie alle Belege (Screenshots, E-Mails, Quittungen) sicher auf.");

  return steps;
}

router.post("/cases", async (req, res) => {
  const parseResult = CreateCaseBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Ungültige Eingabedaten", details: parseResult.error.issues });
    return;
  }

  const data = parseResult.data;
  const evidence = (data.evidence as string[]) || [];

  const { strength } = analyzeCaseStrength(
    data.paymentMethod,
    data.problemType,
    evidence,
    data.merchantContacted ?? false,
    data.merchantResponse,
  );

  const strengthLabels: Record<string, string> = {
    stark: "Starke Ausgangslage",
    mittel: "Mittlere Ausgangslage",
    schwach: "Schwache Ausgangslage – erst Beweise sammeln",
  };

  const summaries: Record<string, string> = {
    stark: `Ihr Fall hat eine gute Ausgangslage für ein Chargeback-Verfahren. Die vorhandenen Beweise und die gewählte Zahlungsmethode sprechen für Sie.`,
    mittel: `Ihr Fall hat eine mittlere Aussicht auf Erfolg. Mit einigen zusätzlichen Belegen können Sie Ihre Position stärken.`,
    schwach: `Ihr Fall ist derzeit noch nicht optimal aufgestellt. Wir empfehlen, zuerst weitere Belege zu sammeln und den Händler direkt zu kontaktieren.`,
  };

  const recommendedCategory = getRecommendedCategory(data.paymentMethod, data.problemType);
  const missingEvidence = getMissingEvidence(evidence, data.paymentMethod, data.problemType);
  const nextSteps = getNextSteps(data.paymentMethod, data.merchantContacted ?? false, strength);

  const analysis: CaseAnalysis = {
    strength,
    strengthLabel: strengthLabels[strength],
    summary: summaries[strength],
    reasoning: `Basierend auf Ihrer Zahlungsmethode (${data.paymentMethod}), dem Problemtyp (${data.problemType}) und den angegebenen ${evidence.length} Beweismitteln wurde die Einschätzung "${strengthLabels[strength]}" ermittelt.`,
    missingEvidence,
    nextSteps,
    recommendedCategory,
    merchantTemplate: generateMerchantTemplate(
      data.merchantName,
      data.amount,
      data.paymentDate,
      data.problemType,
      data.description,
    ),
    bankTemplate: generateBankTemplate(
      data.merchantName,
      data.amount,
      data.paymentDate,
      data.paymentMethod,
      data.problemType,
      recommendedCategory,
      data.description,
    ),
    disclaimer:
      "Keine Rechtsberatung. Keine Erfolgsgarantie. ChargebackPilot bietet allgemeine Informationen und KI-gestützte Formulierungshilfe. Die generierten Texte ersetzen keine anwaltliche Beratung.",
  };

  const [newCase] = await db
    .insert(casesTable)
    .values({
      paymentMethod: data.paymentMethod,
      problemType: data.problemType,
      merchantName: data.merchantName,
      amount: data.amount,
      paymentDate: data.paymentDate,
      merchantCountry: data.merchantCountry ?? null,
      merchantContacted: data.merchantContacted ?? false,
      merchantResponse: data.merchantResponse ?? null,
      evidence: evidence,
      description: data.description,
      analysis,
    })
    .returning();

  res.status(201).json({
    id: String(newCase.id),
    paymentMethod: newCase.paymentMethod,
    problemType: newCase.problemType,
    merchantName: newCase.merchantName,
    amount: newCase.amount,
    paymentDate: newCase.paymentDate,
    merchantCountry: newCase.merchantCountry,
    merchantContacted: newCase.merchantContacted,
    merchantResponse: newCase.merchantResponse,
    evidence: newCase.evidence,
    description: newCase.description,
    analysis: newCase.analysis,
    createdAt: newCase.createdAt.toISOString(),
  });
});

router.get("/cases/stats", async (req, res) => {
  const [totalResult] = await db.select({ count: count() }).from(casesTable);
  const total = Number(totalResult.count);

  const strengthCounts = await db
    .select({
      strength: sql<string>`${casesTable.analysis}->>'strength'`,
      count: count(),
    })
    .from(casesTable)
    .groupBy(sql`${casesTable.analysis}->>'strength'`);

  let strongCases = 0, mediumCases = 0, weakCases = 0;
  for (const row of strengthCounts) {
    if (row.strength === "stark") strongCases = Number(row.count);
    else if (row.strength === "mittel") mediumCases = Number(row.count);
    else if (row.strength === "schwach") weakCases = Number(row.count);
  }

  const paymentMethodCounts = await db
    .select({
      method: casesTable.paymentMethod,
      count: count(),
    })
    .from(casesTable)
    .groupBy(casesTable.paymentMethod)
    .limit(5);

  const problemTypeCounts = await db
    .select({
      type: casesTable.problemType,
      count: count(),
    })
    .from(casesTable)
    .groupBy(casesTable.problemType)
    .limit(5);

  res.json({
    totalCases: total,
    strongCases,
    mediumCases,
    weakCases,
    topPaymentMethods: paymentMethodCounts.map((r) => ({ method: r.method, count: Number(r.count) })),
    topProblemTypes: problemTypeCounts.map((r) => ({ type: r.type, count: Number(r.count) })),
  });
});

router.get("/cases/:id", async (req, res) => {
  const paramsResult = GetCaseParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  const id = parseInt(paramsResult.data.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID muss eine Zahl sein" });
    return;
  }

  const [found] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  if (!found) {
    res.status(404).json({ error: "Fall nicht gefunden" });
    return;
  }

  res.json({
    id: String(found.id),
    paymentMethod: found.paymentMethod,
    problemType: found.problemType,
    merchantName: found.merchantName,
    amount: found.amount,
    paymentDate: found.paymentDate,
    merchantCountry: found.merchantCountry,
    merchantContacted: found.merchantContacted,
    merchantResponse: found.merchantResponse,
    evidence: found.evidence,
    description: found.description,
    analysis: found.analysis,
    createdAt: found.createdAt.toISOString(),
  });
});

export default router;
