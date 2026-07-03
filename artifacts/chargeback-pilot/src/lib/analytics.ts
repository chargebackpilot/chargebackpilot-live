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
  ctaId?: string;
  targetPath?: string;
  sourcePath?: string;
  landingPath?: string;
  referrerHost?: string;
};

const VISITOR_ID_KEY = "cbp_visitor_id_v1";
const VISITOR_ID_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ATTRIBUTION_KEY = "cbp_attribution_v1";
const ATTRIBUTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type StoredVisitorId =
  | string
  | {
      id?: string;
      createdAt?: number;
    };

type StoredAttribution = {
  landingPath?: string;
  sourcePath?: string;
  ctaId?: string;
  referrerHost?: string;
  createdAt?: number;
};

function sanitizePath(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    const path = value.startsWith("http") ? new URL(value).pathname : value.split("?")[0];
    if (!path.startsWith("/")) return undefined;
    if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/assets")) {
      return undefined;
    }
    return path.replace(/\/$/, "") || "/";
  } catch {
    return undefined;
  }
}

function getReferrerHost() {
  try {
    if (!document.referrer) return undefined;
    const referrer = new URL(document.referrer);
    if (referrer.hostname === window.location.hostname) return undefined;
    return referrer.hostname.slice(0, 120);
  } catch {
    return undefined;
  }
}

function readSourceParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    return sanitizePath(params.get("source"));
  } catch {
    return undefined;
  }
}

function getAttribution(): StoredAttribution {
  if (typeof window === "undefined") return {};
  const now = Date.now();
  const sourcePath = readSourceParam();
  try {
    const existingRaw = localStorage.getItem(ATTRIBUTION_KEY);
    const existing = existingRaw ? (JSON.parse(existingRaw) as StoredAttribution) : null;
    if (
      !sourcePath &&
      existing?.landingPath &&
      existing.createdAt &&
      now - existing.createdAt < ATTRIBUTION_TTL_MS
    ) {
      return existing;
    }

    const next: StoredAttribution = {
      landingPath: sourcePath ?? sanitizePath(window.location.pathname) ?? "/",
      sourcePath: existing?.sourcePath,
      ctaId: existing?.ctaId,
      referrerHost: existing?.referrerHost ?? getReferrerHost(),
      createdAt: now,
    };
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
    return next;
  } catch {
    return {
      landingPath: sourcePath ?? sanitizePath(window.location.pathname) ?? "/",
      referrerHost: getReferrerHost(),
      createdAt: now,
    };
  }
}

function saveAttribution(next: StoredAttribution) {
  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
  } catch {
    /* best-effort attribution */
  }
}

function pathOnly(value: string) {
  try {
    return new URL(value, window.location.origin).pathname.replace(/\/$/, "") || "/";
  } catch {
    return sanitizePath(value) ?? "/";
  }
}

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
  const attribution = getAttribution();
  postJson("/api/analytics/page-view", {
    path: pathname,
    title,
    visitorId: getVisitorId(),
    landingPath: attribution.landingPath,
    referrerHost: attribution.referrerHost,
  });
}

export function trackCtaClick(ctaId: string, target: string) {
  const sourcePath = sanitizePath(window.location.pathname) ?? "/";
  if (shouldSkipTracking(sourcePath)) return;
  const attribution = getAttribution();
  const nextAttribution = {
    ...attribution,
    sourcePath,
    ctaId: ctaId.slice(0, 80),
    createdAt: Date.now(),
  };
  saveAttribution(nextAttribution);
  postJson("/api/analytics/wizard-event", {
    eventType: "cta_click",
    visitorId: getVisitorId(),
    data: {
      ctaId: ctaId.slice(0, 80),
      targetPath: pathOnly(target),
      sourcePath,
      landingPath: nextAttribution.landingPath,
      referrerHost: nextAttribution.referrerHost,
    },
  });
}

export function trackWizardEvent(
  eventType:
    | "cta_click"
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
  const attribution = getAttribution();
  postJson("/api/analytics/wizard-event", {
    eventType,
    step,
    visitorId: getVisitorId(),
    data: {
      landingPath: snapshot.landingPath ?? attribution.landingPath,
      referrerHost: snapshot.referrerHost ?? attribution.referrerHost,
      sourcePath:
        snapshot.sourcePath ?? attribution.sourcePath ?? sanitizePath(window.location.pathname),
      ctaId: snapshot.ctaId ?? attribution.ctaId,
      targetPath: snapshot.targetPath,
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
