import type jsPDF from "jspdf";

interface PdfData {
  merchantName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  problemType: string;
  successProbability: number;
  successProbabilityLabel: string;
  summary: string;
  nextSteps: string[];
  merchantTemplate: string;
  bankTemplate: string;
  escalationTemplate: string;
  generatedAt?: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  paypal: "PayPal",
  visa_mastercard: "Kreditkarte Visa/Mastercard",
  amex: "American Express",
  klarna: "Klarna",
  apple_google_pay: "Apple/Google Pay",
  bank_transfer: "Banküberweisung",
  other: "Sonstige",
};

const PROBLEM_LABELS: Record<string, string> = {
  not_received: "Ware nicht erhalten",
  defective: "Ware defekt / anders als beschrieben",
  service_not_rendered: "Dienstleistung nicht erbracht",
  flight_travel: "Flug / Reise / Hotel",
  subscription: "Abo / ungewollte Abbuchung",
  fraud: "Betrug / Scam",
  food_delivery: "Lieferdienst",
  refund_promised: "Rückerstattung zugesagt",
  other: "Sonstiges",
};

function addTextBlock(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5,
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addSection(
  doc: jsPDF,
  title: string,
  content: string,
  startY: number,
  pageW: number,
  margin: number,
): number {
  const usable = pageW - margin * 2;

  if (startY > 240) {
    doc.addPage();
    startY = 20;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 80, 200);
  doc.text(title, margin, startY);
  startY += 6;

  doc.setDrawColor(30, 80, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, startY, margin + usable, startY);
  startY += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);

  const lines = doc.splitTextToSize(content, usable);
  for (const line of lines) {
    if (startY > 270) {
      doc.addPage();
      startY = 20;
    }
    doc.text(line, margin, startY);
    startY += 5;
  }

  return startY + 6;
}

export async function generatePdf(data: PdfData): Promise<void> {
  const { default: JsPdf } = await import("jspdf");
  const doc = new JsPdf({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const usable = pageW - margin * 2;

  // --- HEADER BAND ---
  doc.setFillColor(25, 65, 185);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("ChargebackPilot", margin, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("KI-Strukturierung & Textvorlagen", margin, 19);

  const dateStr = data.generatedAt ?? new Date().toLocaleDateString("de-DE");
  doc.text(`Erstellt am: ${dateStr}`, pageW - margin, 19, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(180, 200, 255);
  doc.text(
    "Keine Rechtsberatung. Textentwürfe vor Verwendung eigenständig prüfen.",
    margin,
    25,
  );

  // --- CASE OVERVIEW BOX ---
  let y = 38;
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(margin, y, usable, 32, 3, 3, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 65, 185);
  doc.text("Fallübersicht", margin + 4, y + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  const col1x = margin + 4;
  const col2x = margin + usable / 2 + 4;
  const lineH = 5.5;

  doc.text(`Händler: ${data.merchantName}`, col1x, y + 15);
  doc.text(`Betrag: ${data.amount.toFixed(2)} EUR`, col1x, y + 15 + lineH);
  doc.text(`Datum: ${data.paymentDate}`, col1x, y + 15 + lineH * 2);

  doc.text(
    `Zahlungsart: ${PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod}`,
    col2x,
    y + 15,
  );
  doc.text(
    `Problemtyp: ${PROBLEM_LABELS[data.problemType] ?? data.problemType}`,
    col2x,
    y + 15 + lineH,
  );
  doc.text(`Strategie-Einschätzung (indikativ): ${data.successProbabilityLabel}`, col2x, y + 15 + lineH * 2);

  y += 40;

  // --- QUALITATIVE STRATEGY INDICATOR (no raw %) ---
  const bandLabel = (data.successProbabilityLabel ?? "").toLowerCase();
  const band =
    bandLabel === "hoch"
      ? { name: "Aussichtsreich", dots: 3, color: [16, 185, 129] }
      : bandLabel === "mittel"
        ? { name: "Solide Ausgangslage", dots: 2, color: [245, 158, 11] }
        : { name: "Anspruchsvoll", dots: 1, color: [244, 63, 94] };

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(`Strategie-Einschaetzung (indikativ): ${band.name}`, margin, y);
  y += 4;

  // 3-dot qualitative scale
  const dotW = 28;
  const dotGap = 4;
  for (let i = 0; i < 3; i++) {
    if (i < band.dots) {
      doc.setFillColor(band.color[0], band.color[1], band.color[2]);
    } else {
      doc.setFillColor(220, 220, 230);
    }
    doc.roundedRect(margin + i * (dotW + dotGap), y, dotW, 4, 2, 2, "F");
  }
  y += 8;

  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 130);
  doc.text("Indikative KI-Einschaetzung. Keine Garantie auf den Verfahrensausgang.", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  y += 6;

  // --- SUMMARY ---
  y = addSection(doc, "Fallzusammenfassung", data.summary, y, pageW, margin);

  // --- NEXT STEPS ---
  if (data.nextSteps.length > 0) {
    const stepsText = data.nextSteps
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");
    y = addSection(doc, "Empfohlene naechste Schritte", stepsText, y, pageW, margin);
  }

  // --- TEMPLATES ---
  y = addSection(
    doc,
    "Vorlage 1: Anschreiben an den Haendler",
    data.merchantTemplate,
    y,
    pageW,
    margin,
  );
  y = addSection(
    doc,
    "Vorlage 2: Chargeback-Antrag (Bank / PayPal / Klarna)",
    data.bankTemplate,
    y,
    pageW,
    margin,
  );
  y = addSection(
    doc,
    "Vorlage 3: Eskalationsschreiben",
    data.escalationTemplate,
    y,
    pageW,
    margin,
  );

  // --- FOOTER on each page ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(
      "ChargebackPilot.de — Keine Rechtsberatung. Vorlagen eigenverantwortlich prüfen und anpassen.",
      margin,
      290,
    );
    doc.text(`Seite ${i} / ${totalPages}`, pageW - margin, 290, {
      align: "right",
    });
  }

  const filename = `ChargebackPilot_${data.merchantName.replace(/\s+/g, "_")}_${data.paymentDate}.pdf`;
  doc.save(filename);
}
