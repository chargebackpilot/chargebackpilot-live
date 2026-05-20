import jsPDF from "jspdf";

export interface LetterInput {
  sender: {
    name: string;
    street: string;
    zipCity: string;
    email?: string;
    phone?: string;
  };
  recipient: {
    company: string;
    addressLine1?: string;
    addressLine2?: string;
    zipCity?: string;
  };
  subject: string;
  body: string;
  reference?: string;
  orderNumber?: string;
  customerNumber?: string;
  invoiceNumber?: string;
  transactionId?: string;
  amount?: number;
  paymentDate?: string;
  closing?: string;
  city?: string;
  date?: string;
  filenameHint?: string;
}

const M_LEFT = 25;
const M_RIGHT = 20;
const M_TOP = 16.9;
const ADDR_FIELD_Y = 45;
const REF_FIELD_Y = 98.5;
const SUBJECT_Y = 113;
const BODY_START_Y = 127;
const FONT = "helvetica";

function fmtDate(input?: string): string {
  if (!input) return new Date().toLocaleDateString("de-DE");
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return new Date().toLocaleDateString("de-DE");
    return d.toLocaleDateString("de-DE");
  } catch {
    return new Date().toLocaleDateString("de-DE");
  }
}

export function generateLetterPdf(input: LetterInput): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const usable = pageW - M_LEFT - M_RIGHT;

  doc.setFont(FONT, "normal");
  doc.setTextColor(20, 20, 20);

  // --- Absender (oben rechts, klein) ---
  doc.setFontSize(8);
  const senderLines = [
    input.sender.name,
    input.sender.street,
    input.sender.zipCity,
    input.sender.email,
    input.sender.phone,
  ].filter(Boolean) as string[];
  let sy = M_TOP;
  senderLines.forEach((l) => {
    doc.text(l, pageW - M_RIGHT, sy, { align: "right" });
    sy += 4;
  });

  // --- Absender-Kompaktzeile über Anschrift (DIN 5008) ---
  doc.setFontSize(8);
  doc.text(
    [input.sender.name, input.sender.street, input.sender.zipCity].filter(Boolean).join(" · "),
    M_LEFT,
    ADDR_FIELD_Y - 3,
  );
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(M_LEFT, ADDR_FIELD_Y - 1, M_LEFT + 85, ADDR_FIELD_Y - 1);

  // --- Empfänger-Anschrift ---
  doc.setFontSize(11);
  doc.setFont(FONT, "normal");
  let ay = ADDR_FIELD_Y + 4;
  const recipientLines = [
    input.recipient.company,
    input.recipient.addressLine1,
    input.recipient.addressLine2,
    input.recipient.zipCity,
  ].filter(Boolean) as string[];
  recipientLines.forEach((l) => {
    doc.text(l, M_LEFT, ay);
    ay += 5;
  });

  // --- Ort, Datum (rechtsbündig auf Höhe Bezugszeichen) ---
  doc.setFontSize(10);
  const cityDate = `${input.city ?? "Ort"}, den ${fmtDate(input.date)}`;
  doc.text(cityDate, pageW - M_RIGHT, REF_FIELD_Y - 5, { align: "right" });

  // --- Bezugszeichenzeile ---
  const refs: string[] = [];
  if (input.orderNumber) refs.push(`Bestell-Nr.: ${input.orderNumber}`);
  if (input.customerNumber) refs.push(`Kunden-Nr.: ${input.customerNumber}`);
  if (input.invoiceNumber) refs.push(`Rechnungs-Nr.: ${input.invoiceNumber}`);
  if (input.transactionId) refs.push(`Transaktions-ID: ${input.transactionId}`);

  if (refs.length > 0) {
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const refLines = doc.splitTextToSize(refs.join("   ·   "), usable);
    doc.text(refLines, M_LEFT, REF_FIELD_Y);
  }

  // --- Betreff (fett) ---
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.setFont(FONT, "bold");
  const subjectLines = doc.splitTextToSize(input.subject, usable);
  doc.text(subjectLines, M_LEFT, SUBJECT_Y);

  // --- Hauptteil ---
  doc.setFontSize(11);
  doc.setFont(FONT, "normal");

  let y = BODY_START_Y;
  const lineH = 5.5;

  doc.text("Sehr geehrte Damen und Herren,", M_LEFT, y);
  y += lineH * 2;

  // body paragraphs
  const paragraphs = input.body.split(/\n{2,}/);
  paragraphs.forEach((p, idx) => {
    const cleaned = p.replace(/\n/g, " ").trim();
    if (!cleaned) return;
    const lines = doc.splitTextToSize(cleaned, usable);
    for (const line of lines) {
      if (y > pageH - 35) {
        doc.addPage();
        y = M_TOP + 5;
      }
      doc.text(line, M_LEFT, y);
      y += lineH;
    }
    if (idx < paragraphs.length - 1) y += lineH * 0.7;
  });

  // optional facts box
  if (input.amount !== undefined || input.paymentDate) {
    y += lineH;
    if (y > pageH - 40) {
      doc.addPage();
      y = M_TOP + 5;
    }
    const facts: string[] = [];
    if (input.amount !== undefined) facts.push(`Strittiger Betrag: ${input.amount.toFixed(2)} EUR`);
    if (input.paymentDate) facts.push(`Zahlungsdatum: ${fmtDate(input.paymentDate)}`);
    if (input.transactionId) facts.push(`Transaktions-ID: ${input.transactionId}`);
    doc.setFont(FONT, "bold");
    doc.text("Zusammenfassung der relevanten Daten:", M_LEFT, y);
    y += lineH;
    doc.setFont(FONT, "normal");
    facts.forEach((f) => {
      doc.text("• " + f, M_LEFT + 2, y);
      y += lineH;
    });
  }

  // --- Schlussformel + Unterschrift ---
  y += lineH * 1.5;
  if (y > pageH - 35) {
    doc.addPage();
    y = M_TOP + 5;
  }
  doc.text(input.closing ?? "Mit freundlichen Grüßen", M_LEFT, y);
  y += lineH * 4;
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.2);
  doc.line(M_LEFT, y, M_LEFT + 60, y);
  y += 4;
  doc.setFontSize(10);
  doc.text(input.sender.name, M_LEFT, y);

  // --- Footer Hinweis (auf jeder Seite) ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont(FONT, "normal");
    doc.text(
      "Erstellt mit ChargebackPilot.de — Formulierungshilfe, keine Rechtsberatung. Vor Versand prüfen.",
      M_LEFT,
      pageH - 8,
    );
    doc.text(`Seite ${i} / ${totalPages}`, pageW - M_RIGHT, pageH - 8, { align: "right" });
  }

  const safeName = (input.filenameHint ?? input.recipient.company).replace(/[^a-zA-Z0-9_-]+/g, "_");
  doc.save(`Anschreiben_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
