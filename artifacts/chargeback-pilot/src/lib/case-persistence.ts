const CURRENT_CASE_KEY = "cbp_current_case_v2";
const CASE_LIST_KEY = "cbp_case_list_v1";
const DRAFT_KEY = "cbp_wizard_draft_v1";
const UNLOCKED_CASE_IDS_KEY = "cbp_unlocked_case_ids_v1";
const FLATRATE_KEY = "cbp_flatrate_v1";
const MAX_CASES = 20;
export const CASE_STORAGE_CHANGED_EVENT = "cbp:case-storage-changed";
export const CASE_NAVIGATION_EVENT = "cbp:case-navigation";
export const PENDING_PAYWALL_SCROLL_KEY = "cbp_pending_paywall_scroll_v1";

function notifyCaseStorageChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CASE_STORAGE_CHANGED_EVENT));
}

// ---------------------------------------------------------------------------
// Per-case unlock tracking
// Unlock is bound to a specific caseId. A stale "hasUnlocked" flag from
// an earlier case cannot bypass payment for a new one.
// ---------------------------------------------------------------------------
interface UnlockEntry {
  caseId: string;
  unlockedAt: string;
}

function loadUnlockedSet(): UnlockEntry[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_CASE_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UnlockEntry[];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const fresh = parsed.filter((e) => new Date(e.unlockedAt).getTime() > cutoff);
    if (fresh.length !== parsed.length) {
      localStorage.setItem(UNLOCKED_CASE_IDS_KEY, JSON.stringify(fresh));
    }
    return fresh;
  } catch {
    return [];
  }
}

export function isCaseUnlocked(caseId: string | undefined | null): boolean {
  if (!caseId) return false;
  return loadUnlockedSet().some((e) => e.caseId === caseId);
}

