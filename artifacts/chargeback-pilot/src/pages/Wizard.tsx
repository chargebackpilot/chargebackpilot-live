import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateCase } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

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

const EVIDENCE_OPTIONS = [
  { id: "receipt", label: "Zahlungsnachweis", hint: "Kontoauszug / Screenshot" },
  { id: "order_confirmation", label: "Bestellbestätigung", hint: "E-Mail oder PDF" },
  { id: "email_thread", label: "E-Mail-Verlauf", hint: "Mit dem Händler" },
  { id: "chat_screenshot", label: "Chat-Screenshots", hint: "WhatsApp, Support-Chat" },
  { id: "photos", label: "Fotos / Videos", hint: "Defekte Ware, Mangel" },
  { id: "tracking", label: "Tracking", hint: "Sendungsverfolgung" },
  { id: "cancellation", label: "Stornierungsbestätigung", hint: "E-Mail vom Händler" },
  { id: "refund_promise", label: "Schriftliche Refund-Zusage", hint: "Screenshot, E-Mail" },
  { id: "tos", label: "AGB / Screenshots", hint: "Angebotsbeschreibung" },
  { id: "none", label: "Keine Beweise vorhanden", hint: "" },
];

const STEP_TITLES = ["Zahlungsart", "Problemtyp", "Händlerdetails", "Beweislage", "Fallbeschreibung"];

const LOADING_STEPS = [
  "Falldetails & Beweislage auswerten",
  "Rechtslage & Fristen prüfen",
  "Professionelle Textvorlagen generieren",
];

