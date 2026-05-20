import { useState } from "react";
import { ChevronDown, ChevronUp, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  n: number;
  title: string;
  detail: string;
  tip?: string;
  value?: string; // exact value to enter
}

const PAYPAL_STEPS: Step[] = [
  {
    n: 1,
    title: 'Öffne PayPal und gehe zu "Aktivitäten"',
    detail:
      'Logge dich auf paypal.com oder in der App ein. Klicke oben auf "Aktivitäten" (bzw. "Transaktionen" in der App). Suche die betreffende Zahlung anhand Datum und Betrag.',
    tip: "Screenshot der Transaktion jetzt machen — du brauchst ihn später.",
  },
  {
    n: 2,
    title: "Transaktion öffnen und Problem melden",
    detail:
      'Klicke auf die Transaktion. Scrolle nach unten und klicke auf "Ein Problem melden". Du landest direkt im Käuferschutz-Formular.',
  },
  {
    n: 3,
    title: "Kategorie wählen: Artikel erhalten, aber Beschreibung stimmt nicht — ODER — Artikel nicht erhalten",
    detail:
      'Wähle die passende Kategorie:\n• "Ich habe den Artikel nicht erhalten" — für nicht gelieferte Ware\n• "Ich habe einen Artikel erhalten, der erheblich von der Beschreibung abweicht" — für falsche/defekte Ware\n\nDiese Unterscheidung ist entscheidend für die Bearbeitungszeit.',
    value: "Artikel nicht erhalten / Erheblich von Beschreibung abweichend",
    tip: 'Wähle NIE "Nicht autorisierte Transaktion" wenn du die Zahlung selbst gemacht hast — das gilt als Missbrauch und kann zur Sperrung führen.',
  },
  {
    n: 4,
    title: "Streitfall eröffnen — Betrag und Beschreibung eingeben",
    detail:
      'Trage den streitigen Betrag ein (kann der volle oder ein Teilbetrag sein). Kopiere in das Textfeld die Vorlage aus dem "Chargeback-Antrag" oben — sie ist speziell für PayPal formuliert.',
    tip: "Je konkreter und sachlicher die Beschreibung, desto schneller wird entschieden.",
  },
  {
    n: 5,
    title: "Beweise hochladen",
    detail:
      'Lade alle vorhandenen Belege hoch:\n• Bestellbestätigung (E-Mail / Screenshot)\n• Kommunikation mit dem Händler\n• Fotos defekter Ware\n• Tracking-Nachweis falls vorhanden\n\nDateiformate: JPG, PNG, PDF. Maximal 10 MB pro Datei.',
    tip: "Mehrere Beweise = deutlich höhere Genehmigungsquote.",
  },
  {
    n: 6,
    title: "Streitfall absenden — 20-Tage-Frist beginnt",
    detail:
      'Klicke auf "Weiter" / "Absenden". PayPal benachrichtigt den Händler, der 10 Tage Zeit hat zu antworten. Danach hast du 10 weitere Tage, um den Fall in einen Antrag auf Rückbuchung umzuwandeln falls nötig.',
    tip: "Antworte auf jede PayPal-Nachricht innerhalb von 3 Tagen — sonst wird der Fall automatisch geschlossen.",
  },
  {
    n: 7,
    title: "Falls keine Einigung: In Antrag auf Rückbuchung umwandeln",
    detail:
      'Wenn der Händler nicht reagiert oder ablehnt: Gehe in den offenen Streitfall und klicke auf "In Antrag auf Rückbuchung umwandeln". PayPal entscheidet dann endgültig — meist innerhalb 30 Tage.',
    value: "In Antrag auf Rückbuchung umwandeln",
    tip: "Diese Eskalation muss innerhalb von 20 Tagen nach Eröffnung des Streitfalls erfolgen — verpass die Frist nicht!",
  },
];