export function markCaseIdUnlocked(caseId: string): void {
  if (!caseId) return;
  try {
    const set = loadUnlockedSet();
    if (set.some((e) => e.caseId === caseId)) return;
    set.push({ caseId, unlockedAt: new Date().toISOString() });
    const trimmed = set.slice(-50);
    localStorage.setItem(UNLOCKED_CASE_IDS_KEY, JSON.stringify(trimmed));
    notifyCaseStorageChanged();
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Full case persistence — saves entire wizard state so user can return
// (e.g. after Stripe cancel) and pick up exactly where they left off.
// ---------------------------------------------------------------------------
export interface PersistedCase {
  caseId: string;
  merchantName: string;
  amount: number;
  paymentMethod: string;
  problemType: string;
  paymentDate: string;
  successProbability: number;
  successProbabilityLabel: string;
  createdAt: string;
  /** Full server response (result with analysis). Stored unknown — caller casts. */
  result: unknown;
  /** Full form data from wizard. Stored unknown — caller casts. */
  formData: unknown;
}

function loadCaseList(): PersistedCase[] {
  try {
    const raw = localStorage.getItem(CASE_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedCase[];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const fresh = parsed.filter((c) => new Date(c.createdAt).getTime() > cutoff);
    if (fresh.length !== parsed.length) {
      localStorage.setItem(CASE_LIST_KEY, JSON.stringify(fresh));
    }
    return fresh;
  } catch {
    return [];
  }
}

function writeCaseList(list: PersistedCase[]): void {
  try {
    const trimmed = list.slice(0, MAX_CASES);
    localStorage.setItem(CASE_LIST_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore quota errors */
  }
}

/** Saves the case as the current case AND upserts it into the multi-case list. */
export function saveCurrentCase(c: PersistedCase): void {
  try {
    localStorage.setItem(CURRENT_CASE_KEY, JSON.stringify(c));
  } catch {
    /* ignore quota errors */
  }
  try {
    const list = loadCaseList();
    const idx = list.findIndex((e) => e.caseId === c.caseId);
    if (idx >= 0) {
      list[idx] = c;
    } else {
      list.unshift(c);
    }
    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    writeCaseList(list);
    notifyCaseStorageChanged();
  } catch {
    /* ignore */
  }
}

export function loadCurrentCase(): PersistedCase | null {
  try {
    const raw = localStorage.getItem(CURRENT_CASE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedCase;
    const age = Date.now() - new Date(parsed.createdAt).getTime();
    if (age > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(CURRENT_CASE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearCurrentCase(): void {
  try {
    localStorage.removeItem(CURRENT_CASE_KEY);
    notifyCaseStorageChanged();
  } catch {
    /* ignore */
  }
}

export function clearCurrentCaseSelection(): void {
  clearCurrentCase();
}

function navigateTo(path: string): void {
  const target = new URL(path, window.location.origin);
  if (target.origin !== window.location.origin) {
    window.location.assign(target.href);
    return;
  }

  const nextPath = `${target.pathname}${target.search}${target.hash}`;
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextPath !== currentPath) {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  window.dispatchEvent(new CustomEvent(CASE_NAVIGATION_EVENT, { detail: { path: nextPath } }));
}

export function openNewWizardCase(): void {
  clearCurrentCaseSelection();
  navigateTo("/vorlagen-generator?new=1");
}

export function openSavedCase(caseId: string): void {
  if (!caseId) return;
  setCurrentCaseById(caseId);
  navigateTo(`/vorlagen-generator?caseId=${encodeURIComponent(caseId)}`);
}

export function openCurrentCasePaywall(): void {
  const cases = listSavedCases();
  const current = loadCurrentCase();
  const candidates = [...cases, ...(current ? [current] : [])].filter((c, index, list) => {
    if (!c.result) return false;
    return list.findIndex((entry) => entry.caseId === c.caseId) === index;
  });
  const lastAnalyzed =
    candidates.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0] ?? null;

  if (!lastAnalyzed?.caseId) {
    openNewWizardCase();
    return;
  }

  setCurrentCaseById(lastAnalyzed.caseId);
  try {
    sessionStorage.setItem(PENDING_PAYWALL_SCROLL_KEY, lastAnalyzed.caseId);
  } catch {
    /* ignore */
  }
  navigateTo(
    `/vorlagen-generator?caseId=${encodeURIComponent(lastAnalyzed.caseId)}&scroll=paywall`
  );
}

/** Lists all saved cases, newest first, filtered to the last 90 days. */
export function listSavedCases(): PersistedCase[] {
  return loadCaseList();
}

export function loadCaseById(caseId: string): PersistedCase | null {
  if (!caseId) return null;
  return loadCaseList().find((c) => c.caseId === caseId) ?? null;
}

/** Promotes a saved case to be the active one (e.g. when user clicks it in the list). */
export function setCurrentCaseById(caseId: string): PersistedCase | null {
  const c = loadCaseById(caseId);
  if (!c) return null;
  try {
    localStorage.setItem(CURRENT_CASE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
  notifyCaseStorageChanged();
  return c;
}

export function removeSavedCase(caseId: string): void {
  if (!caseId) return;
  try {
    const list = loadCaseList().filter((c) => c.caseId !== caseId);
    writeCaseList(list);
    // If it was the current case, clear it too
    const cur = loadCurrentCase();
    if (cur && cur.caseId === caseId) {
      localStorage.removeItem(CURRENT_CASE_KEY);
    }
    notifyCaseStorageChanged();
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Flatrate ("Pilot Flat") — multiple case unlocks for N months
// ---------------------------------------------------------------------------
interface FlatrateEntry {
  purchasedAt: string;
  expiresAt: string;
  sessionId: string;
}

export function isFlatrateActive(): boolean {
  try {
    const raw = localStorage.getItem(FLATRATE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as FlatrateEntry;
    return new Date(parsed.expiresAt).getTime() > Date.now();
  } catch {
    return false;
  }
}

export function getFlatrateExpiry(): Date | null {
  try {
    const raw = localStorage.getItem(FLATRATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FlatrateEntry;
    const d = new Date(parsed.expiresAt);
    return d.getTime() > Date.now() ? d : null;
  } catch {
    return null;
  }
}

export function activateFlatrate(sessionId: string, durationMonths = 12): void {
  try {
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + durationMonths);
    const entry: FlatrateEntry = {
      purchasedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      sessionId,
    };
    localStorage.setItem(FLATRATE_KEY, JSON.stringify(entry));
    notifyCaseStorageChanged();
  } catch {
    /* ignore */
  }
}

export function clearFlatrate(): void {
  try {
    localStorage.removeItem(FLATRATE_KEY);
    notifyCaseStorageChanged();
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Wizard draft (work-in-progress before submission)
// ---------------------------------------------------------------------------
export function saveDraft(draft: unknown): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ data: draft, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function loadDraft<T>(): T | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; savedAt: number };
    if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
