import { Link, useLocation } from "wouter";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { LogoLockup } from "../ui/Logo";
import { openNewWizardCase } from "@/lib/case-persistence";
import { MyCasesWidget } from "../MyCasesWidget";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [pathname] = useLocation();
  const showDisclaimerBanner = pathname !== "/vorlagen-generator";

  const handleNewCaseClick = () => {
    openNewWizardCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border md:bg-background/95 md:backdrop-blur md:supports-[backdrop-filter]:bg-background/60">
      {showDisclaimerBanner && <div className="hidden md:block"><DisclaimerBanner /></div>}
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <LogoLockup size={30} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/ratgeber" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 h-9 inline-flex items-center">
            Ratgeber & Guides
          </Link>
          <MyCasesWidget />
          <Link href="/vorlagen-generator?new=1" className="ml-1" onClick={(e) => { e.preventDefault(); handleNewCaseClick(); }}>
            <Button size="sm" className="gap-2">
              Vorlagen generieren
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </nav>

        {/* Mobile: cases widget + menu toggle */}
        <div className="md:hidden flex items-center gap-1">
          <MyCasesWidget />
          <button className="p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Menü">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              <Button className="w-full gap-2">
                Vorlagen generieren
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
