import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateCase } from "@workspace/api-client-react";
import { useState } from "react";
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
  { id: "not_received", label: "Ware nicht erhalten" },
  { id: "defective", label: "Ware defekt / anders als beschrieben" },
  { id: "service_not_rendered", label: "Dienstleistung nicht erbracht" },
  { id: "flight_travel", label: "Flug / Reise / Hotel Problem" },
  { id: "subscription", label: "Abo / ungewollte Abbuchung" },
  { id: "fraud", label: "Betrug / Scam Verdacht" },
  { id: "food_delivery", label: "Lieferdienst / Essen unbrauchbar" },
  { id: "refund_promised", label: "Rückerstattung zugesagt aber nicht erhalten" },
  { id: "other", label: "Sonstiges" },
];

const EVIDENCE_OPTIONS = [
  { id: "receipt", label: "Zahlungsnachweis" },
  { id: "order_confirmation", label: "Bestellbestätigung" },
  { id: "email_thread", label: "E-Mail-Verlauf" },
  { id: "chat_screenshot", label: "Chat-Screenshots" },
  { id: "photos", label: "Fotos / Videos" },
  { id: "tracking", label: "Tracking / Sendungsverfolgung" },
  { id: "cancellation", label: "Stornierungsbestätigung" },
  { id: "refund_promise", label: "Schriftliche Refund-Zusage" },
  { id: "tos", label: "AGB / Screenshots" },
  { id: "none", label: "Keine Beweise vorhanden" },
];

const STEP_TITLES = [
  "Zahlungsart",
  "Problemtyp",
  "Händlerdetails",
  "Beweislage",
  "Fallbeschreibung",
];

