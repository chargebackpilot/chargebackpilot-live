import { getAdminToken } from "@/lib/admin-api";

type WizardSnapshot = {
  paymentMethod?: string;
  problemType?: string;
  merchantName?: string;
  purchaseAmount?: string | number;
  disputedAmount?: string | number;
  paymentDate?: string;
  merchantCountry?: string;
  merchantContacted?: boolean;
  merchantResponseType?: string;
  evidence?: string[];
};

const VISITOR_ID_KEY = "cbp_visitor_id_v1";

function getVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const next =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_ID_KEY, next);
    return next;
  } catch {
    return undefined;
  }
}

function postJson(path: string, payload: unknown) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify(payload);
  const blob = new Blob([body], { type: "application/json" });
  if (navigator.sendBeacon?.(path, blob)) return;
  void fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* best-effort analytics */
  });
}

function shouldSkipTracking(pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  return Boolean(getAdminToken());
}

export function trackPageView(pathname: string, title: string) {
  if (shouldSkipTracking(pathname)) return;
  postJson("/api/analytics/page-view", {
    path: pathname,
    title,
    visitorId: getVisitorId(),
  });
}

export function trackWizardEvent(
  eventType:
    | "wizard_step"
    | "wizard_draft"
    | "analysis_submit"
    | "analysis_success"
    | "paywall_view"
    | "checkout_click",
  step: number,
  snapshot: WizardSnapshot
) {
  if (shouldSkipTracking(window.location.pathname)) return;
  postJson("/api/analytics/wizard-event", {
    eventType,
    step,
    visitorId: getVisitorId(),
    data: {
      paymentMethod: snapshot.paymentMethod,
      problemType: snapshot.problemType,
      merchantName: snapshot.merchantName,
      purchaseAmount: snapshot.purchaseAmount,
      disputedAmount: snapshot.disputedAmount,
      paymentDate: snapshot.paymentDate,
      merchantCountry: snapshot.merchantCountry,
      merchantContacted: snapshot.merchantContacted,
      merchantResponseType: snapshot.merchantResponseType,
      evidence: snapshot.evidence,
    },
  });
}
