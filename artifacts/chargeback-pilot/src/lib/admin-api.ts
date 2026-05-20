const STORAGE_KEY = "cbp_admin_pwd";

export function getAdminPassword(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminPassword(pw: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, pw);
  } catch {
    /* ignore */
  }
}

export function clearAdminPassword() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const pw = getAdminPassword();
  const headers = new Headers(init.headers);
  if (pw) headers.set("x-admin-password", pw);
  headers.set("Content-Type", "application/json");
  const res = await fetch(`/api/admin${path}`, { ...init, headers });
  if (res.status === 401) {
    clearAdminPassword();
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
    setAdminPassword(password);
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
  adminFetch<{ cases: AdminCaseRow[]; count: number }>(`/cases?limit=${limit}${onlyPaid ? "&paid=1" : ""}`);
