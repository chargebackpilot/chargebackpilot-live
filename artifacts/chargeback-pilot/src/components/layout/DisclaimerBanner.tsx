import { ShieldAlert } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="border-b bg-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
      <div className="container mx-auto flex max-w-7xl items-start justify-center gap-2 text-center text-[11px] leading-snug text-slate-700 sm:text-xs md:items-center dark:text-slate-300">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 md:mt-0 md:h-4 md:w-4" />
        <span>
          <strong>Keine Rechtsberatung.</strong> ChargebackPilot bietet allgemeine Informationen und
          KI-gestützte Formulierungshilfe über die Gemini API von Google LLC.
        </span>
      </div>
    </div>
  );
}
