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
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Copy, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_METHODS = [
  { id: "paypal", label: "PayPal" },
  { id: "visa_mastercard", label: "Kreditkarte Visa/Mastercard" },
  { id: "amex", label: "American Express" },
  { id: "klarna", label: "Klarna" },
  { id: "apple_google_pay", label: "Apple Pay / Google Pay" },
  { id: "bank_transfer", label: "Banküberweisung" },
  { id: "other", label: "Sonstiges" }
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
  { id: "other", label: "Sonstiges" }
];

const EVIDENCE_OPTIONS = [
  { id: "receipt", label: "Zahlungsnachweis" },
  { id: "order_confirmation", label: "Bestellbestätigung" },
  { id: "email_thread", label: "E-Mail-Verlauf" },
  { id: "chat_screenshot", label: "Chat-Screenshots" },
  { id: "photos", label: "Fotos/Videos" },
  { id: "tracking", label: "Tracking / Sendungsverfolgung" },
  { id: "cancellation", label: "Stornierungsbestätigung" },
  { id: "refund_promise", label: "Refund-Zusage" },
  { id: "tos", label: "AGB/Screenshots" },
  { id: "none", label: "Keine Beweise vorhanden" }
];

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    paymentMethod: "",
    problemType: "",
    merchantName: "",
    amount: "",
    paymentDate: "",
    merchantCountry: "",
    merchantContacted: false,
    merchantResponse: "",
    evidence: [],
    description: ""
  });
  
  const createCase = useCreateCase();
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    setStep(6);
    createCase.mutate({
      data: {
        paymentMethod: formData.paymentMethod || "other",
        problemType: formData.problemType || "other",
        merchantName: formData.merchantName || "Unbekannt",
        amount: Number(formData.amount) || 0,
        paymentDate: formData.paymentDate || new Date().toISOString().split('T')[0],
        merchantCountry: formData.merchantCountry,
        merchantContacted: formData.merchantContacted,
        merchantResponse: formData.merchantResponse,
        evidence: formData.evidence,
        description: formData.description || "Keine Beschreibung"
      }
    }, {
      onSuccess: (data) => {
        setResult(data);
      },
      onError: () => {
        toast({
          title: "Fehler",
          description: "Dein Fall konnte nicht analysiert werden. Bitte versuche es erneut.",
          variant: "destructive"
        });
        setStep(5);
      }
    });
  };

  const toggleEvidence = (id: string) => {
    if (id === "none") {
      setFormData({ ...formData, evidence: ["none"] });
      return;
    }
    const newEvidence = formData.evidence.includes(id)
      ? formData.evidence.filter((e: string) => e !== id)
      : [...formData.evidence.filter((e: string) => e !== "none"), id];
    setFormData({ ...formData, evidence: newEvidence });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopiert", description: "Text wurde in die Zwischenablage kopiert." });
  };

  const resetForm = () => {
    setStep(1);
    setResult(null);
    setFormData({
      paymentMethod: "", problemType: "", merchantName: "", amount: "", paymentDate: "",
      merchantCountry: "", merchantContacted: false, merchantResponse: "", evidence: [], description: ""
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-12 px-4">
        {step < 6 && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Fall prüfen</h1>
            <Progress value={(step / 6) * 100} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">Schritt {step} von 5</p>
          </div>
        )}

        <Card>
          <CardContent className="p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Wie hast du bezahlt?</h2>
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={(val) => setFormData({...formData, paymentMethod: val})}
                  className="space-y-3"
                >
                  {PAYMENT_METHODS.map(pm => (
                    <div key={pm.id} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={pm.id} id={pm.id} />
                      <Label htmlFor={pm.id} className="flex-1 cursor-pointer">{pm.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Was ist das Problem?</h2>
                <RadioGroup 
                  value={formData.problemType} 
                  onValueChange={(val) => setFormData({...formData, problemType: val})}
                  className="space-y-3"
                >
                  {PROBLEM_TYPES.map(pt => (
                    <div key={pt.id} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={pt.id} id={pt.id} />
                      <Label htmlFor={pt.id} className="flex-1 cursor-pointer">{pt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Details zum Händler</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="merchantName">Händlername</Label>
                    <Input id="merchantName" value={formData.merchantName} onChange={(e) => setFormData({...formData, merchantName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Betrag in EUR</Label>
                    <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Zahlungsdatum</Label>
                    <Input id="paymentDate" type="date" value={formData.paymentDate} onChange={(e) => setFormData({...formData, paymentDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchantCountry">Land des Händlers (optional)</Label>
                    <Input id="merchantCountry" value={formData.merchantCountry} onChange={(e) => setFormData({...formData, merchantCountry: e.target.value})} />
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="contacted" checked={formData.merchantContacted} onCheckedChange={(c) => setFormData({...formData, merchantContacted: c})} />
                    <Label htmlFor="contacted">Ich habe den Händler bereits kontaktiert</Label>
                  </div>
                  {formData.merchantContacted && (
                    <div className="space-y-2">
                      <Label htmlFor="response">Was hat der Händler geantwortet?</Label>
                      <Textarea id="response" rows={3} value={formData.merchantResponse} onChange={(e) => setFormData({...formData, merchantResponse: e.target.value})} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Welche Beweise hast du?</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {EVIDENCE_OPTIONS.map(ev => (
                    <div key={ev.id} className="flex items-start space-x-2 border p-3 rounded-lg">
                      <Checkbox 
                        id={ev.id} 
                        checked={formData.evidence.includes(ev.id)}
                        onCheckedChange={() => toggleEvidence(ev.id)}
                      />
                      <Label htmlFor={ev.id} className="flex-1 cursor-pointer leading-snug">{ev.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Beschreibe kurz, was passiert ist</h2>
                <div className="space-y-2">
                  <Textarea 
                    rows={6}
                    placeholder="Erzähle uns in ein paar Sätzen von dem Vorfall..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    Mindestens 20 Zeichen
                  </p>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-8">
                {!result ? (
                  <div className="py-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Dein Fall wird analysiert</h2>
                    <p className="text-muted-foreground">Unsere KI prüft deine Angaben und erstellt die passenden Vorlagen...</p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl font-bold">Fall-Analyse abgeschlossen</h2>
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${
                      result.analysis.strength === 'stark' ? 'border-green-500 bg-green-50' : 
                      result.analysis.strength === 'mittel' ? 'border-yellow-500 bg-yellow-50' : 
                      'border-red-500 bg-red-50'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">Erfolgschance: {result.analysis.strengthLabel}</h3>
                      </div>
                      <p className="mb-4">{result.analysis.summary}</p>
                      <h4 className="font-semibold text-sm mb-1">Begründung:</h4>
                      <p className="text-sm">{result.analysis.reasoning}</p>
                    </div>

                    {result.analysis.missingEvidence?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          Fehlende Beweise
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {result.analysis.missingEvidence.map((ev: string, i: number) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <ArrowRight className="w-5 h-5 text-primary" />
                        Empfohlene nächste Schritte
                      </h3>
                      <ul className="space-y-2">
                        {result.analysis.nextSteps.map((step: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm bg-muted/50 p-3 rounded-md">
                            <span className="font-bold text-primary">{i+1}.</span> {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b pb-2">Deine Textvorlagen</h3>
                      
                      {result.analysis.merchantTemplate && (
                        <div className="border rounded-xl overflow-hidden">
                          <div className="bg-muted px-4 py-3 border-b flex justify-between items-center">
                            <span className="font-semibold text-sm">Anschreiben Händler</span>
                            <Button size="sm" variant="ghost" className="h-8 gap-2" onClick={() => copyToClipboard(result.analysis.merchantTemplate)}>
                              <Copy className="w-4 h-4" /> Kopieren
                            </Button>
                          </div>
                          <div className="p-4 bg-background whitespace-pre-wrap text-sm font-mono">
                            {result.analysis.merchantTemplate}
                          </div>
                        </div>
                      )}

                      {result.analysis.bankTemplate && (
                        <div className="border rounded-xl overflow-hidden">
                          <div className="bg-muted px-4 py-3 border-b flex justify-between items-center">
                            <span className="font-semibold text-sm">Anschreiben Bank/PayPal</span>
                            <Button size="sm" variant="ghost" className="h-8 gap-2" onClick={() => copyToClipboard(result.analysis.bankTemplate)}>
                              <Copy className="w-4 h-4" /> Kopieren
                            </Button>
                          </div>
                          <div className="p-4 bg-background whitespace-pre-wrap text-sm font-mono">
                            {result.analysis.bankTemplate}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center space-y-4">
                      <h3 className="font-bold">Brauchst du mehr Details?</h3>
                      <p className="text-sm text-muted-foreground">Der Premium-Bericht enthält eine detailliertere rechtliche Argumentation und ein druckfertiges PDF für die Post.</p>
                      <Button className="w-full sm:w-auto">Premium-Bericht freischalten (7,99 €)</Button>
                    </div>

                    <div className="text-center pt-8 border-t">
                      <Button variant="outline" onClick={resetForm}>Neuen Fall prüfen</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step < 6 && (
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  Zurück
                </Button>
                {step < 5 ? (
                  <Button onClick={handleNext}>
                    Weiter
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={formData.description.length < 20}
                  >
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
