import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateCase } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { PaywallModal } from "@/components/PaywallModal";
import { PaypalGuide } from "@/components/PaypalGuide";
import { generatePdf } from "@/lib/pdf-generator";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Shield,
  Scale,
  Clock,
  ChevronRight,
  Siren,
  TrendingUp,
  FileText,
  Building2,
  Landmark,
  UtensilsCrossed,
  Plane,
  Package,
  Repeat2,
  RefreshCcw,
  Check,
  Loader2,
  X,
  ShieldCheck,
  Users,
  MessageSquare,
  Receipt,
  Camera,
  Mail,
  Truck,
  FileX,
  BadgeAlert,
  Download,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAYMENT_METHODS = [
  { id: "paypal", label: "PayPal" },
  { id: "visa_mastercard", label: "Kreditkarte Visa/Mastercard" },
  { id: "amex", label: "American Express" },
  { id: "klarna", label: "Klarna" },
  { id: "apple_google_pay", label: "Apple Pay / Google Pay" },
  { id: "bank_transfer", label: "Banküberweisung" },
  { id: "other", label: "Sonstiges" },
];

const PROBLEM_TYPES = [
  { id: "not_received", label: "Ware nicht erhalten", icon: Package },
  { id: "defective", label: "Ware defekt / anders als beschrieben", icon: X },
  { id: "service_not_rendered", label: "Dienstleistung nicht erbracht", icon: Building2 },
  { id: "flight_travel", label: "Flug / Reise / Hotel Problem", icon: Plane },
  { id: "subscription", label: "Abo / ungewollte Abbuchung", icon: Repeat2 },
  { id: "fraud", label: "Betrug / Scam Verdacht", icon: AlertTriangle },
  { id: "food_delivery", label: "Lieferdienst / Essen unbrauchbar", icon: UtensilsCrossed },
  { id: "refund_promised", label: "Rückerstattung zugesagt aber nicht erhalten", icon: RefreshCcw },
  { id: "other", label: "Sonstiges", icon: ChevronRight },
];

const KNOWN_MERCHANTS: Record<string, Array<{ name: string; emoji: string }>> = {
  food_delivery: [
    { name: "Lieferando", emoji: "🍕" },
    { name: "Wolt", emoji: "🍔" },
    { name: "UberEats", emoji: "🌮" },
    { name: "Gorillas", emoji: "🛒" },
    { name: "Flink", emoji: "⚡" },
    { name: "HelloFresh", emoji: "🥗" },
  ],
  flight_travel: [
    { name: "Ryanair", emoji: "✈️" },
    { name: "Easyjet", emoji: "🛫" },
    { name: "Condor", emoji: "🌍" },
    { name: "TUI Fly", emoji: "🏖️" },
    { name: "Booking.com", emoji: "🏨" },
    { name: "Airbnb", emoji: "🏠" },
    { name: "Hotels.com", emoji: "🛎️" },
    { name: "Expedia", emoji: "🗺️" },
  ],
  not_received: [
    { name: "Amazon", emoji: "📦" },
    { name: "Temu", emoji: "🛍️" },
    { name: "SHEIN", emoji: "👗" },
    { name: "Aliexpress", emoji: "🚢" },
    { name: "Zalando", emoji: "👟" },
    { name: "Otto", emoji: "🏡" },
    { name: "eBay", emoji: "🔖" },
    { name: "Wish", emoji: "⭐" },
  ],
  defective: [
    { name: "Amazon", emoji: "📦" },
    { name: "MediaMarkt", emoji: "📺" },
    { name: "Saturn", emoji: "💻" },
    { name: "Zalando", emoji: "👟" },
    { name: "IKEA", emoji: "🪑" },
    { name: "Apple Store", emoji: "🍎" },
  ],
  subscription: [
    { name: "Netflix", emoji: "🎬" },
    { name: "Spotify", emoji: "🎵" },
    { name: "Amazon Prime", emoji: "⭐" },
    { name: "Adobe", emoji: "🎨" },
    { name: "LinkedIn", emoji: "💼" },
    { name: "Apple", emoji: "🍎" },
    { name: "Google", emoji: "🔍" },
    { name: "Disney+", emoji: "🏰" },
  ],
  refund_promised: [
    { name: "Amazon", emoji: "📦" },
    { name: "Zalando", emoji: "👟" },
    { name: "Booking.com", emoji: "🏨" },
    { name: "Airbnb", emoji: "🏠" },
    { name: "Eventim", emoji: "🎟️" },
    { name: "Ticketmaster", emoji: "🎪" },
  ],
  service_not_rendered: [
    { name: "Udemy", emoji: "📚" },
    { name: "Fiverr", emoji: "💻" },
    { name: "Booking.com", emoji: "🏨" },
    { name: "Groupon", emoji: "🏷️" },
    { name: "Eventim", emoji: "🎟️" },
    { name: "Skillshare", emoji: "🎯" },
  ],
  fraud: [
    { name: "Unbekannter Händler", emoji: "❓" },
    { name: "Phishing-Shop", emoji: "🎣" },
    { name: "Online-Marktplatz", emoji: "🛒" },
    { name: "Kleinanzeigen", emoji: "📋" },
  ],
};

// ---------------------------------------------------------------------------
// Merchant response options
// ---------------------------------------------------------------------------

const MERCHANT_RESPONSE_OPTIONS = [
  { id: "keine_antwort", label: "Keine Antwort erhalten", sub: "Händler reagiert nicht auf Kontaktaufnahme" },
  { id: "abgelehnt", label: "Händler hat abgelehnt", sub: "Erstattung wurde verweigert" },
  { id: "versprach_rueckerstattung", label: "Erstattung versprochen — aber nicht gezahlt", sub: "Händler sagte Rückzahlung zu, nichts kam" },
  { id: "teilerstattung", label: "Nur Teilerstattung angeboten", sub: "Händler zahlt weniger als der strittige Betrag" },
  { id: "sonstiges", label: "Sonstiges", sub: "Andere Reaktion" },
];

// ---------------------------------------------------------------------------
// Evidence groups
// ---------------------------------------------------------------------------

