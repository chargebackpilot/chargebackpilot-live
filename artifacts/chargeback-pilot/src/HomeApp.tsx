import { Suspense, lazy, useEffect, useState } from "react";
import { Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { trackPageView } from "@/lib/analytics";

const LazyToaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster }))
);

function IdleToaster() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.has("flatrate_success") || params.has("flatrate_cancel");
  });

  useEffect(() => {
    if (enabled) return;
    const schedule =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) => window.setTimeout(cb, 8000) as unknown as number);
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const enable = () => setEnabled(true);
    const id = schedule(enable, { timeout: 10000 });
    window.addEventListener("pointerdown", enable, { once: true, passive: true });
    window.addEventListener("keydown", enable, { once: true });
    return () => {
      cancel(id as number);
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("keydown", enable);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <LazyToaster />
    </Suspense>
  );
}

function HomeAnalyticsTracker() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      trackPageView("/", document.title);
    }, 200);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}

function DocumentNavigationForHomeLinks() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === "/" && !url.search && !url.hash) return;

      event.preventDefault();
      event.stopPropagation();
      window.location.assign(url.href);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}

function HomeApp() {
  return (
    <ThemeProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} ssrPath="/">
        <div className="min-h-screen flex flex-col font-sans bg-background">
          <HomeAnalyticsTracker />
          <DocumentNavigationForHomeLinks />
          <Navbar />
          <main className="flex-1">
            <Home />
          </main>
          <Footer />
        </div>
      </WouterRouter>
      <IdleToaster />
    </ThemeProvider>
  );
}

export default HomeApp;
