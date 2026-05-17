import { Link, useLocation } from "wouter";
import { Plane, ShieldAlert, BookOpen, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DisclaimerBanner } from "./DisclaimerBanner";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const isHome = location === "/";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <DisclaimerBanner />
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Plane className="w-6 h-6 rotate-45" />
          <span>ChargebackPilot</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/ratgeber" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Ratgeber & Guides
          </Link>
          <Link href="/fall-pruefen">
            <Button size="sm" className="gap-2">
              Fall kostenlos prüfen
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </nav>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <div className="flex flex-col gap-4">
            <Link href="/ratgeber" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
              Ratgeber & Guides
            </Link>
            <Link href="/fall-pruefen" onClick={() => setIsOpen(false)}>
              <Button className="w-full gap-2">
                Fall kostenlos prüfen
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