const EVIDENCE_GROUPS = [
  {
    label: "Zahlungsnachweise",
    icon: Receipt,
    items: [
      { id: "receipt", label: "Zahlungsnachweis", hint: "Kontoauszug / Screenshot" },
      { id: "order_confirmation", label: "Bestellbestätigung", hint: "E-Mail oder PDF" },
    ],
  },
  {
    label: "Kommunikation",
    icon: Mail,
    items: [
      { id: "email_thread", label: "E-Mail-Verlauf", hint: "Schriftlicher Kontakt mit Händler" },
      { id: "chat_screenshot", label: "Chat-Screenshots", hint: "WhatsApp, Support-Chat" },
      { id: "cancellation", label: "Stornierungsbestätigung", hint: "E-Mail vom Händler" },
      { id: "refund_promise", label: "Schriftliche Erstattungszusage", hint: "Screenshot, E-Mail" },
    ],
  },
  {
    label: "Produktnachweise",
    icon: Camera,
    items: [
      { id: "photos", label: "Fotos / Videos", hint: "Defekte Ware, Mangel" },
      { id: "tracking", label: "Tracking-Nachweis", hint: "Sendungsverfolgung" },
      { id: "tos", label: "AGB / Angebots-Screenshots", hint: "Was wurde versprochen" },
    ],
  },
  {
    label: "Keine Beweise",
    icon: FileX,
    items: [
      { id: "none", label: "Keine Beweise vorhanden", hint: "KI analysiert trotzdem die Rechtslage" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Structured questions per problem type
// ---------------------------------------------------------------------------

type QuestionType = "textarea" | "radio" | "date" | "number" | "multiselect";

interface QuestionOption { value: string; label: string }

interface Question {
  id: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  options?: QuestionOption[];
  rows?: number;
  required?: boolean;
  suffix?: string;
}

const STRUCTURED_QUESTIONS: Record<string, Question[]> = {
  not_received: [
    {
      id: "expected_delivery",
      label: "Wann wäre die Lieferung fällig gewesen?",
      type: "date",
      required: true,
    },
    {
      id: "tracking_status",
      label: "Was sagt das Tracking?",
      type: "radio",
      required: true,
      options: [
        { value: "Kein Tracking vorhanden", label: "Kein Tracking vorhanden" },
        { value: "Seit Wochen ohne Update", label: "Seit Wochen ohne Update" },
        { value: "Als zugestellt markiert – nicht erhalten", label: "Als zugestellt markiert, aber nicht erhalten" },
        { value: "Paket zurück an Händler gegangen", label: "Paket zurück an Händler gegangen" },
      ],
    },
    {
      id: "complaint_timing",
      label: "Wann hast du beim Händler reklamiert?",
      type: "radio",
      options: [
        { value: "innerhalb 1 Woche", label: "Innerhalb 1 Woche" },
        { value: "1–4 Wochen danach", label: "1–4 Wochen danach" },
        { value: "erst nach 4+ Wochen", label: "Erst nach 4+ Wochen" },
        { value: "noch nicht", label: "Noch gar nicht" },
      ],
    },
  ],
  food_delivery: [
    {
      id: "food_problem",
      label: "Was war das Problem mit der Lieferung?",
      type: "multiselect",
      required: true,
      options: [
        { value: "Falsche Ware geliefert", label: "Falsche Ware geliefert" },
        { value: "Artikel fehlte", label: "Artikel fehlte" },
        { value: "Ware ungenießbar / verdorben", label: "Ungenießbar / verdorben" },
        { value: "Viel zu spät geliefert", label: "Viel zu spät" },
        { value: "Bestellung komplett ausgeblieben", label: "Komplett ausgeblieben" },
      ],
    },
    {
      id: "app_complaint",
      label: "Hast du in der App / beim Lieferdienst reklamiert?",
      type: "radio",
      options: [
        { value: "Ja – Erstattung abgelehnt", label: "Ja – abgelehnt" },
        { value: "Ja – keine Reaktion erhalten", label: "Ja – keine Reaktion" },
        { value: "Ja – nur Gutschein angeboten", label: "Ja – nur Gutschein" },
        { value: "Nein, noch nicht", label: "Nein, noch nicht" },
      ],
    },
    {
      id: "order_details",
      label: "Weitere Angaben (optional)",
      type: "textarea",
      placeholder: "z.B. Uhrzeit der Bestellung, konkretes fehlendes Gericht, Fotos vorhanden...",
      rows: 2,
    },
  ],
  flight_travel: [
    {
      id: "who_cancelled",
      label: "Wer hat storniert?",
      type: "radio",
      required: true,
      options: [
        { value: "Die Airline / der Reiseanbieter hat storniert", label: "Airline / Anbieter hat storniert" },
        { value: "Ich musste stornieren (höhere Gewalt / außerordentlich)", label: "Ich – höhere Gewalt" },
        { value: "Ich habe freiwillig storniert", label: "Ich – freiwillig" },
      ],
    },
    {
      id: "cancellation_reason",
      label: "Grund der Stornierung",
      type: "textarea",
      placeholder: "z.B. Flug wurde gestrichen, Hotel geschlossen, Streik, Krankheit...",
      rows: 2,
    },
    {
      id: "what_not_refunded",
      label: "Was wurde nicht erstattet?",
      type: "multiselect",
      options: [
        { value: "Flugticket", label: "Flugticket" },
        { value: "Steuern & Gebühren", label: "Steuern & Gebühren" },
        { value: "Hotelbuchung", label: "Hotelbuchung" },
        { value: "Pauschalreise", label: "Pauschalreise" },
        { value: "Gepäck / Extras", label: "Gepäck / Extras" },
      ],
    },
  ],
  subscription: [
    {
      id: "cancellation_date",
      label: "Wann hast du das Abo gekündigt?",
      type: "date",
      required: true,
    },
    {
      id: "cancellation_method",
      label: "Wie hast du gekündigt?",
      type: "radio",
      options: [
        { value: "In der App / Website", label: "In der App / Website" },
        { value: "Per E-Mail", label: "Per E-Mail" },
        { value: "Per Brief", label: "Per Brief" },
        { value: "Telefonisch", label: "Telefonisch" },
      ],
    },
    {
      id: "confirmation_received",
      label: "Kündigungsbestätigung erhalten?",
      type: "radio",
      options: [
        { value: "Ja, Bestätigung liegt vor", label: "Ja" },
        { value: "Nein, keine Bestätigung erhalten", label: "Nein" },
      ],
    },
    {
      id: "months_charged",
      label: "Wie viele Monate wurden nach der Kündigung noch abgebucht?",
      type: "number",
      suffix: "Monat(e)",
    },
  ],
  defective: [
    {
      id: "defect_description",
      label: "Was genau war defekt oder anders als beschrieben?",
      type: "textarea",
      placeholder: "z.B. Akku lädt nicht, Farbe völlig anders, falsche Größe, Funktionen fehlen...",
      rows: 2,
      required: true,
    },
    {
      id: "defect_timing",
      label: "Wann hast du den Mangel bemerkt?",
      type: "radio",
      options: [
        { value: "Sofort bei Lieferung / Auspacken", label: "Sofort bei Lieferung" },
        { value: "Innerhalb der ersten Woche", label: "Innerhalb 1 Woche" },
        { value: "Nach mehr als einer Woche", label: "Nach mehr als 1 Woche" },
      ],
    },
    {
      id: "has_photos",
      label: "Fotos oder Videos vom Mangel vorhanden?",
      type: "radio",
      options: [
        { value: "Ja, Fotos / Videos vorhanden", label: "Ja" },
        { value: "Nein, keine Fotos vorhanden", label: "Nein" },
      ],
    },
  ],
  refund_promised: [
    {
      id: "promise_date",
      label: "Wann wurde die Erstattung zugesagt?",
      type: "date",
      required: true,
    },
    {
      id: "promise_channel",
      label: "Wie wurde die Zusage gemacht?",
      type: "radio",
      options: [
        { value: "Per E-Mail (schriftlich)", label: "Per E-Mail (schriftlich)" },
        { value: "Im Support-Chat", label: "Im Support-Chat" },
        { value: "Telefonisch", label: "Telefonisch" },
        { value: "Automatisch / System-E-Mail", label: "Automatisch / System-Bestätigung" },
      ],
    },
    {
      id: "expected_by",
      label: "Bis wann sollte die Erstattung kommen?",
      type: "textarea",
      placeholder: 'z.B. "innerhalb 5–7 Werktage", "innerhalb 14 Tage", kein konkretes Datum genannt...',
      rows: 1,
    },
  ],
  fraud: [
    {
      id: "fraud_discovery",
      label: "Wie hast du den Betrug entdeckt?",
      type: "textarea",
      placeholder: "z.B. Fake-Shop, nie geliefertes Produkt, Phishing-Mail, gefälschte Website...",
      rows: 2,
      required: true,
    },
    {
      id: "fraud_timing",
      label: "Wann hast du gemerkt, dass es Betrug ist?",
      type: "radio",
      options: [
        { value: "Sofort / innerhalb 1 Woche", label: "Sofort / innerhalb 1 Woche" },
        { value: "Nach 2–4 Wochen", label: "Nach 2–4 Wochen" },
        { value: "Nach mehreren Monaten", label: "Nach mehreren Monaten" },
      ],
    },
    {
      id: "reported_to_police",
      label: "Hast du Anzeige erstattet?",
      type: "radio",
      options: [
        { value: "Ja, Anzeige wurde erstattet", label: "Ja" },
        { value: "Nein, noch keine Anzeige", label: "Nein" },
      ],
    },
  ],
  service_not_rendered: [
    {
      id: "service_description",
      label: "Welche Dienstleistung wurde nicht erbracht?",
      type: "textarea",
      placeholder: "z.B. Online-Kurs nie freigeschaltet, Reparatur nicht durchgeführt, Termin nicht eingehalten...",
      rows: 2,
      required: true,
    },
    {
      id: "service_date",
      label: "Wann sollte die Leistung erbracht werden?",
      type: "date",
    },
    {
      id: "partial_service",
      label: "Wurde etwas davon teilweise erbracht?",
      type: "radio",
      options: [
        { value: "Nein, gar nichts wurde erbracht", label: "Nein, gar nichts" },
        { value: "Ja, teilweise erbracht", label: "Ja, teilweise" },
      ],
    },
  ],
  other: [
    {
      id: "what_agreed",
      label: "Was wurde vereinbart oder gekauft?",
      type: "textarea",
      placeholder: "Was hast du bestellt / gebucht und was wurde dir versprochen?",
      rows: 2,
      required: true,
    },
    {
      id: "what_happened",
      label: "Was ist stattdessen passiert?",
      type: "textarea",
      placeholder: "Was fehlt, was ist falsch, was wurde nicht eingehalten?",
      rows: 2,
      required: true,
    },
    {
      id: "additional",
      label: "Weitere relevante Details (optional)",
      type: "textarea",
      placeholder: "Fristen, besondere Umstände, wichtige Kommunikation...",
      rows: 2,
    },
  ],
};

const STEP_TITLES = ["Zahlungsart", "Problemtyp", "Händlerdetails", "Beweislage", "Falldetails"];

const LOADING_STEPS = [
  "Falldetails & Beweislage auswerten",
  "Rechtslage & Fristen prüfen",
  "Professionelle Textvorlagen generieren",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDescription(
  structuredAnswers: Record<string, string>,
  problemType: string,
  purchaseAmount: string,
  disputedAmount: string,
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
      `Kaufbetrag gesamt: ${purchaseAmount} EUR — streitiger Betrag: ${disputedAmount} EUR (${pct}% des Kaufbetrags)`,
    );
  }

  return parts.join("\n\n");
}

function buildMerchantResponse(responseType: string, responseNote: string): string {
  const label =
    MERCHANT_RESPONSE_OPTIONS.find((o) => o.id === responseType)?.label ?? "";
  if (!label) return "";
  return responseNote.trim() ? `${label}: ${responseNote.trim()}` : label;
}

function getDisputedPercent(purchase: string, disputed: string): number | null {
  const p = parseFloat(purchase);
  const d = parseFloat(disputed);
  if (!p || !d || d > p) return null;
  return Math.round((d / p) * 100);
}

// ---------------------------------------------------------------------------
// Sub-components (unchanged)
// ---------------------------------------------------------------------------

function AnalysisLoader({ merchantName }: { merchantName: string }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setCompletedSteps([0]), 7000);
    const t2 = setTimeout(() => setCompletedSteps([0, 1]), 15000);
    const t3 = setTimeout(() => {
      setCompletedSteps([0, 1, 2]);
      setTimeout(() => setAllDone(true), 600);
    }, 23000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="py-12 text-center flex flex-col items-center gap-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">Unsere KI analysiert deinen Fall</h2>
        <p className="text-muted-foreground text-sm">
          {merchantName ? `Fall gegen ${merchantName} wird geprüft...` : "KI-Analyse läuft..."}
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {LOADING_STEPS.map((label, i) => {
          const done = completedSteps.includes(i);
          const active = !done && (i === 0 || completedSteps.includes(i - 1));
          return (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${done ? "text-foreground" : active ? "text-muted-foreground" : "text-muted-foreground/40"}`}
            >
              <div className="relative w-6 h-6 flex-shrink-0">
                {done ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in-50 duration-400">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                ) : active ? (
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted" />
                )}
              </div>
              <span className={`font-medium transition-all duration-300 ${done ? "line-through text-muted-foreground" : ""}`}>
                {done ? <span className="no-underline font-semibold text-emerald-700">{label}</span> : label}
              </span>
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-center gap-2 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          Analyse abgeschlossen — Ergebnisse laden...
        </div>
      )}
    </div>
  );
}

function ProbabilityGauge({ probability, label }: { probability: number; label: string }) {
  const color =
    probability >= 65
      ? { ring: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" }
      : probability >= 40
        ? { ring: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" }
        : { ring: "text-red-500", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" };

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (probability / 100) * circumference;

  return (
    <div className={`rounded-2xl border-2 ${color.border} ${color.bg} p-6 sm:p-8`}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-black/10" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className={`${color.ring} transition-all duration-1000`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black ${color.text}`}>{probability}%</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score</span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Erfolgswahrscheinlichkeit</p>
          <h3 className={`text-2xl font-black ${color.text} mb-2`}>{label}</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {probability >= 65
              ? "Gute Ausgangslage. Mit den richtigen Schritten haben Sie gute Chancen auf Rückerstattung."
              : probability >= 40
                ? "Mittlere Ausgangslage. Fehlende Belege können die Chancen noch deutlich verbessern."
                : "Schwieriger Fall. Zuerst fehlende Beweise sichern, dann den Chargeback einleiten."}
          </p>
        </div>
      </div>
    </div>
  );
}

function CopyableTemplate({ title, icon, text, onCopy }: { title: string; icon: React.ReactNode; text: string; onCopy: () => void }) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div className="bg-muted/60 px-4 py-3 border-b flex justify-between items-center">
        <span className="font-semibold text-sm flex items-center gap-2">{icon}{title}</span>
        <Button size="sm" variant="outline" className="h-8 gap-2 text-xs cursor-pointer" onClick={onCopy}>
          <Copy className="w-3.5 h-3.5" />Kopieren
        </Button>
      </div>
      <div className="p-4 sm:p-5 bg-background whitespace-pre-wrap text-sm font-mono leading-relaxed max-h-80 overflow-y-auto">
        {text}
      </div>
    </div>
  );
}

function MerchantQuickSelect({ problemType, onSelect, selected }: { problemType: string; onSelect: (name: string) => void; selected: string }) {
  const options = KNOWN_MERCHANTS[problemType];
  if (!options || options.length === 0) return null;
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">✓</span>
        Bekannte Anbieter — schnell auswählen:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((m) => (
          <button
            key={m.name}
            type="button"
            onClick={() => onSelect(m.name)}
            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/40 active:scale-[0.98] ${selected === m.name ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card"}`}
          >
            <span className="text-xl leading-none flex-shrink-0">{m.emoji}</span>
            <span className="font-semibold text-sm truncate">{m.name}</span>
            {selected === m.name && <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Nicht dabei? Trage den Namen manuell unten ein.</p>
    </div>
  );
}

function Paywall({ onUnlock, isPaying }: { onUnlock: () => void; isPaying: boolean }) {
  return (
    <div className="absolute inset-0 z-10 rounded-2xl flex items-center justify-center p-4">
      <div className="text-center">
        <Button size="lg" className="text-base h-12 shadow-lg gap-2" onClick={onUnlock} disabled={isPaying}>
          {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Für 0,99 € freischalten"}
        </Button>
        <div className="text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1.5 mt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Inkl. Erfolgsgarantie: Geld zurück bei Ablehnung.
        </div>
      </div>
    </div>
  );
}

function ContentLocker({ hasUnlocked, onUnlock, isPaying, children }: { hasUnlocked: boolean; onUnlock: () => void; isPaying: boolean; children: React.ReactNode }) {
  if (hasUnlocked) return <>{children}</>;
  return (
    <div className="relative">
      <div className="blur-[3px]">{children}</div>
      <Paywall onUnlock={onUnlock} isPaying={isPaying} />
    </div>
  );
}

function SocialProof({ merchantName }: { merchantName?: string }) {
  const [userCount] = useState(Math.floor(Math.random() * (150 - 20 + 1)) + 20);
  return (
    <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Users className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-primary">Du bist nicht allein</p>
        <p className="text-muted-foreground text-xs">
          Bereits {userCount} Nutzer haben erfolgreich einen Fall {merchantName ? `gegen ${merchantName} ` : ""}gestartet.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Structured question renderer
// ---------------------------------------------------------------------------

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (val: string) => void;
}) {
  if (question.type === "radio") {
    return (
      <div className="space-y-2">
        {question.options?.map((opt) => (
          <div
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-3 border-2 px-4 py-3 rounded-xl cursor-pointer transition-all select-none ${value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${value === opt.value ? "border-primary" : "border-muted-foreground/40"}`}>
              {value === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <span className="text-sm font-medium">{opt.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "multiselect") {
    const selected = value ? value.split("; ") : [];
    const toggle = (label: string) => {
      const next = selected.includes(label) ? selected.filter((s) => s !== label) : [...selected, label];
      onChange(next.join("; "));
    };
    return (
      <div className="flex flex-wrap gap-2">
        {question.options?.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer select-none ${active ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
            >
              {active && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "textarea") {
    return (
      <Textarea
        rows={question.rows ?? 2}
        placeholder={question.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="resize-none text-sm"
      />
    );
  }

  if (question.type === "date") {
    return (
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-xs"
      />
    );
  }

  if (question.type === "number") {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          max="99"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24"
          placeholder="0"
        />
        {question.suffix && <span className="text-sm text-muted-foreground">{question.suffix}</span>}
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main Wizard
// ---------------------------------------------------------------------------

import { ErrorBoundary } from "@/components/ErrorBoundary";

interface FormData {
  paymentMethod: string;
  problemType: string;
  merchantName: string;
  purchaseAmount: string;
  disputedAmount: string;
  paymentDate: string;
  merchantCountry: string;
  merchantContacted: boolean;
  merchantResponseType: string;
  merchantResponseNote: string;
  evidence: string[];
  structuredAnswers: Record<string, string>;
}

export default function Wizard() {
  const params = new URLSearchParams(window.location.search);
  const prefilledProblem = params.get("problem") ?? "";
  const paymentSuccess = params.get("payment_success") === "1";

  const [step, setStep] = useState(prefilledProblem ? 2 : 1);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState(paymentSuccess);
  const [isPaying, setIsPaying] = useState(false);
  const paywallRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState<FormData>({
    paymentMethod: "",
    problemType: prefilledProblem,
    merchantName: "",
    purchaseAmount: "",
    disputedAmount: "",
    paymentDate: "",
    merchantCountry: "",
    merchantContacted: false,
    merchantResponseType: "",
    merchantResponseNote: "",
    evidence: [],
    structuredAnswers: {},
  });

  const createCase = useCreateCase();
  const [result, setResult] = useState<ReturnType<typeof useCreateCase>["data"]>(undefined);
  const { toast } = useToast();

  const setAnswer = (id: string, val: string) =>
    setFormData((prev) => ({ ...prev, structuredAnswers: { ...prev.structuredAnswers, [id]: val } }));

  const handleNext = () => { if (step < 6) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = () => {
    if (createCase.isPending) return;
    const description = buildDescription(
      formData.structuredAnswers,
      formData.problemType,
      formData.purchaseAmount,
      formData.disputedAmount,
    );
    const merchantResponse = buildMerchantResponse(
      formData.merchantResponseType,
      formData.merchantResponseNote,
    );
    setStep(6);
    createCase.mutate(
      {
        data: {
          paymentMethod: formData.paymentMethod || "other",
          problemType: formData.problemType || "other",
          merchantName: formData.merchantName || "Unbekannter Händler",
          amount: Number(formData.disputedAmount) || Number(formData.purchaseAmount) || 0,
          paymentDate: formData.paymentDate || new Date().toISOString().split("T")[0],
          merchantCountry: formData.merchantCountry || undefined,
          merchantContacted: formData.merchantContacted,
          merchantResponse: merchantResponse || undefined,
          evidence: formData.evidence || [],
          description: description || "Keine Beschreibung",
        },
      },
      {
        onSuccess: (data) => setResult(data),
        onError: () => {
          toast({ title: "Analyse fehlgeschlagen", description: "Bitte versuche es erneut.", variant: "destructive" });
          setStep(5);
        },
      },
    );
  };

  const toggleEvidence = (id: string) => {
    if (id === "none") {
      setFormData((prev) => ({ ...prev, evidence: ["none"] }));
      return;
    }
    const filtered = formData.evidence.filter((e) => e !== "none");
    const next = filtered.includes(id) ? filtered.filter((e) => e !== id) : [...filtered, id];
    setFormData((prev) => ({ ...prev, evidence: next }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopiert", description: `${label} in Zwischenablage.` });
  };

  const resetForm = () => {
    setStep(1);
    setResult(undefined);
    createCase.reset();
    setHasUnlocked(false);
    setIsPaying(false);
    setFormData({
      paymentMethod: "", problemType: "", merchantName: "",
      purchaseAmount: "", disputedAmount: "", paymentDate: "",
      merchantCountry: "", merchantContacted: false,
      merchantResponseType: "", merchantResponseNote: "",
      evidence: [], structuredAnswers: {},
    });
    window.history.replaceState({}, "", "/fall-pruefen");
  };

  const isPaypalCase = (result?.paymentMethod === "paypal" || formData.paymentMethod === "paypal");
  const scrollToPaywall = () => {
    if (paywallRef.current) {
      paywallRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setHasUnlocked(true);
      toast({ title: "Freigeschaltet!", description: "Alle Vorlagen und Anleitungen sind jetzt verfügbar." });
    }, 1500);
  };

  const handleDownloadPdf = () => {
    if (!result || !analysis) return;
    generatePdf({
      merchantName: result.merchantName ?? formData.merchantName,
      amount: (result.amount ?? (Number(formData.disputedAmount) || Number(formData.purchaseAmount) || 0)),
      paymentDate: result.paymentDate ?? formData.paymentDate,
      paymentMethod: result.paymentMethod ?? formData.paymentMethod,
      problemType: result.problemType ?? formData.problemType,
      successProbability: analysis.successProbability,
      successProbabilityLabel: analysis.successProbabilityLabel,
      summary: analysis.summary,
      nextSteps: analysis.nextSteps ?? [],
      merchantTemplate: analysis.merchantTemplate,
      bankTemplate: analysis.bankTemplate,
      escalationTemplate: analysis.escalationTemplate,
    });
    toast({ title: "PDF wird heruntergeladen", description: "Datei erscheint in deinen Downloads." });
  };

  const analysis = result?.analysis;

  // Step 5 validity: at least one required question answered
  const step5Valid = (() => {
    const questions = STRUCTURED_QUESTIONS[formData.problemType] ?? STRUCTURED_QUESTIONS.other;
    const required = questions.filter((q) => q.required);
    if (required.length === 0) {
      return Object.values(formData.structuredAnswers).some((v) => v.trim().length > 0);
    }
    return required.every((q) => (formData.structuredAnswers[q.id] ?? "").trim().length > 0);
  })();

  const canGoNext =
    (step === 1 && !!formData.paymentMethod) ||
    (step === 2 && !!formData.problemType) ||
    (step === 3 && !!formData.merchantName && !!(formData.disputedAmount || formData.purchaseAmount) && !!formData.paymentDate) ||
    step === 4;

  useEffect(() => {
    const timer = setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    return () => clearTimeout(timer);
  }, [step]);

  const disputedPct = getDisputedPercent(formData.purchaseAmount, formData.disputedAmount);

  return (
    <MainLayout>
      <ErrorBoundary>
        <div className="container mx-auto max-w-3xl py-10 px-4">
          {step < 6 && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-1">Fall prüfen</h1>
              <p className="text-muted-foreground text-sm mb-4">
                Schritt {step} von 5 — {STEP_TITLES[step - 1]}
              </p>
              <Progress value={(step / 5) * 100} className="h-2" />
              <div className="flex justify-between mt-1.5">
                {STEP_TITLES.map((title, i) => (
                  <span key={i} className={`text-[10px] font-medium hidden sm:block ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`}>
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Card className="shadow-sm">
            <CardContent className="p-6 sm:p-8">

              {/* STEP 1: Payment Method */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Wie hast du bezahlt?</h2>
                    <p className="text-sm text-muted-foreground">Die Zahlungsart bestimmt, welches Verfahren möglich ist.</p>
                  </div>
                  <RadioGroup value={formData.paymentMethod} onValueChange={(val) => setFormData((p) => ({ ...p, paymentMethod: val }))} className="space-y-2">
                    {PAYMENT_METHODS.map((pm) => (
                      <div
                        key={pm.id}
                        onClick={() => setFormData((p) => ({ ...p, paymentMethod: pm.id }))}
                        className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all select-none ${formData.paymentMethod === pm.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}
                      >
                        <RadioGroupItem value={pm.id} id={`pm-${pm.id}`} />
                        <span className="flex-1 font-medium">{pm.label}</span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* STEP 2: Problem Type */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Was ist das Problem?</h2>
                    <p className="text-sm text-muted-foreground">Wähle den Problemtyp, der am besten zu deiner Situation passt.</p>
                  </div>
                  {prefilledProblem && !formData.paymentMethod && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-sm text-primary flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      Vorausgefüllt aus deiner Szenario-Auswahl. Du kannst es anpassen oder direkt weitermachen.
                    </div>
                  )}
                  <RadioGroup value={formData.problemType} onValueChange={(val) => setFormData((p) => ({ ...p, problemType: val }))} className="space-y-2">
                    {PROBLEM_TYPES.map((pt) => (
                      <div
                        key={pt.id}
                        onClick={() => setFormData((p) => ({ ...p, problemType: pt.id }))}
                        className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all select-none ${formData.problemType === pt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}
                      >
                        <RadioGroupItem value={pt.id} id={`pt-${pt.id}`} />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${formData.problemType === pt.id ? "bg-primary/10" : "bg-muted"}`}>
                          <pt.icon className={`w-4 h-4 ${formData.problemType === pt.id ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <span className="flex-1 font-medium">{pt.label}</span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* STEP 3: Merchant Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Details zum Händler</h2>
                    <p className="text-sm text-muted-foreground">Diese Angaben fließen direkt in deine Textvorlagen ein.</p>
                  </div>

                  {formData.problemType && (
                    <MerchantQuickSelect
                      problemType={formData.problemType}
                      selected={formData.merchantName}
                      onSelect={(name) => setFormData((p) => ({ ...p, merchantName: name }))}
                    />
                  )}

                  {/* Händlername + Datum */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="merchantName">Händlername *</Label>
                      <Input
                        id="merchantName"
                        placeholder={
                          formData.problemType === "food_delivery" ? "z.B. Lieferando, Wolt, ..." :
                          formData.problemType === "flight_travel" ? "z.B. Ryanair, Booking.com, ..." :
                          "z.B. Amazon, Zalando, ..."
                        }
                        value={formData.merchantName}
                        onChange={(e) => setFormData((p) => ({ ...p, merchantName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="paymentDate">Zahlungsdatum *</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => setFormData((p) => ({ ...p, paymentDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Beträge */}
                  <div className="space-y-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="purchaseAmount">
                          Kaufbetrag gesamt (EUR)
                          <span className="text-muted-foreground font-normal ml-1 text-xs">was hast du bezahlt?</span>
                        </Label>
                        <Input
                          id="purchaseAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.purchaseAmount}
                          onChange={(e) => setFormData((p) => ({ ...p, purchaseAmount: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="disputedAmount">
                          Streitiger Betrag (EUR) *
                          <span className="text-muted-foreground font-normal ml-1 text-xs">was willst du zurück?</span>
                        </Label>
                        <Input
                          id="disputedAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.disputedAmount}
                          onChange={(e) => setFormData((p) => ({ ...p, disputedAmount: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Percentage feedback */}
                    {formData.disputedAmount && formData.purchaseAmount && (
                      <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                        disputedPct === null
                          ? "bg-red-50 border-red-200 text-red-700"
                          : disputedPct === 100
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}>
                        {disputedPct === null ? (
                          <>
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>Streitiger Betrag ist höher als der Kaufbetrag — bitte prüfen.</span>
                          </>
                        ) : disputedPct === 100 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>Vollständige Rückerstattung — du forderst den gesamten Kaufbetrag zurück.</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 flex-shrink-0" />
                            <span>Du forderst <strong>{disputedPct}%</strong> des Kaufbetrags zurück ({formData.disputedAmount} EUR von {formData.purchaseAmount} EUR).</span>
                          </>
                        )}
                      </div>
                    )}
                    {!formData.purchaseAmount && formData.disputedAmount && (
                      <p className="text-xs text-muted-foreground pl-1">
                        Kaufbetrag optional — falls du nur einen Teil zurückforderst, hilft er der KI bei der Analyse.
                      </p>
                    )}
                  </div>

                  {/* Händler kontaktiert */}
                  <div className="pt-2 border-t space-y-4">
                    <div
                      onClick={() => setFormData((p) => ({ ...p, merchantContacted: !p.merchantContacted, merchantResponseType: "", merchantResponseNote: "" }))}
                      className={`flex items-start space-x-3 border-2 p-4 rounded-xl cursor-pointer select-none transition-all ${formData.merchantContacted ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    >
                      <Checkbox
                        id="contacted"
                        checked={formData.merchantContacted}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, merchantContacted: Boolean(c), merchantResponseType: "", merchantResponseNote: "" }))}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="font-medium block flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary inline-block" />
                          Ich habe den Händler bereits kontaktiert
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">Vorheriger Kontakt stärkt deine Chargeback-Position deutlich.</p>
                      </div>
                    </div>

                    {formData.merchantContacted && (
                      <div className="space-y-4 pl-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-sm font-semibold">Was hat der Händler geantwortet?</p>
                        <div className="space-y-2">
                          {MERCHANT_RESPONSE_OPTIONS.map((opt) => (
                            <div
                              key={opt.id}
                              onClick={() => setFormData((p) => ({ ...p, merchantResponseType: opt.id, merchantResponseNote: "" }))}
                              className={`flex items-start gap-3 border-2 px-4 py-3 rounded-xl cursor-pointer transition-all select-none ${formData.merchantResponseType === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.merchantResponseType === opt.id ? "border-primary" : "border-muted-foreground/40"}`}>
                                {formData.merchantResponseType === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <div>
                                <span className="text-sm font-semibold block">{opt.label}</span>
                                <span className="text-xs text-muted-foreground">{opt.sub}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Optional note for certain responses */}
                        {["abgelehnt", "teilerstattung", "sonstiges"].includes(formData.merchantResponseType) && (
                          <div className="space-y-1.5 animate-in fade-in duration-150">
                            <Label htmlFor="responseNote" className="text-sm">
                              {formData.merchantResponseType === "teilerstattung"
                                ? "Welchen Betrag hat der Händler angeboten?"
                                : "Weitere Details (optional)"}
                            </Label>
                            <Textarea
                              id="responseNote"
                              rows={2}
                              placeholder={
                                formData.merchantResponseType === "teilerstattung"
                                  ? "z.B. Händler bot 10 EUR von 39 EUR an..."
                                  : "z.B. Händler verwies auf AGB, Begründung war..."
                              }
                              value={formData.merchantResponseNote}
                              onChange={(e) => setFormData((p) => ({ ...p, merchantResponseNote: e.target.value }))}
                              className="resize-none text-sm"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Evidence */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Welche Beweise hast du?</h2>
                    <p className="text-sm text-muted-foreground">Mehr Beweise = stärkere Position. Wähle alle aus, die du hast.</p>
                  </div>

                  {EVIDENCE_GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    return (
                      <div key={group.label} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <GroupIcon className="w-3.5 h-3.5" />
                          {group.label}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {group.items.map((ev) => {
                            const checked = formData.evidence.includes(ev.id);
                            return (
                              <div
                                key={ev.id}
                                onClick={() => toggleEvidence(ev.id)}
                                className={`flex items-start space-x-3 border-2 p-3.5 rounded-xl cursor-pointer select-none transition-all ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                              >
                                <Checkbox
                                  id={`ev-${ev.id}`}
                                  checked={checked}
                                  onCheckedChange={() => toggleEvidence(ev.id)}
                                  className="mt-0.5 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="font-medium text-sm block">{ev.label}</span>
                                  {ev.hint && <p className="text-xs text-muted-foreground mt-0.5">{ev.hint}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {formData.evidence.filter((e) => e !== "none").length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      {formData.evidence.filter((e) => e !== "none").length} Beweis{formData.evidence.filter((e) => e !== "none").length !== 1 ? "e" : ""} ausgewählt — gute Ausgangslage.
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Structured case questions */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Was ist passiert?</h2>
                    <p className="text-sm text-muted-foreground">
                      Beantworte die folgenden Fragen — so braucht die KI alle Details für präzise Vorlagen.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {(STRUCTURED_QUESTIONS[formData.problemType] ?? STRUCTURED_QUESTIONS.other).map((q) => (
                      <div key={q.id} className="space-y-2">
                        <Label className="text-sm font-semibold">
                          {q.label}
                          {q.required && <span className="text-primary ml-1">*</span>}
                        </Label>
                        <QuestionField
                          question={q}
                          value={formData.structuredAnswers[q.id] ?? ""}
                          onChange={(val) => setAnswer(q.id, val)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-1 flex items-center gap-2"><Shield className="w-4 h-4" /> KI-Fallanalyse</p>
                    <p>Deine Angaben werden von unserer KI ausgewertet und in strukturierte Textbausteine überführt. Dauer: ca. 15–30 Sekunden.</p>
                  </div>

                  <div className="border border-border rounded-xl p-4 space-y-3">
                    <label htmlFor="legal-accept" className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        id="legal-accept"
                        checked={acceptedLegal}
                        onCheckedChange={(c) => setAcceptedLegal(Boolean(c))}
                        className="mt-1"
                      />
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        Ich stimme zu, dass meine eingegebenen Daten zur Texterstellung an eine Künstliche Intelligenz über die Gemini API von Google LLC (USA) übertragen werden. Ich habe verstanden, dass ChargebackPilot <strong>keine Rechtsberatung</strong> ist, keine Fristen überwacht und keine anwaltliche Prüfung ersetzt. Ich akzeptiere die <a href="/agb" target="_blank" className="underline hover:text-foreground">AGB</a> und <a href="/datenschutz" target="_blank" className="underline hover:text-foreground">Datenschutzerklärung</a>.
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 6: Loading + Result */}
              {step === 6 && (
                <div className="space-y-8">
                  {!result ? (
                    <AnalysisLoader merchantName={formData.merchantName} />
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                      {/* Header */}
                      <div className="text-center pb-2">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
                          <TrendingUp className="w-7 h-7 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Deine Fall-Analyse</h2>
                        {result.merchantName && (
                          <p className="text-muted-foreground text-sm mt-1">
                            Fall gegen <strong>{result.merchantName}</strong> — {new Date().toLocaleDateString("de-DE")}
                          </p>
                        )}
                      </div>

                      <SocialProof merchantName={result.merchantName} />

                      {/* Probability gauge — always visible */}
                      {analysis && <ProbabilityGauge probability={analysis.successProbability} label={analysis.successProbabilityLabel} />}

                      {/* Urgency banners */}
                      {analysis?.urgencyLevel === "hoch" && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
                          <Siren className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div><p className="font-bold">Dringlich — Frist beachten!</p><p>{analysis.deadline}</p></div>
                        </div>
                      )}
                      {analysis?.urgencyLevel === "mittel" && (
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                          <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div><p className="font-bold">Fristhinweis</p><p>{analysis.deadline}</p></div>
                        </div>
                      )}

                      {/* Summary + reasoning — always visible */}
                      {analysis && (
                        <div className="space-y-3">
                          <div className="border rounded-xl p-5">
                            <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />Fallzusammenfassung
                            </h3>
                            <p className="text-sm leading-relaxed">{analysis.summary}</p>
                          </div>
                          <div className="border rounded-xl p-5">
                            <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                              <Scale className="w-4 h-4 text-primary" />Begründung
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{analysis.reasoning}</p>
                          </div>
                        </div>
                      )}

                      {/* Missing evidence — always visible */}
                      {analysis?.missingEvidence && analysis.missingEvidence.length > 0 && (
                        <div className="border rounded-xl p-5">
                          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />Fehlende Beweise — jetzt sichern
                          </h3>
                          <ul className="space-y-2">
                            {analysis.missingEvidence.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" /><span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* First next step — free preview */}
                      {analysis?.nextSteps && analysis.nextSteps.length > 0 && (
                        <div className="border rounded-xl p-5">
                          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-primary" />Nächste Schritte
                          </h3>
                          <ol className="space-y-3">
                            <li className="flex gap-3 text-sm">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">1</span>
                              <span className="leading-relaxed pt-0.5">{analysis.nextSteps[0]}</span>
                            </li>
                            {!hasUnlocked && analysis.nextSteps.length > 1 && (
                              <li className="flex gap-3 text-sm opacity-40 select-none">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center">2</span>
                                <span className="blur-[4px] leading-relaxed pt-0.5">{analysis.nextSteps[1]}</span>
                              </li>
                            )}
                            {hasUnlocked && analysis.nextSteps.slice(1).map((s, i) => (
                              <li key={i} className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center">{i + 2}</span>
                                <span className="leading-relaxed pt-0.5">{s}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* ===== PAYWALL or UNLOCKED CONTENT ===== */}
                      {!hasUnlocked ? (
                        <div className="space-y-6">
                          {isPaypalCase ? (
                            <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-yellow-900">PayPal-Zahlung</p>
                                  <p className="text-sm text-slate-700">Noch nicht bezahlt? Diese Schaltfläche bringt dich direkt zur Paywall.</p>
                                </div>
                                <Button variant="secondary" onClick={scrollToPaywall} size="sm">
                                  Zur Paywall scrollen
                                </Button>
                              </div>
                            </div>
                          ) : null}

                          <div ref={paywallRef}>
                            <PaywallModal
                              onUnlock={handlePayment}
                              isPaying={isPaying}
                              caseId={result.id}
                              merchantName={result.merchantName ?? formData.merchantName}
                              amount={(result.amount ?? (Number(formData.disputedAmount) || Number(formData.purchaseAmount) || 0))}
                              successProbability={analysis?.successProbability ?? 0}
                              paymentMethod={result.paymentMethod ?? formData.paymentMethod}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-in fade-in duration-500">

                          {/* Unlocked badge */}
                          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              Vollständige Analyse freigeschaltet
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                              onClick={handleDownloadPdf}
                            >
                              <Download className="w-3.5 h-3.5" />
                              PDF speichern
                            </Button>
                          </div>

                          {/* PayPal step-by-step guide */}
                          {(result.paymentMethod === "paypal" || formData.paymentMethod === "paypal") && (
                            <PaypalGuide
                              problemType={result.problemType ?? formData.problemType}
                              merchantName={result.merchantName ?? formData.merchantName}
                              amount={(result.amount ?? (Number(formData.disputedAmount) || 0))}
                            />
                          )}

                          {/* Recommended category */}
                          {analysis?.recommendedCategory && (
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Empfohlene Streitkategorie</p>
                                <p className="font-bold text-sm">{analysis.recommendedCategory}</p>
                              </div>
                            </div>
                          )}

                          {/* Legal basis */}
                          {analysis?.legalBasis && analysis.legalBasis.length > 0 && (
                            <div className="border rounded-xl p-5">
                              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                                <Scale className="w-4 h-4 text-primary" />Mögliche rechtliche Hinweise
                              </h3>
                              <ul className="space-y-2">
                                {analysis.legalBasis.map((basis, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /><span>{basis}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Counterarguments */}
                          {analysis?.counterarguments && analysis.counterarguments.length > 0 && (
                            <div className="border rounded-xl p-5">
                              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary" />Mögliche Gegenargumente — und wie du sie entkräftest
                              </h3>
                              <ul className="space-y-3">
                                {analysis.counterarguments.map((arg, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 border rounded-lg px-3 py-2.5">
                                    <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" /><span>{arg}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Templates */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                              <h3 className="text-lg font-bold">Deine professionellen Textvorlagen</h3>
                              <Button size="sm" variant="outline" className="gap-2 cursor-pointer" onClick={handleDownloadPdf}>
                                <Download className="w-3.5 h-3.5" />Alle als PDF
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              KI-generiert für {result.merchantName || "deinen Fall"} — bitte vor dem Versenden prüfen und ggf. anpassen.
                            </p>
                            {analysis?.merchantTemplate && (
                              <CopyableTemplate
                                title="Anschreiben an den Händler"
                                icon={<Building2 className="w-4 h-4" />}
                                text={analysis.merchantTemplate}
                                onCopy={() => copyToClipboard(analysis.merchantTemplate, "Händler-Vorlage")}
                              />
                            )}
                            {analysis?.bankTemplate && (
                              <CopyableTemplate
                                title="Chargeback-Antrag an Bank / PayPal / Klarna"
                                icon={<Landmark className="w-4 h-4" />}
                                text={analysis.bankTemplate}
                                onCopy={() => copyToClipboard(analysis.bankTemplate, "Bank-Vorlage")}
                              />
                            )}
                            {analysis?.escalationTemplate && (
                              <CopyableTemplate
                                title="Eskalationsschreiben (falls erster Versuch erfolglos)"
                                icon={<Siren className="w-4 h-4" />}
                                text={analysis.escalationTemplate}
                                onCopy={() => copyToClipboard(analysis.escalationTemplate, "Eskalations-Vorlage")}
                              />
                            )}
                          </div>

                          {/* PDF download CTA */}
                          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
                            <div className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                              Fertig
                            </div>
                            <h3 className="font-bold text-lg">Alles als PDF herunterladen</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                              Alle 3 Textvorlagen, deine Fallanalyse und nächsten Schritte in einem druckfertigen Dokument.
                            </p>
                            <Button className="gap-2 cursor-pointer shadow-sm" onClick={handleDownloadPdf}>
                              <Download className="w-4 h-4" />PDF herunterladen
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Disclaimer — always shown */}
                      <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5">
                        <h4 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />Wichtiger Haftungsausschluss
                        </h4>
                        <div className="text-sm text-red-900 leading-relaxed">
                          {analysis?.disclaimer} Nutzer sind selbst verantwortlich, die Richtigkeit der Vorlagen und die Einhaltung sämtlicher Fristen zu prüfen. Sende diese Texte niemals ungeprüft ab.
                        </div>
                      </div>

                      <div className="text-center border-t pt-6">
                        <Button variant="outline" onClick={resetForm} className="cursor-pointer">Neuen Fall prüfen</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NAV BUTTONS */}
              {step < 6 && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button variant="outline" onClick={handleBack} disabled={step === 1} className="gap-2 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />Zurück
                  </Button>
                  {step < 5 ? (
                    <Button onClick={handleNext} disabled={!canGoNext} className="gap-2 cursor-pointer">
                      Weiter<ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={!step5Valid || !acceptedLegal || createCase.isPending} className="gap-2 cursor-pointer">
                      <Shield className="w-4 h-4" />Fall analysieren
                    </Button>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
}
