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
  paidCases: number;
  conversionRate: number;
  revenueEur: number;
  avgDisputedAmount: number;
  totalDisputedAmount: number;
  cases24h: number;
  cases7d: number;
  cases30d: number;
  paid24h: number;
  byStrength: { strength: string; count: number }[];
  byPaymentMethod: { method: string; count: number }[];
  byProblemType: { type: string; count: number }[];
  dailySeries: { day: string; total: number; paid: number }[];
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

export const getAdminStats = () => adminFetch<AdminStats>("/stats");
export const getAdminCases = (onlyPaid = false, limit = 50) =>
  adminFetch<{ cases: AdminCaseRow[]; count: number }>(
    `/cases?limit=${limit}${onlyPaid ? "&paid=1" : ""}`
  );