// --- Fancy loading animation component ---
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
      {/* Animated logo spinner */}
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

      {/* Step indicators with spinner → checkmark transition */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {LOADING_STEPS.map((label, i) => {
          const done = completedSteps.includes(i);
          const active = !done && (i === 0 || completedSteps.includes(i - 1));
          return (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                done ? "text-foreground" : active ? "text-muted-foreground" : "text-muted-foreground/40"
              }`}
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

// --- Probability Gauge ---
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
            <circle
              cx="60" cy="60" r="54" fill="none" stroke="currentColor"
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              className={`${color.ring} transition-all duration-1000`}
            />
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

// --- Copyable Template ---
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

// --- Merchant Quick Select ---
function MerchantQuickSelect({
  problemType,
  onSelect,
  selected,
}: {
  problemType: string;
  onSelect: (name: string) => void;
  selected: string;
}) {
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
            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/40 active:scale-[0.98] ${
              selected === m.name
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card"
            }`}
            data-testid={`merchant-quick-${m.name}`}
          >
            <span className="text-xl leading-none flex-shrink-0">{m.emoji}</span>
            <span className="font-semibold text-sm truncate">{m.name}</span>
            {selected === m.name && (
              <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Nicht dabei? Trage den Namen manuell unten ein.</p>
    </div>
  );
}

// --- Paywall Component ---
function Paywall({
  children,
  onUnlock,
  isPaying,
}: {
  children: React.ReactNode;
  onUnlock: () => void;
  isPaying: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-10 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 max-w-md shadow-2xl">
          <div className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Vollzugriff
          </div>
          <h3 className="font-black text-2xl text-foreground mb-2">Maximale Erfolgschancen</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Schalte professionelle Textvorlagen, detaillierte Schritt-für-Schritt-Anleitungen und die Entkräftung von Gegenargumenten frei.
          </p>
          <Button size="lg" className="w-full text-base h-12 shadow-lg mb-3 gap-2" onClick={onUnlock} disabled={isPaying}>
            {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Jetzt für 0,99 € freischalten"}
          </Button>
          <div className="text-xs text-muted-foreground">
            Sichere Zahlung via Apple Pay, Google Pay, Kreditkarte (Stripe)
          </div>
        </div>
      </div>
      <div className="blur-sm">{children}</div>
    </div>
  );
}

// --- Main Wizard ---
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Wizard() {
  const params = new URLSearchParams(window.location.search);
  const prefilledProblem = params.get("problem") ?? "";

  const [step, setStep] = useState(prefilledProblem ? 2 : 1);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: "",
    problemType: prefilledProblem,
    merchantName: "",
    amount: "",
    paymentDate: "",
    merchantCountry: "",
    merchantContacted: false,
    merchantResponse: "",
    evidence: [] as string[],
    description: "",
  });

  const createCase = useCreateCase();
  const [result, setResult] = useState<ReturnType<typeof useCreateCase>["data"]>(undefined);
  const { toast } = useToast();

  const handleNext = () => { if (step < 6) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = () => {
    if (createCase.isPending) return;
    setStep(6);
    createCase.mutate(
      {
        data: {
          paymentMethod: formData.paymentMethod || "other",
          problemType: formData.problemType || "other",
          merchantName: formData.merchantName || "Unbekannter Händler",
          amount: Number(formData.amount) || 0,
          paymentDate: formData.paymentDate || new Date().toISOString().split("T")[0],
          merchantCountry: formData.merchantCountry || undefined,
          merchantContacted: formData.merchantContacted,
          merchantResponse: formData.merchantResponse || undefined,
          evidence: formData.evidence || [],
          description: formData.description || "Keine Beschreibung",
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
    if (id === "none") { setFormData({ ...formData, evidence: ["none"] }); return; }
    const currentEvidence = formData.evidence || [];
    const filtered = currentEvidence.filter((e) => e !== "none");
    const newEvidence = filtered.includes(id) ? filtered.filter((e) => e !== id) : [...filtered, id];
    setFormData({ ...formData, evidence: newEvidence });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopiert", description: `${label} in Zwischenablage.` });
  };

  const resetForm = () => {
    setStep(1); setResult(undefined); createCase.reset();
    setHasUnlocked(false);
    setIsPaying(false);
    setFormData({ paymentMethod: "", problemType: "", merchantName: "", amount: "", paymentDate: "", merchantCountry: "", merchantContacted: false, merchantResponse: "", evidence: [], description: "" });
    window.history.replaceState({}, "", "/fall-pruefen");
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setHasUnlocked(true);
      toast({ title: "Zahlung erfolgreich!", description: "Alle Vorlagen wurden freigeschaltet." });
    }, 1500);
  };

  const analysis = result?.analysis;

  // Step 1 skippable if coming from deeplink (problem already set), but we stay at step 2
  const canGoNext =
    (step === 1 && !!formData.paymentMethod) ||
    (step === 2 && !!formData.problemType) ||
    (step === 3 && !!formData.merchantName && !!formData.amount && !!formData.paymentDate) ||
    step === 4;

  useEffect(() => {
    // Timeout prevents mobile Safari rendering bugs when scrolling and changing layout simultaneously
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [step]);

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
                <RadioGroup value={formData.paymentMethod} onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })} className="space-y-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
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
                <RadioGroup value={formData.problemType} onValueChange={(val) => setFormData({ ...formData, problemType: val })} className="space-y-2">
                  {PROBLEM_TYPES.map((pt) => (
                    <div
                      key={pt.id}
                      onClick={() => setFormData({ ...formData, problemType: pt.id })}
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
                    onSelect={(name) => setFormData({ ...formData, merchantName: name })}
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="merchantName">Händlername *</Label>
                    <Input
                      id="merchantName"
                      placeholder={formData.problemType === "food_delivery" ? "z.B. Lieferando, Wolt, ..." : formData.problemType === "flight_travel" ? "z.B. Ryanair, Booking.com, ..." : "z.B. Amazon, Zalando, ..."}
                      value={formData.merchantName}
                      onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Betrag in EUR *</Label>
                    <Input id="amount" type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentDate">Zahlungsdatum *</Label>
                    <Input id="paymentDate" type="date" value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div
                    onClick={() => setFormData({ ...formData, merchantContacted: !formData.merchantContacted })}
                    className={`flex items-start space-x-3 border-2 p-4 rounded-xl cursor-pointer select-none transition-all ${formData.merchantContacted ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                  >
                    <Checkbox id="contacted" checked={formData.merchantContacted} onCheckedChange={(c) => setFormData({ ...formData, merchantContacted: Boolean(c) })} className="mt-0.5" />
                    <div>
                      <span className="font-medium block">Ich habe den Händler bereits kontaktiert</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Vorheriger Kontakt stärkt deine Chargeback-Position deutlich.</p>
                    </div>
                  </div>
                  {formData.merchantContacted && (
                    <div className="space-y-1.5">
                      <Label htmlFor="response">Was hat der Händler geantwortet?</Label>
                      <Textarea id="response" rows={3} placeholder="Händler hat abgelehnt / nicht geantwortet / Rückerstattung versprochen aber nicht gezahlt ..." value={formData.merchantResponse} onChange={(e) => setFormData({ ...formData, merchantResponse: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Evidence */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Welche Beweise hast du?</h2>
                  <p className="text-sm text-muted-foreground">Mehr Beweise = stärkere Position. Wähle alle zutreffenden aus.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {EVIDENCE_OPTIONS.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => toggleEvidence(ev.id)}
                      className={`flex items-start space-x-3 border-2 p-3.5 rounded-xl cursor-pointer select-none transition-all ${(formData.evidence || []).includes(ev.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                    >
                      <Checkbox id={`ev-${ev.id}`} checked={(formData.evidence || []).includes(ev.id)} onCheckedChange={() => toggleEvidence(ev.id)} className="mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-medium text-sm block">{ev.label}</span>
                        {ev.hint && <p className="text-xs text-muted-foreground mt-0.5">{ev.hint}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                {(formData.evidence || []).filter((e) => e !== "none").length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {(formData.evidence || []).filter((e) => e !== "none").length} Beweis{(formData.evidence || []).filter((e) => e !== "none").length !== 1 ? "e" : ""} ausgewählt
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Description */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Was ist passiert?</h2>
                  <p className="text-sm text-muted-foreground">Je detaillierter deine Beschreibung, desto präziser werden die Textvorlagen.</p>
                </div>

                {formData.problemType && (
                  <div className="bg-muted/50 border rounded-xl p-4 text-sm">
                    <p className="font-semibold mb-2 text-xs uppercase tracking-wide text-muted-foreground">Tipps für deinen Fall:</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      {formData.problemType === "food_delivery" && <>
                        <li>• Wann genau wurde bestellt und geliefert?</li>
                        <li>• Was war konkret falsch oder fehlte?</li>
                        <li>• Hast du den Lieferdienst bereits kontaktiert? Was war die Antwort?</li>
                      </>}
                      {formData.problemType === "flight_travel" && <>
                        <li>• Wann war der Flug/die Reise geplant?</li>
                        <li>• Warum wurde storniert — Airline oder du?</li>
                        <li>• Welche Steuern und Gebühren wurden einbehalten?</li>
                      </>}
                      {formData.problemType === "not_received" && <>
                        <li>• Wann wurde bestellt und wann war Lieferung geplant?</li>
                        <li>• Was sagt der Tracking-Status?</li>
                        <li>• Hat der Händler auf Nachfragen reagiert?</li>
                      </>}
                      {formData.problemType === "subscription" && <>
                        <li>• Wann hast du das Abo gekündigt?</li>
                        <li>• Wie viele Monate wurden nach Kündigung noch abgebucht?</li>
                        <li>• Hast du eine Kündigungsbestätigung erhalten?</li>
                      </>}
                      {!["food_delivery","flight_travel","not_received","subscription"].includes(formData.problemType || "") && <>
                        <li>• Wann genau ist das Problem aufgetreten?</li>
                        <li>• Was wurde versprochen und was wurde tatsächlich geliefert?</li>
                        <li>• Wie hat der Händler auf deine Kontaktaufnahme reagiert?</li>
                      </>}
                    </ul>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Textarea
                    rows={7}
                    placeholder="Beschreibe den Vorfall konkret: Wann bestellt? Was wurde geliefert/nicht geliefert? Wie hat der Händler reagiert? Gibt es Fristen oder Zusagen?"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-start pt-1">
                    <p className="text-[11px] text-red-600 font-medium max-w-[80%]">
                      Wichtig: Bitte gib keine sensiblen Daten (wie Kontonummern, echte Namen oder Passwörter) ein. Schreibe am besten anonymisiert.
                    </p>
                    <span className={`text-xs font-medium ${(formData.description || "").length >= 20 ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {(formData.description || "").length} Zeichen
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-4">
                  <p className="font-semibold mb-1 flex items-center gap-2"><Shield className="w-4 h-4" /> KI-Fallanalyse</p>
                  <p>Deine Angaben werden von unserer KI analysiert — maßgeschneiderte Textvorlagen für {formData.merchantName || "deinen Fall"} inklusive. Dauer: ca. 15–30 Sekunden.</p>
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
                      Ich stimme zu, dass meine eingegebenen Daten zur Texterstellung an eine Künstliche Intelligenz (Google LLC, USA) übertragen werden. Ich habe verstanden, dass ChargebackPilot <strong>keine Rechtsberatung</strong> ist, keine Fristen überwacht und keine anwaltliche Prüfung ersetzt. Ich akzeptiere die <a href="/agb" target="_blank" className="underline hover:text-foreground">AGB</a> und <a href="/datenschutz" target="_blank" className="underline hover:text-foreground">Datenschutzerklärung</a>.
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
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center pb-2">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
                        <TrendingUp className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Deine Fall-Analyse</h2>
                      {result.merchantName && (
                        <p className="text-muted-foreground text-sm mt-1">Fall gegen <strong>{result.merchantName}</strong> — {new Date().toLocaleDateString("de-DE")}</p>
                      )}
                    </div>

                    {analysis && <ProbabilityGauge probability={analysis.successProbability} label={analysis.successProbabilityLabel} />}

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

                    {analysis && (
                      <div className="space-y-4">
                        <div className="border rounded-xl p-5">
                          <h3 className="font-bold text-base mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Fallzusammenfassung</h3>
                          <p className="text-sm leading-relaxed">{analysis.summary}</p>
                        </div>
                        <div className="border rounded-xl p-5">
                          <h3 className="font-bold text-base mb-2 flex items-center gap-2"><Scale className="w-4 h-4 text-primary" />Begründung</h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">{analysis.reasoning}</p>
                        </div>
                      </div>
                    )}

                    {analysis?.recommendedCategory && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Empfohlene Streitkategorie</p>
                          <p className="font-bold text-sm">{analysis.recommendedCategory}</p>
                        </div>
                      </div>
                    )}

                    {analysis?.legalBasis && analysis.legalBasis.length > 0 && (
                      <div className="border rounded-xl p-5">
                        <h3 className="font-bold text-base mb-3 flex items-center gap-2"><Scale className="w-4 h-4 text-primary" />Rechtliche Grundlagen</h3>
                        <ul className="space-y-2">
                          {analysis.legalBasis.map((basis, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /><span>{basis}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis?.missingEvidence && analysis.missingEvidence.length > 0 && (
                      <div className="border rounded-xl p-5">
                        <h3 className="font-bold text-base mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Fehlende Beweise — jetzt sichern</h3>
                        <ul className="space-y-2">
                          {analysis.missingEvidence.map((ev, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" /><span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis?.nextSteps && analysis.nextSteps.length > 0 && (
                      <div className="border rounded-xl p-5">
                        <h3 className="font-bold text-base mb-3 flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" />Nächste Schritte</h3>
                        <ol className="space-y-3">
                          {/* Step 1 is always visible */}
                          <li className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">1</span>
                            <span className="leading-relaxed pt-0.5">{analysis.nextSteps[0]}</span>
                          </li>

                          {/* Steps 2+ are behind paywall */}
                          {analysis.nextSteps.length > 1 && (
                            <li>
                              {hasUnlocked ? (
                                <ol className="space-y-3 pt-3">
                                  {analysis.nextSteps.slice(1).map((s, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">{i + 2}</span>
                                      <span className="leading-relaxed pt-0.5">{s}</span>
                                    </li>
                                  ))}
                                </ol>
                              ) : (
                                <Paywall onUnlock={handlePayment} isPaying={isPaying}>
                                  <ol className="space-y-3 pt-3">
                                    {analysis.nextSteps.slice(1).map((s, i) => (
                                      <li key={i} className="flex gap-3 text-sm">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center">{i + 2}</span>
                                        <span className="leading-relaxed pt-0.5">{s}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </Paywall>
                              )}
                            </li>
                          )}
                        </ol>
                      </div>
                    )}

                    {analysis?.counterarguments && analysis.counterarguments.length > 0 && (
                      <div className="border rounded-xl p-5">
                        <h3 className="font-bold text-base mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Mögliche Gegenargumente — und wie du sie entkräftest</h3>
                        {hasUnlocked ? (
                          <ul className="space-y-3">
                            {analysis.counterarguments.map((arg, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 border rounded-lg px-3 py-2.5">
                                <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" /><span>{arg}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Paywall onUnlock={handlePayment} isPaying={isPaying}>
                            <ul className="space-y-3">
                              {analysis.counterarguments.map((arg, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 border rounded-lg px-3 py-2.5">
                                  <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" /><span>{arg}</span>
                                </li>
                              ))}
                            </ul>
                          </Paywall>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-3">Deine professionellen Textvorlagen</h3>
                      <p className="text-sm text-muted-foreground">KI-generiert für {result.merchantName || "deinen Fall"} — bitte vor dem Versenden prüfen und ggf. anpassen.</p>

                      {analysis?.merchantTemplate && (
                        hasUnlocked ? (
                          <CopyableTemplate title="Anschreiben an den Händler" icon={<Building2 className="w-4 h-4" />} text={analysis.merchantTemplate} onCopy={() => copyToClipboard(analysis.merchantTemplate, "Händler-Vorlage")} />
                        ) : (
                          <Paywall onUnlock={handlePayment} isPaying={isPaying}>
                            <CopyableTemplate title="Anschreiben an den Händler" icon={<Building2 className="w-4 h-4" />} text={analysis.merchantTemplate} onCopy={() => {}} />
                          </Paywall>
                        )
                      )}
                      {analysis?.bankTemplate && (
                        hasUnlocked ? (
                          <CopyableTemplate title="Chargeback-Antrag an Bank / PayPal / Klarna" icon={<Landmark className="w-4 h-4" />} text={analysis.bankTemplate} onCopy={() => copyToClipboard(analysis.bankTemplate, "Bank-Vorlage")} />
                        ) : (
                          <Paywall onUnlock={handlePayment} isPaying={isPaying}>
                             <CopyableTemplate title="Chargeback-Antrag an Bank / PayPal / Klarna" icon={<Landmark className="w-4 h-4" />} text={analysis.bankTemplate} onCopy={() => {}} />
                          </Paywall>
                        )
                      )}
                      {analysis?.escalationTemplate && (
                        hasUnlocked ? (
                           <CopyableTemplate title="Eskalationsschreiben (falls erster Versuch erfolglos)" icon={<Siren className="w-4 h-4" />} text={analysis.escalationTemplate} onCopy={() => copyToClipboard(analysis.escalationTemplate, "Eskalations-Vorlage")} />
                        ) : (
                          <Paywall onUnlock={handlePayment} isPaying={isPaying}>
                            <CopyableTemplate title="Eskalationsschreiben (falls erster Versuch erfolglos)" icon={<Siren className="w-4 h-4" />} text={analysis.escalationTemplate} onCopy={() => {}} />
                          </Paywall>
                        )
                      )}
                    </div>

                    {hasUnlocked && (
                       <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <div className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">Freigeschaltet</div>
                         <h3 className="font-bold text-lg">Dein Bericht zum Herunterladen</h3>
                         <p className="text-sm text-muted-foreground max-w-sm mx-auto">Sichere dir alle Informationen und Vorlagen als PDF oder sende sie an deine E-Mail-Adresse.</p>
                         <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                          <Button className="w-full sm:w-auto cursor-pointer" onClick={() => toast({ title: "Noch nicht implementiert", description: "PDF-Download kommt bald!"})}>
                            PDF herunterladen
                          </Button>
                          <Button className="w-full sm:w-auto cursor-pointer" variant="outline" onClick={() => toast({ title: "Noch nicht implementiert", description: "E-Mail-Versand kommt bald!"})}>
                            Per E-Mail senden
                          </Button>
                         </div>
                       </div>
                    )}

                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 mb-8">
                      <h4 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Wichtiger Haftungsausschluss
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
                  <Button onClick={handleSubmit} disabled={(formData.description || "").length < 20 || !acceptedLegal || createCase.isPending} className="gap-2 cursor-pointer">
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
