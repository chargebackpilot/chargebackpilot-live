const STORAGE_KEY = "cbp_admin_token";
const LEGACY_PASSWORD_STORAGE_KEY = "cbp_admin_pwd";

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
    sessionStorage.removeItem(LEGACY_PASSWORD_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_PASSWORD_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const getAdminPassword = getAdminToken;
export const clearAdminPassword = clearAdminToken;

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  const res = await fetch(`/api/admin${path}`, { ...init, headers });
  if (res.status === 401) {
    clearAdminToken();
    throw new Error("Nicht autorisiert");
  }
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || `Fehler ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (res.ok) {
    const json = (await res.json()) as { token?: string };
    if (!json.token) return false;
    setAdminToken(json.token);
    return true;
  }
  return false;
}

export interface AdminStats {
  totalCases: number;
  hiddenLegacyCases: number;
  visibleCasesSince: string;
  rangeDays: number;
  retentionMonths: number;
  analyticsRetentionMonths: number;
  paidCases: number;
  conversionRate: number;
  revenueEur: number;
  avgDisputedAmount: number;
  totalDisputedAmount: number;
  cases24h: number;
  cases7d: number;
  cases30d: number;
  paid24h: number;
  paid7d: number;
  byStrength: { strength: string; count: number }[];
  byPaymentMethod: { method: string; count: number }[];
  byProblemType: { type: string; count: number }[];
  dailySeries: { day: string; total: number; paid: number }[];
  traffic: {
    pageViews24h: number;
    pageViews7d: number;
    pageViews30d: number;
    visitors7d: number;
    visitors30d: number;
    pageViewsRange: number;
    visitorsRange: number;
    wizardStarts7d: number;
    wizardDrafts7d: number;
    analysisSubmits7d: number;
    analysisSuccesses7d: number;
    paywallViews7d: number;
    checkoutClicks7d: number;
  };
  topContentPages: {
    path: string;
    views: number;
    visitors: number;
    lastSeen: string;
  }[];
  latestWizardEvents: {
    eventType: string;
    createdAt: string;
    metadata: Record<string, unknown>;
  }[];
}

export interface AdminCaseRow {
  id: string;
  merchantName: string;
  paymentMethod: string;
  problemType: string;
  amount: number;
  paymentDate: string;
  successProbability: number;
  strength: string;
  paid: boolean;
  paidAt: string | null;
  createdAt: string;
}

export const getAdminStats = (days = 30) => adminFetch<AdminStats>(`/stats?days=${days}`);
export const getAdminCases = (onlyPaid = false, limit = 50) =>
  adminFetch<{ cases: AdminCaseRow[]; count: number }>(
    `/cases?limit=${limit}${onlyPaid ? "&paid=1" : ""}`
  );

export const anonymizeAdminCase = (id: string) =>
  adminFetch<{ ok: true; id: string }>(`/cases/${encodeURIComponent(id)}/anonymize`, {
    method: "POST",
    body: JSON.stringify({ confirm: "ANONYMIZE_CASE" }),
  });

export const deleteAdminCase = (id: string) =>
  adminFetch<{ ok: true; id: string }>(`/cases/${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: JSON.stringify({ confirm: "DELETE_CASE" }),
  });

export const anonymizeOldAdminCases = (execute = false) =>
  adminFetch<{
    ok: true;
    dryRun: boolean;
    eligibleCases?: number;
    anonymizedCases?: number;
    cutoff: string;
    retentionMonths: number;
  }>(`/maintenance/anonymize-old-cases${execute ? "?execute=1" : ""}`, {
    method: "POST",
    body: JSON.stringify(execute ? { confirm: "ANONYMIZE_OLD_CASES" } : {}),
  });
