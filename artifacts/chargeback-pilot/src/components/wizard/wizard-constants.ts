import {
  Package,
  X,
  Building2,
  Plane,
  Repeat2,
  AlertTriangle,
  UtensilsCrossed,
  RefreshCcw,
  ChevronRight,
  Receipt,
  Mail,
  Camera,
  FileX,
} from "lucide-react";

export const PAYMENT_METHODS = [
  { id: "paypal", label: "PayPal" },
  { id: "visa_mastercard", label: "Kreditkarte Visa/Mastercard" },
  { id: "amex", label: "American Express" },
  { id: "klarna", label: "Klarna" },
  { id: "apple_google_pay", label: "Apple Pay / Google Pay" },
  { id: "bank_transfer", label: "Banküberweisung" },
  { id: "other", label: "Sonstiges" },
];

export const PROBLEM_TYPES = [
  { id: "not_received", label: "Ware nicht erhalten", icon: Package },
  { id: "defective", label: "Ware defekt / anders als beschrieben", icon: X },
  { id: "service_not_rendered", label: "Dienstleistung nicht erbracht", icon: Building2 },
  { id: "flight_travel", label: "Flug / Reise / Hotel Problem", icon: Plane },
  { id: "subscription", label: "Abo / ungewollte Abbuchung", icon: Repeat2 },
  { id: "fraud", label: "Betrugs-/Scam-Verdacht", icon: AlertTriangle },
  { id: "food_delivery", label: "Lieferdienst / Essen unbrauchbar", icon: UtensilsCrossed },
  { id: "refund_promised", label: "Rückerstattung zugesagt aber nicht erhalten", icon: RefreshCcw },
  { id: "other", label: "Sonstiges", icon: ChevronRight },
];

export const KNOWN_MERCHANTS: Record<string, Array<{ name: string; emoji: string }>> = {
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

export const MERCHANT_RESPONSE_OPTIONS = [
  {
    id: "keine_antwort",
    label: "Keine Antwort erhalten",
    sub: "Händler reagiert nicht auf Kontaktaufnahme",
  },
  { id: "abgelehnt", label: "Händler hat abgelehnt", sub: "Erstattung wurde verweigert" },
  {
    id: "versprach_rueckerstattung",
    label: "Erstattung versprochen — aber nicht gezahlt",
    sub: "Händler sagte Rückzahlung zu, nichts kam",
  },
  {
    id: "teilerstattung",
    label: "Nur Teilerstattung angeboten",
    sub: "Händler zahlt weniger als der strittige Betrag",
  },
  { id: "sonstiges", label: "Sonstiges", sub: "Andere Reaktion" },
];

export const EVIDENCE_GROUPS = [
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
      {
        id: "none",
        label: "Keine Beweise vorhanden",
        hint: "KI analysiert trotzdem die Rechtslage",
      },
    ],
  },
];

export type QuestionType = "textarea" | "radio" | "date" | "number" | "multiselect";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  options?: QuestionOption[];
  rows?: number;
  required?: boolean;
  suffix?: string;
}

export const STRUCTURED_QUESTIONS: Record<string, Question[]> = {
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
        {
          value: "Als zugestellt markiert – nicht erhalten",
          label: "Als zugestellt markiert, aber nicht erhalten",
        },
        { value: "Paket zurück an Händler gegangen", label: "Paket zurück an Händler gegangen" },
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
        {
          value: "Die Airline / der Reiseanbieter hat storniert",
          label: "Airline / Anbieter hat storniert",
        },
        {
          value: "Ich musste stornieren (höhere Gewalt / außerordentlich)",
          label: "Ich – höhere Gewalt",
        },
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
      placeholder:
        'z.B. "innerhalb 5–7 Werktage", "innerhalb 14 Tage", kein konkretes Datum genannt...',
      rows: 1,
    },
  ],
  fraud: [
    {
      id: "fraud_discovery",
      label: "Wie ist der Verdacht entstanden?",
      type: "textarea",
      placeholder: "z.B. Fake-Shop, nie geliefertes Produkt, Phishing-Mail, gefälschte Website...",
      rows: 2,
      required: true,
    },
    {
      id: "fraud_timing",
      label: "Wann ist dir das Problem aufgefallen?",
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
      placeholder:
        "z.B. Online-Kurs nie freigeschaltet, Reparatur nicht durchgeführt, Termin nicht eingehalten...",
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

export const STEP_TITLES = [
  "Zahlungsart",
  "Problemtyp",
  "Händlerdetails",
  "Beweislage",
  "Falldetails",
];

export const LOADING_STEPS = [
  "Falldetails strukturieren",
  "Begründungen & Fristen zuordnen",
  "Professionelle Textvorlagen generieren",
];
