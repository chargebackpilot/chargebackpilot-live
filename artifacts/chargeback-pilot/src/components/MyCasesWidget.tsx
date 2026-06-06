import { useEffect, useRef, useState } from "react";
import { Briefcase, Infinity as InfinityIcon } from "lucide-react";
import {
  CASE_STORAGE_CHANGED_EVENT,
  listSavedCases,
  isFlatrateActive,
  getFlatrateExpiry,
  type PersistedCase,
} from "@/lib/case-persistence";
import MyCasesMenuContent from "./MyCasesMenuContent";

const STORAGE_EVENT_KEYS = new Set([
  "cbp_case_list_v1",
  "cbp_current_case_v2",
  "cbp_flatrate_v1",
]);

const EMPTY_INITIAL_DATA = {
  cases: [] as PersistedCase[],
  flatActive: false,
  flatExpiry: null as Date | null,
};

function readStoredData() {
  if (typeof window === "undefined") return EMPTY_INITIAL_DATA;
  return {
    cases: listSavedCases(),
    flatActive: isFlatrateActive(),
    flatExpiry: getFlatrateExpiry(),
  };
}

export function MyCasesWidget() {
  const initialData = useRef(readStoredData()).current;
  const [cases, setCases] = useState<PersistedCase[]>(initialData.cases);
  const [flatActive, setFlatActive] = useState(initialData.flatActive);
  const [flatExpiry, setFlatExpiry] = useState<Date | null>(initialData.flatExpiry);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const refresh = () => {
    const next = readStoredData();
    setCases(next.cases);
    setFlatActive(next.flatActive);
    setFlatExpiry(next.flatExpiry);
  };

  useEffect(() => {
    refresh();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || STORAGE_EVENT_KEYS.has(e.key)) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(CASE_STORAGE_CHANGED_EVENT, refresh);

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CASE_STORAGE_CHANGED_EVENT, refresh);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const count = cases.length;

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className="relative inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
        aria-label={`Meine Fälle (${count})`}
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid="my-cases-trigger"
        onClick={() => {
          refresh();
          setOpen((value) => !value);
        }}
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
        <MyCasesMenuContent
          cases={cases}
          count={count}
          flatActive={flatActive}
          flatExpiry={flatExpiry}
          onClose={() => setOpen(false)}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