function ProbabilityGauge({ probability, label }: { probability: number; label: string }) {
  const color =
    probability >= 65
      ? { ring: "text-emerald-500", bar: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" }
      : probability >= 40
        ? { ring: "text-amber-500", bar: "bg-amber-500", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" }
        : { ring: "text-red-500", bar: "bg-red-500", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" };

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (probability / 100) * circumference;

  return (
    <div className={`rounded-2xl border-2 ${color.border} ${color.bg} p-6 sm:p-8`}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-black/10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
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
              ? "Ihre Ausgangslage ist gut. Mit den richtigen Schritten und Belegen haben Sie gute Chancen auf Rückerstattung."
              : probability >= 40
                ? "Mittlere Ausgangslage. Fehlende Belege können die Chancen noch deutlich verbessern."
                : "Schwieriger Fall. Wir empfehlen, zuerst die fehlenden Beweise zu sichern."}
          </p>
        </div>
      </div>
    </div>
  );
}

function CopyableTemplate({
  title,
  icon,
  text,
  onCopy,
}: {
  title: string;
  icon: React.ReactNode;
  text: string;
  onCopy: () => void;
}) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div className="bg-muted/60 px-4 py-3 border-b flex justify-between items-center">
        <span className="font-semibold text-sm flex items-center gap-2">
          {icon}
          {title}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-2 text-xs"
          onClick={onCopy}
          data-testid={`button-copy-${title.replace(/\s+/g, "-").toLowerCase()}`}
        >
          <Copy className="w-3.5 h-3.5" />
          Kopieren
        </Button>
      </div>
      <div className="p-4 sm:p-5 bg-background whitespace-pre-wrap text-sm font-mono leading-relaxed max-h-80 overflow-y-auto">
        {text}
      </div>
    </div>
  );
}

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{
    paymentMethod: string;
    problemType: string;
    merchantName: string;
    amount: string;
    paymentDate: string;
    merchantCountry: string;
    merchantContacted: boolean;
    merchantResponse: string;
    evidence: string[];
    description: string;
  }>({
    paymentMethod: "",
    problemType: "",
    merchantName: "",
    amount: "",
    paymentDate: "",
    merchantCountry: "",
    merchantContacted: false,
    merchantResponse: "",
    evidence: [],
    description: "",
  });

  const createCase = useCreateCase();
  const [result, setResult] = useState<ReturnType<typeof useCreateCase>["data"]>(undefined);
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
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
          evidence: formData.evidence,
          description: formData.description || "Keine Beschreibung",
        },
      },
      {
        onSuccess: (data) => setResult(data),
        onError: () => {
          toast({
            title: "Analyse fehlgeschlagen",
            description: "Bitte versuche es erneut.",
            variant: "destructive",
          });
          setStep(5);
        },
      },
    );
  };

  const toggleEvidence = (id: string) => {
    if (id === "none") {
      setFormData({ ...formData, evidence: ["none"] });
      return;
    }
    const filtered = formData.evidence.filter((e) => e !== "none");
    const newEvidence = filtered.includes(id) ? filtered.filter((e) => e !== id) : [...filtered, id];
    setFormData({ ...formData, evidence: newEvidence });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopiert", description: `${label} wurde in die Zwischenablage kopiert.` });
  };

  const resetForm = () => {
    setStep(1);
    setResult(undefined);
    createCase.reset();
    setFormData({
      paymentMethod: "",
      problemType: "",
      merchantName: "",
      amount: "",
      paymentDate: "",
      merchantCountry: "",
      merchantContacted: false,
      merchantResponse: "",
      evidence: [],
      description: "",
    });
  };

  const analysis = result?.analysis;

  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-10 px-4">
        {step < 6 && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Fall prüfen</h1>
            <p className="text-muted-foreground text-sm mb-4">
              Schritt {step} von 5 — {STEP_TITLES[step - 1]}
            </p>
            <div className="relative">
              <Progress value={(step / 5) * 100} className="h-2" />
              <div className="flex justify-between mt-1.5">
                {STEP_TITLES.map((title, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-medium hidden sm:block ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Wie hast du bezahlt?</h2>
                  <p className="text-sm text-muted-foreground">Die Zahlungsart bestimmt, welches Verfahren möglich ist.</p>
                </div>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                  className="space-y-2"
                  data-testid="radio-payment-method"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <div
                      key={pm.id}
                      className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${
                        formData.paymentMethod === pm.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <RadioGroupItem value={pm.id} id={`pm-${pm.id}`} />
                      <Label htmlFor={`pm-${pm.id}`} className="flex-1 cursor-pointer font-medium">
                        {pm.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Was ist das Problem?</h2>
                  <p className="text-sm text-muted-foreground">Wähle den Problemtyp, der am besten zu deiner Situation passt.</p>
                </div>
                <RadioGroup
                  value={formData.problemType}
                  onValueChange={(val) => setFormData({ ...formData, problemType: val })}
                  className="space-y-2"
                  data-testid="radio-problem-type"
                >
                  {PROBLEM_TYPES.map((pt) => (
                    <div
                      key={pt.id}
                      className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${
                        formData.problemType === pt.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <RadioGroupItem value={pt.id} id={`pt-${pt.id}`} />
                      <Label htmlFor={`pt-${pt.id}`} className="flex-1 cursor-pointer font-medium">
                        {pt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Details zum Händler</h2>
                  <p className="text-sm text-muted-foreground">Diese Angaben fließen direkt in deine Textvorlagen ein.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="merchantName">Händlername *</Label>
                    <Input
                      id="merchantName"
                      placeholder="z.B. Amazon, Zalando, ..."
                      value={formData.merchantName}
                      onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                      data-testid="input-merchant-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Betrag in EUR *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      data-testid="input-amount"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentDate">Zahlungsdatum *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      data-testid="input-payment-date"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="merchantCountry">Land des Händlers (optional)</Label>
                    <Input
                      id="merchantCountry"
                      placeholder="z.B. Deutschland, USA, ..."
                      value={formData.merchantCountry}
                      onChange={(e) => setFormData({ ...formData, merchantCountry: e.target.value })}
                      data-testid="input-merchant-country"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t space-y-4">
                  <div
                    className={`flex items-start space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${
                      formData.merchantContacted ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                    onClick={() => setFormData({ ...formData, merchantContacted: !formData.merchantContacted })}
                  >
                    <Checkbox
                      id="contacted"
                      checked={formData.merchantContacted}
                      onCheckedChange={(c) => setFormData({ ...formData, merchantContacted: Boolean(c) })}
                      data-testid="checkbox-merchant-contacted"
                    />
                    <div>
                      <Label htmlFor="contacted" className="font-medium cursor-pointer">
                        Ich habe den Händler bereits kontaktiert
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Vorheriger Kontakt stärkt deine Chargeback-Position deutlich.
                      </p>
                    </div>
                  </div>
                  {formData.merchantContacted && (
                    <div className="space-y-1.5">
                      <Label htmlFor="response">Was hat der Händler geantwortet?</Label>
                      <Textarea
                        id="response"
                        rows={3}
                        placeholder="Händler hat abgelehnt / nicht geantwortet / Rückerstattung versprochen aber nicht gezahlt ..."
                        value={formData.merchantResponse}
                        onChange={(e) => setFormData({ ...formData, merchantResponse: e.target.value })}
                        data-testid="textarea-merchant-response"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Welche Beweise hast du?</h2>
                  <p className="text-sm text-muted-foreground">
                    Mehr Beweise = stärkere Position. Wähle alle zutreffenden aus.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {EVIDENCE_OPTIONS.map((ev) => (
                    <div
                      key={ev.id}
                      className={`flex items-start space-x-3 border-2 p-3.5 rounded-xl cursor-pointer transition-all ${
                        formData.evidence.includes(ev.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                      onClick={() => toggleEvidence(ev.id)}
                    >
                      <Checkbox
                        id={ev.id}
                        checked={formData.evidence.includes(ev.id)}
                        onCheckedChange={() => toggleEvidence(ev.id)}
                        data-testid={`checkbox-evidence-${ev.id}`}
                      />
                      <Label htmlFor={ev.id} className="flex-1 cursor-pointer leading-snug font-medium text-sm">
                        {ev.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.evidence.filter((e) => e !== "none").length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {formData.evidence.filter((e) => e !== "none").length} Beweis
                    {formData.evidence.filter((e) => e !== "none").length !== 1 ? "e" : ""} ausgewählt — gut!
                  </div>
                )}
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Was ist passiert?</h2>
                  <p className="text-sm text-muted-foreground">
                    Je detaillierter deine Beschreibung, desto präziser und stärker werden die generierten Textvorlagen.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Textarea
                    rows={7}
                    placeholder="Beschreibe den Vorfall konkret: Wann bestellt? Wann bezahlt? Was wurde geliefert/nicht geliefert? Wie hat der Händler reagiert? Gibt es Fristen oder Zusagen?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="textarea-description"
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Tipp: Nenne konkrete Daten, Beträge und Reaktionen des Händlers.
                    </p>
                    <span
                      className={`text-xs font-medium ${formData.description.length >= 20 ? "text-emerald-600" : "text-muted-foreground"}`}
                    >
                      {formData.description.length} Zeichen
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> KI-Analyse mit Gemini
                  </p>
                  <p>
                    Deine Angaben werden von Gemini AI analysiert, um eine realistische Einschätzung und professionelle
                    Textvorlagen zu generieren. Die Analyse dauert ca. 10–20 Sekunden.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 6 — RESULT */}
            {step === 6 && (
              <div className="space-y-8">
                {!result ? (
                  <div className="py-16 text-center flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <Shield className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-1">KI-Analyse läuft</h2>
                      <p className="text-muted-foreground text-sm max-w-xs">
                        Gemini analysiert deinen Fall und erstellt maßgeschneiderte Textvorlagen für maximalen Erfolg...
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                      {["Falldetails auswerten", "Rechtslage prüfen", "Textvorlagen generieren"].map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin flex-shrink-0"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="text-center pb-2">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
                        <TrendingUp className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Deine Fall-Analyse</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Powered by Gemini AI — {new Date().toLocaleDateString("de-DE")}
                      </p>
                    </div>

                    {/* SUCCESS PROBABILITY GAUGE */}
                    {analysis && (
                      <ProbabilityGauge
                        probability={analysis.successProbability}
                        label={analysis.successProbabilityLabel}
                      />
                    )}

                    {/* URGENCY BANNER */}
                    {analysis?.urgencyLevel === "hoch" && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
                        <Siren className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Dringlich — Frist beachten!</p>
                          <p>{analysis.deadline}</p>
                        </div>
                      </div>
                    )}
                    {analysis?.urgencyLevel === "mittel" && (
                      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                        <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Fristhinweis</p>
                          <p>{analysis.deadline}</p>
                        </div>
                      </div>
                    )}

                    {/* SUMMARY + REASONING */}
                    {analysis && (
                      <div className="space-y-4">
                        <div className="border rounded-xl p-5">
                          <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Fallzusammenfassung
                          </h3>
                          <p className="text-sm leading-relaxed">{analysis.summary}</p>
                        </div>
                        <div className="border rounded-xl p-5">
                          <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                            <Scale className="w-4 h-4 text-primary" />
                            Begründung der Einschätzung
                          </h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">{analysis.reasoning}</p>
                        </div>
                      </div>
                    )}

                    {/* EMPFOHLENE KATEGORIE */}
                    {analysis?.recommendedCategory && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                            Empfohlene Streitkategorie
                          </p>
                          <p className="font-bold text-sm">{analysis.recommendedCategory}</p>
                        </div>
                      </div>
                    )}

                    {/* RECHTLICHE GRUNDLAGE */}
                    {analysis?.legalBasis && analysis.legalBasis.length > 0 && (
                      <div className="border rounded-xl p-5">
                        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-primary" />
                          Rechtliche Grundlagen
                        </h3>
                        <ul className="space-y-2">
                          {analysis.legalBasis.map((basis, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{basis}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* FEHLENDE BEWEISE */}
                    {analysis?.missingEvidence && analysis.missingEvidence.length > 0 && (
                      <div className="border rounded-xl p-5">
                        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Fehlende Beweise — jetzt sichern
                        </h3>
                        <ul className="space-y-2">
                          {analysis.missingEvidence.map((ev, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* NÄCHSTE SCHRITTE */}
                    {analysis?.nextSteps && analysis.nextSteps.length > 0 && (
                      <div className="border rounded-xl p-5">
                        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-primary" />
                          Empfohlene nächste Schritte
                        </h3>
                        <ol className="space-y-3">
                          {analysis.nextSteps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* MÖGLICHE GEGENARGUMENTE */}
                    {analysis?.counterarguments && analysis.counterarguments.length > 0 && (
                      <div className="border rounded-xl p-5">
                        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          Mögliche Gegenargumente — und wie du sie entkräftest
                        </h3>
                        <ul className="space-y-3">
                          {analysis.counterarguments.map((arg, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 border rounded-lg px-3 py-2.5">
                              <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                              <span>{arg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* TEXTVORLAGEN */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-3">Deine professionellen Textvorlagen</h3>
                      <p className="text-sm text-muted-foreground">
                        KI-generiert, auf deinen Fall zugeschnitten. Bitte vor dem Versenden auf Vollständigkeit prüfen und ggf.
                        anpassen.
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

                    {/* PREMIUM CTA */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
                      <div className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        Premium
                      </div>
                      <h3 className="font-bold text-lg">Druckfertiger PDF-Bericht</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Erhalte alle Vorlagen als formatiertes PDF, erweiterte rechtliche Argumentation und
                        Gerichtsbarkeitsanalyse für 7,99 EUR.
                      </p>
                      <Button className="w-full sm:w-auto" data-testid="button-premium-unlock">
                        Premium freischalten — 7,99 €
                      </Button>
                    </div>

                    {/* DISCLAIMER */}
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-4 leading-relaxed">
                      {analysis?.disclaimer}
                    </div>

                    {/* RESET */}
                    <div className="text-center border-t pt-6">
                      <Button variant="outline" onClick={resetForm} data-testid="button-new-case">
                        Neuen Fall prüfen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NAV BUTTONS */}
            {step < 6 && (
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="gap-2"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </Button>
                {step < 5 ? (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !formData.paymentMethod) ||
                      (step === 2 && !formData.problemType)
                    }
                    className="gap-2"
                    data-testid="button-next"
                  >
                    Weiter
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={formData.description.length < 20}
                    className="gap-2"
                    data-testid="button-analyze"
                  >
                    <Shield className="w-4 h-4" />
                    Fall analysieren
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
