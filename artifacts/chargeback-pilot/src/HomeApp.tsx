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
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const schedule =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) => window.setTimeout(cb, 1200) as unknown as number);
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = schedule(() => setEnabled(true), { timeout: 2500 });
    return () => cancel(id as number);
  }, []);

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
