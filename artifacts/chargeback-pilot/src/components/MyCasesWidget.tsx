import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Infinity as InfinityIcon } from "lucide-react";
import {
  listSavedCases,
  isFlatrateActive,
  getFlatrateExpiry,
  type PersistedCase,
} from "@/lib/case-persistence";

const MyCasesMenuContent = lazy(() => import("./MyCasesMenuContent"));

const STORAGE_EVENT_KEYS = new Set([
  "cbp_case_list_v1",
  "cbp_current_case_v2",
  "cbp_flatrate_v1",
]);

// Synchronous initial data load for instant rendering (no flash)
function getInitialData() {
  return {
    cases: listSavedCases(),
    flatActive: isFlatrateActive(),
    flatExpiry: getFlatrateExpiry(),
  };
}

export function MyCasesWidget() {
  // Initialize with synchronous data - no loading state, instant render
  const initialData = useMemo(() => getInitialData(), []);
  const [cases, setCases] = useState<PersistedCase[]>(initialData.cases);
  const [flatActive, setFlatActive] = useState(initialData.flatActive);
  const [flatExpiry, setFlatExpiry] = useState<Date | null>(initialData.flatExpiry);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const refresh = () => {
    setCases(listSavedCases());
    setFlatActive(isFlatrateActive());
    setFlatExpiry(getFlatrateExpiry());
  };

  useEffect(() => {
    // No initial refresh needed - we already have sync data
    const onStorage = (e: StorageEvent) => {
      if (!e.key || STORAGE_EVENT_KEYS.has(e.key)) refresh();
    };
    window.addEventListener("storage", onStorage);

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);

    const warmMenuChunk = () => { void import("./MyCasesMenuContent"); };
    const warmupId = window.setTimeout(warmMenuChunk, 1200);

    // Light polling for same-tab updates after saveCurrentCase
    const id = window.setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("pointerdown", onPointerDown);
      window.clearTimeout(warmupId);
      window.clearInterval(id);
    };
  }, []);

  const count = cases.length;
  if (count === 0 && !flatActive) return null;

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className="relative inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
        aria-label={`Meine Fälle (${count})`}
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid="my-cases-trigger"
        onClick={() => setOpen((value) => !value)}
      >
        <Briefcase className="w-4 h-4" />
        <span className="hidden sm:inline">Meine Fälle</span>
        {count > 0 && (
          <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold inline-flex items-center justify-center">
            {count}
          </span>
        )}
        {flatActive && (
          <span className="hidden md:inline-flex items-center gap-0.5 ml-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
            <InfinityIcon className="w-3 h-3" />Flat
          </span>
        )}
      </button>

      {open && (
        <Suspense fallback={null}>
          <MyCasesMenuContent
            cases={cases}
            count={count}
            flatActive={flatActive}
            flatExpiry={flatExpiry}
            onClose={() => setOpen(false)}
            onRefresh={refresh}
          />
        </Suspense>
      )}
    </div>
  );
}
