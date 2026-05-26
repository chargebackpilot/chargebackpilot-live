import { useState, useEffect } from "react";
import { Check, CheckCircle2, Copy, Sparkles, FileText, Lock as LockIcon, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LOADING_STEPS, KNOWN_MERCHANTS, Question } from "./wizard-constants";

export function GeneratorLoader({ merchantName }: { merchantName: string }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  const facts = [
    "Wusstest du? Bei Visa lautet der Chargeback-Grund für nicht gelieferte Ware 'Reason Code 13.1'.",
    "Händler zahlen bei einem verlorenen Chargeback oft hohe Strafgebühren an die Bank — deshalb lenken sie bei professionellen Anträgen oft schnell ein.",
    "PayPals Käuferschutz greift bis zu 180 Tage nach Zahlung. Kreditkarten bieten meist 120 Tage.",
    "Wusstest du? Auch für nicht geliefertes Essen (z.B. Lieferando) kannst du über PayPal dein Geld zurückholen, wenn der Support sich querstellt.",
    "Flug gecancelt? Steuern und Flughafengebühren müssen laut EU-Recht immer erstattet werden, selbst wenn du das Ticket stornierst.",
    "Mastercard nennt den Chargeback-Grund für fehlerhafte Ware 'Reason Code 4853'. Mit dieser Nennung im Brief zeigst du direkt Fachwissen.",
    "Abofalle? Kreditkartenunternehmen verbieten versteckte Abos. Du kannst Abbuchungen der letzten Monate oft problemlos zurückholen.",
    "Tipp: Die bloße Androhung eines Chargebacks (Rückbuchung) wirkt beim Händler oft Wunder.",
    "Wusstest du? Wenn ein Hotelzimmer Schimmel hat oder völlig anders aussieht als auf den Fotos, gilt das als 'nicht erbrachte Leistung'."
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setCompletedSteps([0]), 7000);
    const t2 = setTimeout(() => setCompletedSteps([0, 1]), 15000);
    const t3 = setTimeout(() => {
      setCompletedSteps([0, 1, 2]);
      setTimeout(() => setAllDone(true), 600);
    }, 23000);

    const fInterval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % facts.length);
    }, 5000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(fInterval); };
  }, []);

  return (
    <div className="py-12 text-center flex flex-col items-center gap-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-8 h-8 text-primary" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">KI-Generator arbeitet</h2>
        <p className="text-muted-foreground text-sm">
          {merchantName ? `Fall gegen ${merchantName} wird erstellt...` : "Generierung läuft..."}
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
          Vorlagen erstellt — Ergebnisse laden...
        </div>
      )}

      {!allDone && (
        <div className="mt-4 max-w-sm mx-auto bg-muted/30 border rounded-xl p-4 text-xs text-muted-foreground animate-in fade-in duration-500">
          <div className="font-semibold text-primary mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Wusstest du schon?
          </div>
          <p key={factIndex} className="animate-in fade-in slide-in-from-bottom-1 duration-300 min-h-[40px] flex items-center justify-center">
            {facts[factIndex]}
          </p>
        </div>
      )}
    </div>
  );
}

export function StrategyIndicator({ label }: { label: string }) {
  const l = (label ?? "").toLowerCase();
  const band =
    l === "hoch"
      ? { name: "Aussichtsreich", desc: "Gute Ausgangslage. Mit den richtigen Schritten und Belegen hast du solide Chancen auf eine Rückerstattung.", tone: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", accent: "bg-emerald-500", dotsActive: 3 } }
      : l === "mittel"
        ? { name: "Solide Ausgangslage", desc: "Mittlere Position. Fehlende Belege können deine Aussichten noch deutlich verbessern.", tone: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", accent: "bg-amber-500", dotsActive: 2 } }
        : { name: "Anspruchsvoll", desc: "Schwieriger Fall. Zuerst fehlende Beweise sichern, dann gezielt vorgehen — wir geben dir die Strategie dazu.", tone: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800", accent: "bg-rose-500", dotsActive: 1 } };

  return (
    <div className={`rounded-2xl border-2 ${band.tone.border} ${band.tone.bg} p-5 sm:p-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
            Strategie-Einschätzung
          </p>
          <h3 className={`text-2xl sm:text-3xl font-black ${band.tone.text} mb-2 leading-tight`}>
            {band.name}
          </h3>
          {/* qualitative 3-dot scale */}
          <div className="flex items-center gap-1.5 mb-3" aria-label={`Stärke-Indikator ${band.tone.dotsActive} von 3`}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-2 w-10 rounded-full ${i < band.tone.dotsActive ? band.tone.accent : "bg-black/10"}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{band.desc}</p>
          <p className="text-[11px] text-muted-foreground italic mt-2">
            Indikative Einschätzung der KI · keine Garantie auf den Verfahrensausgang
          </p>
        </div>
      </div>
    </div>
  );
}

export function LockedTeaser({ icon, title, lines = 3 }: { icon: React.ReactNode; title: string; lines?: number }) {
  return (
    <div className="relative border rounded-xl p-5 overflow-hidden">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
        <LockIcon className="w-3 h-3" />
        Gesperrt
      </div>
      <h3 className="font-bold text-base mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2 select-none pointer-events-none" style={{ filter: "blur(6px)" }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded" style={{ width: `${70 + ((i * 7) % 25)}%` }} />
        ))}
        <div className="h-3 bg-muted rounded w-2/5 mt-1" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
    </div>
  );
}

export function CopyableTemplate({ title, icon, text, onCopy }: { title: string; icon: React.ReactNode; text: string; onCopy: () => void }) {
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

export function MerchantQuickSelect({ problemType, onSelect, selected }: { problemType: string; onSelect: (name: string) => void; selected: string }) {
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

export function Paywall({ onUnlock, isPaying }: { onUnlock: () => void; isPaying: boolean }) {
  return (
    <div className="absolute inset-0 z-10 rounded-2xl flex items-center justify-center p-4">
      <div className="text-center">
        <Button size="lg" className="text-base h-12 shadow-lg gap-2" onClick={onUnlock} disabled={isPaying}>
          {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Für 0,99 € freischalten"}
        </Button>
        <div className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1.5 mt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          Einmalig · kein Abo · sofort verfügbar
        </div>
      </div>
    </div>
  );
}

export function ContentLocker({ hasUnlocked, onUnlock, isPaying, children }: { hasUnlocked: boolean; onUnlock: () => void; isPaying: boolean; children: React.ReactNode }) {
  if (hasUnlocked) return <>{children}</>;
  return (
    <div className="relative">
      <div className="blur-[3px]">{children}</div>
      <Paywall onUnlock={onUnlock} isPaying={isPaying} />
    </div>
  );
}

export function QuestionField({
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
