import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Download, FileSignature, Sparkles } from "lucide-react";
import { generateLetterPdf, type LetterInput } from "@/lib/letter-pdf";
import { useToast } from "@/hooks/use-toast";

interface Props {
  defaultSubject: string;
  defaultBody: string;
  recipientCompany: string;
  amount: number;
  paymentDate: string;
  variant?: "merchant" | "bank" | "escalation";
}

export function LetterGenerator({
  defaultSubject,
  defaultBody,
  recipientCompany,
  amount,
  paymentDate,
  variant = "merchant",
}: Props) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderStreet, setSenderStreet] = useState("");
  const [senderZipCity, setSenderZipCity] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [city, setCity] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  const canGenerate = senderName.trim() && senderStreet.trim() && senderZipCity.trim();

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({
        title: "Absender unvollständig",
        description: "Bitte Name, Straße und PLZ/Ort ausfüllen.",
        variant: "destructive",
      });
      return;
    }
    const input: LetterInput = {
      sender: {
        name: senderName.trim(),
        street: senderStreet.trim(),
        zipCity: senderZipCity.trim(),
        email: senderEmail.trim() || undefined,
      },
      recipient: {
        company: recipientCompany,
      },
      subject: subject.trim(),
      body: body.trim(),
      orderNumber: orderNumber.trim() || undefined,
      customerNumber: customerNumber.trim() || undefined,
      transactionId: transactionId.trim() || undefined,
      amount,
      paymentDate,
      city: city.trim() || senderZipCity.split(" ").slice(-1)[0] || "Ort",
      filenameHint: `${variant}_${recipientCompany}`,
    };
    try {
      await generateLetterPdf(input);
      toast({
        title: "DIN-Brief erstellt",
        description: "Dein druckfertiger Brief wird heruntergeladen.",
      });
    } catch {
      toast({
        title: "PDF konnte nicht erstellt werden",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <FileSignature className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Daraus DIN-Brief erstellen</p>
            <p className="text-xs text-muted-foreground">
              Mit deinen Daten als druckfertige PDF — Briefkopf, Datum, Bezugszeichen, Unterschrift
            </p>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
      </button>
    );
  }

  return (
    <div className="border-2 border-primary/30 bg-primary/5 rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="w-4 h-4 text-primary" />
          <h4 className="font-bold text-sm">DIN-Brief erstellen</h4>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Schließen
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dein Absender</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`sn-${variant}`} className="text-xs">Vor- und Nachname *</Label>
            <Input id={`sn-${variant}`} value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Max Mustermann" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`se-${variant}`} className="text-xs">E-Mail (optional)</Label>
            <Input id={`se-${variant}`} type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="max@beispiel.de" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`ss-${variant}`} className="text-xs">Straße + Nr. *</Label>
            <Input id={`ss-${variant}`} value={senderStreet} onChange={(e) => setSenderStreet(e.target.value)} placeholder="Musterstraße 1" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`sz-${variant}`} className="text-xs">PLZ + Ort *</Label>
            <Input id={`sz-${variant}`} value={senderZipCity} onChange={(e) => setSenderZipCity(e.target.value)} placeholder="10115 Berlin" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Referenzen (optional, stärken den Brief)</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`on-${variant}`} className="text-xs">Bestell-Nr.</Label>
            <Input id={`on-${variant}`} value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="z.B. 12345" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`cn-${variant}`} className="text-xs">Kunden-Nr.</Label>
            <Input id={`cn-${variant}`} value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} placeholder="z.B. 987654" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`ti-${variant}`} className="text-xs">Transaktions-ID</Label>
            <Input id={`ti-${variant}`} value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="z.B. 1AB23456..." />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Brieftext</p>
        <div className="space-y-1">
          <Label htmlFor={`subj-${variant}`} className="text-xs">Betreff</Label>
          <Input id={`subj-${variant}`} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`body-${variant}`} className="text-xs">Hauptteil (kannst du anpassen)</Label>
          <Textarea id={`body-${variant}`} value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`city-${variant}`} className="text-xs">Ort (für Brief-Datumszeile)</Label>
          <Input id={`city-${variant}`} value={city} onChange={(e) => setCity(e.target.value)} placeholder="z.B. Berlin" />
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full gap-2">
        <Download className="w-4 h-4" />
        DIN-Brief als PDF herunterladen
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        Brief im DIN 5008 Format · druckfertig · Erstellt aus deinem ChargebackPilot-Fall
      </p>
    </div>
  );
}
