import type { MouseEvent } from "react";
import { Link } from "wouter";
import { ArrowRight, Infinity as InfinityIcon, Trash2 } from "lucide-react";
import {
  openNewWizardCase,
  openSavedCase,
  removeSavedCase,
  type PersistedCase,
} from "@/lib/case-persistence";
import { Button } from "@/components/ui/button";

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
  fraud: "Verdacht",
  food_delivery: "Lieferdienst",
  other: "Sonstiges",
};

interface MyCasesMenuContentProps {
  cases: PersistedCase[];
  count: number;
  flatActive: boolean;
  flatExpiry: Date | null;
  onClose: () => void;
  onRefresh: () => void;
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "gerade eben";
  if (m < 60) return `vor ${m} Min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std`;
  const d = Math.floor(h / 24);
  if (d < 7) return `vor ${d} Tg`;
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatExpiry(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function MyCasesMenuContent({
  cases,
  count,
  flatActive,
  flatExpiry,
  onClose,
  onRefresh,
}: MyCasesMenuContentProps) {
  const handleRemove = (caseId: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeSavedCase(caseId);
    onRefresh();
  };

  const handleNewCase = (e: MouseEvent) => {
    e.preventDefault();
    onClose();
    openNewWizardCase();
  };

  const handleOpenCase = (caseId: string, e: MouseEvent) => {
    e.preventDefault();
    onClose();
    openSavedCase(caseId);
  };

  return (
    <div
      role="menu"
      className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none"
      data-testid="my-cases-menu"
    >
      <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Meine Fälle</h3>
          <span className="text-xs text-muted-foreground">{count} gespeichert</span>
        </div>
        {flatActive && flatExpiry && (
          <div className="mt-2 flex items-start gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md px-2 py-1.5">
            <InfinityIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-700" />
            <span>
              <strong>Flatrate aktiv</strong> — mehrere Fälle freigeschaltet bis{" "}
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
                  role="menuitem"
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
        <Link href="/vorlagen-generator?new=1" onClick={handleNewCase}>
          <Button size="sm" className="w-full gap-2">
            Neuen Fall analysieren
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