const PROBLEM_STEPS: Record<string, Step[]> = {
  not_received: PAYPAL_STEPS.filter((s) => [1, 2, 3, 4, 5, 6, 7].includes(s.n)),
  food_delivery: [
    ...PAYPAL_STEPS.slice(0, 2),
    {
      n: 3,
      title: 'Kategorie: "Artikel erheblich von Beschreibung abweichend"',
      detail:
        'Bei Lieferdiensten wähle immer "Erheblich von der Beschreibung abweichend". Falsche Ware, Ungenießbares und fehlende Artikel fallen darunter.',
      value: "Artikel erheblich von Beschreibung abweichend",
      tip: "Lade Fotos des Problems hoch — bei Lieferdienstfällen sind Bilder der wichtigste Beweis.",
    },
    ...PAYPAL_STEPS.slice(3),
  ],
  defective: [
    ...PAYPAL_STEPS.slice(0, 2),
    {
      n: 3,
      title: 'Kategorie: "Erheblich von der Beschreibung abweichend"',
      detail:
        'Wähle "Artikel erheblich von der Beschreibung abweichend". Beschreibe den Mangel so konkret wie möglich: Modellnummer, was funktioniert nicht, seit wann.',
      value: "Artikel erheblich von Beschreibung abweichend",
      tip: "Fotos des Defekts sind bei dieser Kategorie besonders wichtig.",
    },
    ...PAYPAL_STEPS.slice(3),
  ],
};

function getStepsForProblem(problemType: string): Step[] {
  return PROBLEM_STEPS[problemType] ?? PAYPAL_STEPS;
}

interface PaypalGuideProps {
  problemType: string;
  merchantName: string;
  amount: number;
}

export function PaypalGuide({ problemType, merchantName, amount }: PaypalGuideProps) {
  const [expanded, setExpanded] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const steps = getStepsForProblem(problemType);
  const done = checkedSteps.size;
  const total = steps.length;

  const toggleStep = (n: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border-2 border-[#003087]/20 bg-gradient-to-b from-[#003087]/5 to-white overflow-hidden">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#003087]/5 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#003087] flex items-center justify-center text-white font-black text-base">
            P
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">PayPal Käuferschutz — Schritt für Schritt</p>
            <p className="text-xs text-muted-foreground">
              Klick-für-Klick Anleitung für {merchantName} · {amount.toFixed(2)} EUR
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {done > 0 && (
            <span className="text-xs font-bold text-[#003087] bg-[#003087]/10 px-2.5 py-1 rounded-full">
              {done}/{total} erledigt
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Progress bar */}
      {done > 0 && (
        <div className="px-5 pb-2">
          <div className="h-1.5 bg-[#003087]/10 rounded-full">
            <div
              className="h-1.5 bg-[#003087] rounded-full transition-all duration-500"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="h-px bg-border mb-4" />

          {/* Deadline warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
            <span className="font-bold flex-shrink-0">Wichtig:</span>
            <span>
              Der Käuferschutz-Antrag muss innerhalb von{" "}
              <strong>180 Tagen</strong> nach der Zahlung eingereicht werden.
              Streitfälle müssen innerhalb von <strong>20 Tagen</strong> in
              einen Rückbuchungsantrag umgewandelt werden.
            </span>
          </div>

          {steps.map((step) => {
            const checked = checkedSteps.has(step.n);
            return (
              <div
                key={step.n}
                className={`rounded-xl border-2 transition-all ${checked ? "border-emerald-300 bg-emerald-50/60" : "border-border bg-white"}`}
              >
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer select-none"
                  onClick={() => toggleStep(step.n)}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black transition-all ${
                      checked
                        ? "bg-emerald-500 text-white"
                        : "bg-[#003087]/10 text-[#003087]"
                    }`}
                  >
                    {checked ? <Check className="w-4 h-4 stroke-[3]" /> : step.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm leading-snug ${checked ? "line-through text-muted-foreground" : ""}`}>
                      {step.title}
                    </p>
                    {!checked && (
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-line">
                        {step.detail}
                      </p>
                    )}
                    {!checked && step.value && (
                      <div className="mt-2 bg-[#003087]/5 border border-[#003087]/20 rounded-lg px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#003087] mb-0.5">
                          Genau eingeben:
                        </p>
                        <p className="text-xs font-mono text-[#003087] font-medium">
                          "{step.value}"
                        </p>
                      </div>
                    )}
                    {!checked && step.tip && (
                      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-[11px] text-amber-800">
                        <span className="font-bold">Tipp: </span>
                        {step.tip}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {done === total && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center animate-in fade-in duration-300">
              <p className="text-emerald-800 font-bold text-sm">Alle Schritte erledigt!</p>
              <p className="text-emerald-700 text-xs mt-1">
                Dein Streitfall ist eingereicht. Halte dein PayPal-Postfach im Auge.
              </p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-[#003087] border-[#003087]/30 hover:bg-[#003087]/5"
            onClick={() =>
              window.open("https://www.paypal.com/disputes", "_blank")
            }
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Direkt zu PayPal Streitfällen
          </Button>
        </div>
      )}
    </div>
  );
}
