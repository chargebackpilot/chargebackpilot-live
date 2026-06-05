import { Link } from "wouter";
import { lazy, Suspense, useEffect, useState } from "react";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { LogoLockup } from "../ui/Logo";
import { openNewWizardCase } from "@/lib/case-persistence";

const DeferredMyCasesWidget = lazy(() => import("../MyCasesWidget").then((m) => ({ default: m.MyCasesWidget })));

function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function IdleMyCasesWidget() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setEnabled(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <DeferredMyCasesWidget />
    </Suspense>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleNewCaseClick = () => {
    openNewWizardCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border md:bg-background/95 md:backdrop-blur md:supports-[backdrop-filter]:bg-background/60">
      <div className="hidden md:block"><DisclaimerBanner /></div>
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <LogoLockup size={30} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/ratgeber" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 h-9 inline-flex items-center">
            Ratgeber & Guides
          </Link>
          <IdleMyCasesWidget />
          <Link href="/vorlagen-generator?new=1" className="ml-1" onClick={(e) => { e.preventDefault(); handleNewCaseClick(); }}>
            <span className="inline-flex min-h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground border border-primary-border hover-elevate active-elevate-2">
              Vorlagen generieren
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </Link>
        </nav>

        {/* Mobile: cases widget + menu toggle */}
        <div className="md:hidden flex items-center gap-1">
          <IdleMyCasesWidget />
          <button className="p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Menü">
            {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <div className="flex flex-col gap-4">
            <Link href="/ratgeber" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
              Ratgeber & Guides
            </Link>
            <Link href="/vorlagen-generator?new=1" onClick={(e) => { e.preventDefault(); setIsOpen(false); handleNewCaseClick(); }}>
              <span className="inline-flex min-h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground border border-primary-border hover-elevate active-elevate-2">
                Vorlagen generieren
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
