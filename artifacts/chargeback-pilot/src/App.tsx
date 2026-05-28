import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import RatgeberIndex from "@/pages/RatgeberIndex";
import MerchantProblemPage from "@/pages/MerchantProblemPage";
import MerchantIndexPage from "@/pages/MerchantIndexPage";
import ScamShopsPage from "@/pages/ScamShopsPage";
import ComparePage from "@/pages/ComparePage";
import { Impressum, Datenschutz, AGB, Widerruf } from "@/pages/LegalPages";
import {
  PayPalSEO,
  AmexSEO,
  VisaMastercardSEO,
  KlarnaSEO,
  FlugSEO,
  KiwiSEO,
  LieferandoSEO,
  WoltSEO,
  UberEatsSEO,
  WareNichtErhaltenSEO,
  AboFalleSEO,
} from "@/pages/SEOPages";

// Lazy-loaded routes for better performance
const NotFound = lazy(() => import("@/pages/not-found"));
const Wizard = lazy(() => import("@/pages/Wizard"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminDemo = lazy(() => import("@/pages/AdminDemo"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollToTop() {
  const [pathname] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RouteMetaUpdater() {
  const [pathname] = useLocation();

  useEffect(() => {
    const origin = "https://chargebackpilot.de";
    const metaByPath: Array<{ match: RegExp; title: string; description: string }> = [
      {
        match: /^\/$/,
        title: "ChargebackPilot · KI-Hilfe für Chargeback, PayPal-Käuferschutz & Reklamation 2026",
        description:
          "Ware nicht erhalten, Flug ausgefallen, doppelt belastet? ChargebackPilot prüft deinen Fall mit KI in 60 Sekunden und liefert dir 3 fertige Textvorlagen.",
      },
      {
        match: /^\/vorlagen-generator$/,
        title: "Vorlagen-Generator · ChargebackPilot",
        description:
          "Erstelle in wenigen Schritten professionelle Reklamationsvorlagen für Händler, Bank/PayPal/Klarna und Eskalation.",
      },
      {
        match: /^\/ratgeber/,
        title: "Ratgeber & Guides zu Chargeback, Käuferschutz und Rückerstattung · ChargebackPilot",
        description:
          "Praxisnahe Anleitungen für PayPal, Kreditkarten-Chargeback, Klarna-Reklamation und typische Problemfälle im Onlinekauf.",
      },
      {
        match: /^\/(impressum|datenschutz|agb|widerruf)$/,
        title: "Rechtliche Informationen · ChargebackPilot",
        description:
          "Impressum, Datenschutz, AGB und Widerruf von ChargebackPilot. Transparent und aktuell für Nutzer in Deutschland.",
      },
      {
        match: /^\/(paypal-chargeback|amex-chargeback|visa-mastercard-chargeback|klarna-reklamation|flug-chargeback|kiwi-rueckerstattung|lieferando-rueckerstattung|wolt-rueckerstattung|ubereats-rueckerstattung|ware-nicht-erhalten|abo-falle-chargeback)$/,
        title: "Chargeback-Ratgeber 2026 · ChargebackPilot",
        description:
          "Konkrete Schritt-für-Schritt-Hilfen für Rückerstattung, Chargeback und Käuferschutz je nach Zahlungsart und Problemfall.",
      },
      {
        match: /^\/hilfe\//,
        title: "Händler-spezifische Hilfe bei Reklamationen · ChargebackPilot",
        description:
          "Konkrete Leitfäden zu typischen Problemen bei bekannten Händlern inklusive Beweis-Checkliste und Eskalationspfad.",
      },
      {
        match: /^\/vergleich\//,
        title: "Vergleich: PayPal vs Kreditkarte vs Klarna · ChargebackPilot",
        description:
          "Welcher Weg ist in deinem Fall am besten? Vergleich von Fristen, Erfolgschancen und Vorgehen bei Rückerstattungen.",
      },
    ];

    const current =
      metaByPath.find((m) => m.match.test(pathname)) ?? {
        title: "ChargebackPilot · Chargeback & Reklamationshilfe",
        description:
          "ChargebackPilot unterstützt dich mit KI-gestützter Formulierungshilfe für Rückerstattungen und Reklamationen.",
      };

    document.title = current.title;

    const upsertMeta = (name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const upsertOg = (property: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const canonicalUrl = `${origin}${pathname}`;
    upsertMeta("description", current.description);
    upsertMeta("twitter:title", current.title);
    upsertMeta("twitter:description", current.description);
    upsertOg("og:title", current.title);
    upsertOg("og:description", current.description);
    upsertOg("og:url", canonicalUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
  }, [pathname]);

  return null;
}

function DefaultSkeleton() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full bg-background pt-20 pb-20">
        <div className="container mx-auto px-4 w-full max-w-5xl animate-pulse">
          <div className="h-10 w-64 bg-muted rounded-lg mb-4" />
          <div className="h-5 w-full max-w-2xl bg-muted rounded mb-2" />
          <div className="h-5 w-4/5 max-w-xl bg-muted rounded mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full bg-background">
        <div className="bg-muted/50 py-12 px-4 border-b">
          <div className="container mx-auto max-w-3xl animate-pulse">
            <div className="h-9 w-3/4 bg-muted rounded-lg mb-5" />
            <div className="h-5 w-full bg-muted rounded mb-2" />
            <div className="h-5 w-2/3 bg-muted rounded" />
          </div>
        </div>
        <div className="container mx-auto max-w-3xl px-4 mt-10 animate-pulse space-y-6 pb-16">
          <div className="h-5 w-full bg-muted rounded" />
          <div className="h-5 w-11/12 bg-muted rounded" />
          <div className="h-5 w-10/12 bg-muted rounded" />
          <div className="h-5 w-9/12 bg-muted rounded" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function WizardSkeleton() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-muted/20">
      <Navbar />
      <main className="flex-1 w-full flex items-center justify-center p-4">
        <div className="w-full max-w-3xl animate-pulse">
          <div className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8 min-h-[380px]">
             <div className="h-7 w-1/3 bg-muted rounded mb-2" />
             <div className="h-4 w-1/2 bg-muted rounded mb-6" />
             <div className="space-y-3">
                <div className="h-14 bg-muted rounded-xl" />
                <div className="h-14 bg-muted rounded-xl" />
                <div className="h-14 bg-muted rounded-xl" />
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Wrapper for route-specific suspense
const withSuspense = (Component: React.ComponentType<any>, Fallback: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={<Fallback />}>
    <Component {...props} />
  </Suspense>
);

const prefetchers = {
  wizard: () => import("@/pages/Wizard"),
  admin: () => import("@/pages/Admin"),
  adminDemo: () => import("@/pages/AdminDemo"),
  notFound: () => import("@/pages/not-found"),
};

function RoutePrefetcher() {
  useEffect(() => {
    const run = () => {
      const jobs = [
        () => prefetchers.wizard(),
        () => prefetchers.admin(),
        () => prefetchers.adminDemo(),
        () => prefetchers.notFound(),
      ];
      let i = 0;
      const next = () => {
        if (i >= jobs.length) return;
        const job = jobs[i++];
        job().catch(() => void 0).finally(() => setTimeout(next, 120));
      };
      next();
    };

    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(run, { timeout: 1500 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = globalThis.setTimeout(run, 900);
    return () => globalThis.clearTimeout(t);
  }, []);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/vorlagen-generator" component={withSuspense(Wizard, WizardSkeleton)} />
      <Route path="/ratgeber" component={RatgeberIndex} />
      <Route path="/admin" component={withSuspense(Admin, DefaultSkeleton)} />
      <Route path="/admin/demo" component={withSuspense(AdminDemo, DefaultSkeleton)} />
      
      {/* Legal Pages */}
      <Route path="/impressum" component={Impressum} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/agb" component={AGB} />
      <Route path="/widerruf" component={Widerruf} />
      
      {/* SEO Landing Pages */}
      <Route path="/paypal-chargeback" component={PayPalSEO} />
      <Route path="/amex-chargeback" component={AmexSEO} />
      <Route path="/visa-mastercard-chargeback" component={VisaMastercardSEO} />
      <Route path="/klarna-reklamation" component={KlarnaSEO} />
      <Route path="/flug-chargeback" component={FlugSEO} />
      <Route path="/kiwi-rueckerstattung" component={KiwiSEO} />
      <Route path="/lieferando-rueckerstattung" component={LieferandoSEO} />
      <Route path="/wolt-rueckerstattung" component={WoltSEO} />
      <Route path="/ubereats-rueckerstattung" component={UberEatsSEO} />
      <Route path="/ware-nicht-erhalten" component={WareNichtErhaltenSEO} />
      <Route path="/abo-falle-chargeback" component={AboFalleSEO} />

      {/* Programmatic merchant SEO */}
      <Route path="/hilfe/:merchantSlug/:problemSlug" component={MerchantProblemPage} />
      <Route path="/hilfe/:merchantSlug" component={MerchantIndexPage} />

      {/* Trust / scam ratgeber */}
      <Route path="/scam-shops-2026" component={ScamShopsPage} />

      {/* Comparison */}
      <Route path="/vergleich/paypal-vs-kreditkarte-vs-klarna" component={ComparePage} />

      <Route component={withSuspense(NotFound, DefaultSkeleton)} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <ScrollToTop />
        <RouteMetaUpdater />
        <RoutePrefetcher />
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
