import { getAdminToken } from "@/lib/admin-api";

type WizardSnapshot = {
  paymentMethod?: string;
  problemType?: string;
  merchantCountry?: string;
  merchantContacted?: boolean;
  merchantResponseType?: string;
  evidence?: string[];
  evidenceStatus?: Record<string, "have" | "later" | "missing">;
  validationError?: string;
  missingRequired?: string[];
  durationMs?: number;
  qualityScore?: number;
};

const VISITOR_ID_KEY = "cbp_visitor_id_v1";
const VISITOR_ID_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type StoredVisitorId =
  | string
  | {
      id?: string;
      createdAt?: number;
    };

function getVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) {
      const parsed = JSON.parse(existing) as StoredVisitorId;
      const id = typeof parsed === "string" ? parsed : parsed.id;
      const createdAt = typeof parsed === "string" ? 0 : parsed.createdAt;
      if (id && createdAt && Date.now() - createdAt < VISITOR_ID_TTL_MS) return id;
      if (id && !createdAt) {
        localStorage.setItem(VISITOR_ID_KEY, JSON.stringify({ id, createdAt: Date.now() }));
        return id;
      }
    }
    const next =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_ID_KEY, JSON.stringify({ id: next, createdAt: Date.now() }));
    return next;
  } catch {
    try {
      const next =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_ID_KEY, JSON.stringify({ id: next, createdAt: Date.now() }));
      return next;
    } catch {
      return undefined;
    }
  }
}

function postJson(path: string, payload: unknown) {
  if (typeof window === "undefined") return;
  if (isLocalAuditHost()) return;
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

function isLocalAuditHost() {
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  );
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
    | "checkout_click"
    | "validation_error"
    | "wizard_abandon"
    | "step_duration",
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
      merchantCountry: snapshot.merchantCountry,
      merchantContacted: snapshot.merchantContacted,
      merchantResponseType: snapshot.merchantResponseType,
      evidence: snapshot.evidence,
      evidenceStatus: snapshot.evidenceStatus,
      validationError: snapshot.validationError,
      missingRequired: snapshot.missingRequired,
      durationMs: snapshot.durationMs,
      qualityScore: snapshot.qualityScore,
    },
  });
}
