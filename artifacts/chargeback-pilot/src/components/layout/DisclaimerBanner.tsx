import { ShieldAlert } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="bg-slate-100 px-4 py-2 border-b">
      <div className="container mx-auto max-w-7xl flex items-center justify-center gap-2 text-xs text-slate-700 text-center">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          <strong>Keine Rechtsberatung.</strong> ChargebackPilot bietet allgemeine Informationen und KI-gestützte Formulierungshilfe über die Gemini API von Google LLC.
        </span>
      </div>
    </div>
  );
}
