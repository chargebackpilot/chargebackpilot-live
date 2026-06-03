import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Briefcase, Trash2, ArrowRight, Infinity as InfinityIcon } from "lucide-react";
import {
  listSavedCases,
  removeSavedCase,
  isFlatrateActive,
  getFlatrateExpiry,
  openNewWizardCase,
  openSavedCase,
  type PersistedCase,
} from "@/lib/case-persistence";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const STORAGE_EVENT_KEYS = new Set([
  "cbp_case_list_v1",
  "cbp_current_case_v2",
  "cbp_flatrate_v1",
]);

const PAYMENT_LABELS: Record<string, string> = {
  paypal: "PayPal",
  visa_mastercard: "Kreditkarte",
  amex: "Amex",
  klarna: "Klarna",
  apple_google_pay: "Apple/Google Pay",
  bank_transfer: "Überweisung",
  other: "Sonstiges",
};

const PROBLEM_LABELS: Record<string, string> = {
  not_received: "Ware nicht erhalten",
  defective: "Defekt / falsch",
  service_not_rendered: "Leistung nicht erbracht",
  flight_travel: "Flug / Reise",
  subscription: "Abo / Abbuchung",
  fraud: "Betrug",
  food_delivery: "Lieferdienst",
  other: "Sonstiges",
};

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "gerade eben";
  if (m < 60) return `vor ${m} Min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std`;
  const d = Math.floor(h / 24);
  if (d < 7) return `vor ${d} Tg`;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatExpiry(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function MyCasesWidget() {
  const [cases, setCases] = useState<PersistedCase[]>([]);
  const [flatActive, setFlatActive] = useState(false);
  const [flatExpiry, setFlatExpiry] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => {
    setCases(listSavedCases());
    setFlatActive(isFlatrateActive());
    setFlatExpiry(getFlatrateExpiry());
  };

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || STORAGE_EVENT_KEYS.has(e.key)) refresh();
    };
    // Refresh whenever the popover opens (covers same-tab updates)
    window.addEventListener("storage", onStorage);
    // Light polling for same-tab updates after saveCurrentCase
    const id = window.setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(id);
    };
  }, []);

  const count = cases.length;
  if (count === 0 && !flatActive) return null;

  const handleRemove = (caseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeSavedCase(caseId);
    refresh();
  };

  const handleNewCase = () => {
    setOpen(false);
    openNewWizardCase();
  };

  const handleOpenCase = (caseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    openSavedCase(caseId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
          aria-label={`Meine Fälle (${count})`}
          data-testid="my-cases-trigger"
        >
          <Briefcase className="w-4 h-4" />
          <span className="hidden sm:inline">Meine Fälle</span>
          {count > 0 && (
            <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold inline-flex items-center justify-center">
              {count}
            </span>
          )}
          {flatActive && (
            <span className="hidden md:inline-flex items-center gap-0.5 ml-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              <InfinityIcon className="w-3 h-3" />Flat
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0 overflow-hidden" align="end">
        <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Meine Fälle</h3>
            <span className="text-xs text-muted-foreground">{count} gespeichert</span>
          </div>
          {flatActive && flatExpiry && (
            <div className="mt-2 flex items-start gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md px-2 py-1.5">
              <InfinityIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-700" />
              <span>
                <strong>Flatrate aktiv</strong> — alle Fälle freigeschaltet bis{" "}
                <strong>{formatExpiry(flatExpiry)}</strong>.
              </span>
            </div>
          )}
        </div>

        {count === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Noch keine analysierten Fälle.
          </div>
        ) : (
          <ul className="max-h-[360px] overflow-y-auto divide-y">
            {cases.map((c) => {
              const merchant = c.merchantName || "Unbekannter Händler";
              const payLabel = PAYMENT_LABELS[c.paymentMethod] ?? c.paymentMethod;
              const probLabel = PROBLEM_LABELS[c.problemType] ?? c.problemType;
              return (
                <li key={c.caseId} className="group">
                  <Link
                    href={`/vorlagen-generator?caseId=${encodeURIComponent(c.caseId)}`}
                    onClick={(e) => handleOpenCase(c.caseId, e)}
                    className="flex items-start gap-2 px-4 py-3 hover:bg-muted/60 transition-colors"
                    data-testid={`case-item-${c.caseId}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{merchant}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {probLabel} · {payLabel} · {Number(c.amount).toFixed(2)} €
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {formatRelative(c.createdAt)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemove(c.caseId, e)}
                      className="p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
                      aria-label="Fall löschen"
                      data-testid={`case-remove-${c.caseId}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-muted-foreground self-center flex-shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="p-3 border-t bg-muted/20">
          <Link href="/vorlagen-generator?new=1" onClick={(e) => { e.preventDefault(); handleNewCase(); }}>
            <Button size="sm" className="w-full gap-2">
              Neuen Fall analysieren
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
