import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useEffect,
  useLayoutEffect,
  useState,
  Suspense,
  lazy,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { applyStandardSeoHead } from "@/components/SeoHead";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getRouteMeta } from "@/seo-routes";

// Route chunks stay lazy for PageSpeed, but public routes no longer render skeleton fallbacks.
// This keeps the first bundle small while avoiding visible skeleton loading on public pages.
function lazyWithPreload<T extends ComponentType<any>>(loader: () => Promise<{ default: T }>) {
  const Component = lazy(loader) as LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };
  Component.preload = loader;
  return Component;
}

const loadWizard = () => import("@/pages/Wizard");
const loadSeoPages = () => import("@/pages/SEOPages");

const LazyToaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster }))
);
const RatgeberIndex = lazyWithPreload(() => import("@/pages/RatgeberIndex"));
const MerchantProblemPage = lazyWithPreload(() => import("@/pages/MerchantProblemPage"));
const MerchantIndexPage = lazyWithPreload(() => import("@/pages/MerchantIndexPage"));
const ScamShopsPage = lazyWithPreload(() => import("@/pages/ScamShopsPage"));
const ComparePage = lazyWithPreload(() => import("@/pages/ComparePage"));
const Impressum = lazyWithPreload(() =>
  import("@/pages/LegalPages").then((m) => ({ default: m.Impressum }))
);
const Datenschutz = lazyWithPreload(() =>
  import("@/pages/LegalPages").then((m) => ({ default: m.Datenschutz }))
);
const UeberUns = lazyWithPreload(() =>
  import("@/pages/LegalPages").then((m) => ({ default: m.UeberUns }))
);
const Methodik = lazyWithPreload(() =>
  import("@/pages/LegalPages").then((m) => ({ default: m.Methodik }))
);
const Disclaimer = lazyWithPreload(() =>
  import("@/pages/LegalPages").then((m) => ({ default: m.Disclaimer }))
);
const AGB = lazyWithPreload(() => import("@/pages/LegalPages").then((m) => ({ default: m.AGB })));
const Widerruf = lazyWithPreload(() =>
  import("@/pages/LegalPages").then((m) => ({ default: m.Widerruf }))
);
const PayPalSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.PayPalSEO })));
const AmexSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.AmexSEO })));
const VisaMastercardSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.VisaMastercardSEO }))
);
const KlarnaSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.KlarnaSEO })));
const FlugSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.FlugSEO })));
const KiwiSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.KiwiSEO })));
const LieferandoSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.LieferandoSEO }))
);
const WoltSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.WoltSEO })));
const UberEatsSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.UberEatsSEO })));
const WareNichtErhaltenSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.WareNichtErhaltenSEO }))
);
const AboFalleSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.AboFalleSEO })));
const ChargebackAntragVorlageSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.ChargebackAntragVorlageSEO }))
);
const PayPalKaeuferschutzVorlageSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.PayPalKaeuferschutzVorlageSEO }))
);
const KlarnaReklamationVorlageSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.KlarnaReklamationVorlageSEO }))
);
const WareNichtErhaltenMusterbriefSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.WareNichtErhaltenMusterbriefSEO }))
);
const AboFalleMusterbriefSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.AboFalleMusterbriefSEO }))
);
const RueckerstattungHaendlerVorlageSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.RueckerstattungHaendlerVorlageSEO }))
);
const VisaReasonCodeSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.VisaReasonCodeSEO }))
);
const MastercardReasonCodeSEO = lazyWithPreload(() =>
  loadSeoPages().then((m) => ({ default: m.MastercardReasonCodeSEO }))
);
const Wizard = lazyWithPreload(loadWizard);
const Admin = lazyWithPreload(() => import("@/pages/Admin"));
const AdminDemo = lazyWithPreload(() => import("@/pages/AdminDemo"));

type PreloadableRoute = ReturnType<typeof lazyWithPreload>;

const seoRoutePreloads: Record<string, PreloadableRoute> = {
  "/paypal-chargeback": PayPalSEO,
  "/amex-chargeback": AmexSEO,
  "/visa-mastercard-chargeback": VisaMastercardSEO,
  "/klarna-reklamation": KlarnaSEO,
  "/flug-chargeback": FlugSEO,
  "/kiwi-rueckerstattung": KiwiSEO,
  "/lieferando-rueckerstattung": LieferandoSEO,
  "/wolt-rueckerstattung": WoltSEO,
  "/ubereats-rueckerstattung": UberEatsSEO,
  "/ware-nicht-erhalten": WareNichtErhaltenSEO,
  "/abo-falle-chargeback": AboFalleSEO,
  "/chargeback-antrag-vorlage": ChargebackAntragVorlageSEO,
  "/paypal-kaeuferschutz-vorlage": PayPalKaeuferschutzVorlageSEO,
  "/klarna-reklamation-vorlage": KlarnaReklamationVorlageSEO,
  "/ware-nicht-erhalten-musterbrief": WareNichtErhaltenMusterbriefSEO,
  "/abo-falle-musterbrief": AboFalleMusterbriefSEO,
  "/rueckerstattung-haendler-vorlage": RueckerstattungHaendlerVorlageSEO,
  "/visa-reason-code-13-1": VisaReasonCodeSEO,
  "/mastercard-chargeback-reason-code": MastercardReasonCodeSEO,
};

const legalRoutePreloads: Record<string, PreloadableRoute> = {
  "/impressum": Impressum,
  "/datenschutz": Datenschutz,
  "/ueber-uns": UeberUns,
  "/methodik": Methodik,
  "/disclaimer": Disclaimer,
  "/agb": AGB,
  "/widerruf": Widerruf,
};

function normalizeRoutePath(pathname: string) {
  const cleanPath = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return cleanPath || "/";
}

function preloadComponent(component: PreloadableRoute) {
  return component.preload().then(
    () => undefined,
    () => undefined
  );
}

export function preloadRouteForPath(pathname: string) {
  const route = normalizeRoutePath(pathname);
  const exactRoute = seoRoutePreloads[route] ?? legalRoutePreloads[route];
  if (exactRoute) return preloadComponent(exactRoute);
  if (route === "/ratgeber") return preloadComponent(RatgeberIndex);
  if (route === "/scam-shops-2026") return preloadComponent(ScamShopsPage);
  if (route === "/vergleich/paypal-vs-kreditkarte-vs-klarna") return preloadComponent(ComparePage);
  if (route === "/vorlagen-generator") return preloadComponent(Wizard);
  if (route === "/admin") return preloadComponent(Admin);
  if (route === "/admin/demo") return preloadComponent(AdminDemo);
  if (route.startsWith("/hilfe/")) {
    return preloadComponent(route.split("/").length >= 4 ? MerchantProblemPage : MerchantIndexPage);
  }
  return Promise.resolve();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function ScrollToTop() {
  const [pathname] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

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

function RouteHeadSync() {
  const [pathname] = useLocation();

  useIsomorphicLayoutEffect(() => {
    const meta = getRouteMeta(pathname);
    if (!meta) return;

    applyStandardSeoHead({
      title: meta.title,
      description: meta.description,
      canonical: meta.canonical ?? meta.path,
      noindex: meta.noindex,
    });
  }, [pathname]);

  return null;
}

function RouteChunkPreloader() {
  useEffect(() => {
    const getInternalPath = (event: Event) => {
      if (!(event.target instanceof Element)) return null;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      const href = anchor?.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return null;
      }

      try {
        const url = new URL(href, window.location.origin);
        return url.origin === window.location.origin ? url.pathname : null;
      } catch {
        return null;
      }
    };

    const preloadFromEvent = (event: Event) => {
      const path = getInternalPath(event);
      if (path) void preloadRouteForPath(path);
    };

    document.addEventListener("pointerover", preloadFromEvent, { capture: true, passive: true });
    document.addEventListener("touchstart", preloadFromEvent, { capture: true, passive: true });
    document.addEventListener("focusin", preloadFromEvent, { capture: true });

    return () => {
      document.removeEventListener("pointerover", preloadFromEvent, { capture: true });
      document.removeEventListener("touchstart", preloadFromEvent, { capture: true });
      document.removeEventListener("focusin", preloadFromEvent, { capture: true });
    };
  }, []);

  return null;
}

function RouteShellFallback() {
  const [pathname] = useLocation();
  const isWizard = pathname === "/vorlagen-generator";
  const isGuide =
    pathname === "/ratgeber" ||
    pathname.includes("chargeback") ||
    pathname.includes("rueckerstattung") ||
    pathname.includes("reklamation") ||
    pathname.includes("ware-nicht-erhalten") ||
    pathname.includes("abo-falle") ||
    pathname.startsWith("/hilfe/") ||
    pathname.startsWith("/vergleich/") ||
    pathname === "/scam-shops-2026";

  if (isWizard) {
    return (
      <div
        className="container mx-auto max-w-5xl py-10 px-4 animate-pulse"
        aria-busy="true"
        aria-label="Vorlagen-Generator wird geladen"
      >
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <div className="h-8 w-52 rounded-lg bg-muted mb-2" />
              <div className="h-4 w-24 rounded bg-muted mb-6" />
              <div className="space-y-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${i === 0 ? "bg-primary/10 border border-primary/20" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full ${i === 0 ? "bg-primary/25" : "bg-muted"}`}
                    />
                    <div
                      className={`h-4 rounded bg-muted ${i === 2 ? "w-24" : i === 3 ? "w-32" : "w-36"}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border bg-muted/50 p-3">
                <div className="h-4 w-32 rounded bg-muted mb-2" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-4/5 rounded bg-muted mt-1.5" />
              </div>
            </div>
          </aside>
          <div>
            <div className="lg:hidden mb-6 space-y-3">
              <div className="h-8 w-56 rounded-lg bg-muted" />
              <div className="h-4 w-44 rounded bg-muted" />
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-1/5 bg-primary/30 rounded-full" />
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 sm:p-8 pb-24 lg:pb-8 shadow-sm min-h-[520px] lg:min-h-[560px]">
              <div className="h-7 w-60 rounded-lg bg-muted mb-2" />
              <div className="h-4 w-80 max-w-full rounded bg-muted mb-6" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 h-[58px] rounded-xl border-2 border-border bg-background px-4"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                    <div
                      className={`h-4 rounded bg-muted ${i === 0 ? "w-28" : i === 1 ? "w-36" : i === 2 ? "w-44" : "w-32"}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t flex justify-between">
                <div className="h-10 w-24 rounded-md bg-muted" />
                <div className="h-10 w-28 rounded-md bg-primary/25" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isGuide) {
    return (
      <div
        className="container mx-auto max-w-5xl py-12 px-4"
        aria-busy="true"
        aria-label="Ratgeber wird geladen"
      >
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/10" />
          <div className="mx-auto h-10 w-80 max-w-full rounded bg-muted mb-4" />
          <div className="mx-auto h-6 w-[32rem] max-w-full rounded bg-muted" />
        </div>
        <div className="mb-16">
          <div className="h-8 w-52 rounded bg-muted mb-5" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-36 rounded-xl border bg-card" />
            <div className="h-36 rounded-xl border bg-card" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return <div className="min-h-[60vh] bg-background" aria-hidden="true" />;
}

const withAdminSuspense = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={<RouteShellFallback />}>
    <Component {...props} />
  </Suspense>
);

const withoutSkeleton = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={null}>
    <Component {...props} />
  </Suspense>
);

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/vorlagen-generator">
        {() => (
          <Suspense fallback={<RouteShellFallback />}>
            <Wizard key={location} />
          </Suspense>
        )}
      </Route>
      <Route path="/ratgeber" component={withoutSkeleton(RatgeberIndex)} />
      <Route path="/admin" component={withAdminSuspense(Admin)} />
      <Route path="/admin/demo" component={withAdminSuspense(AdminDemo)} />

      {/* Legal Pages */}
      <Route path="/impressum" component={withoutSkeleton(Impressum)} />
      <Route path="/datenschutz" component={withoutSkeleton(Datenschutz)} />
      <Route path="/ueber-uns" component={withoutSkeleton(UeberUns)} />
      <Route path="/methodik" component={withoutSkeleton(Methodik)} />
      <Route path="/disclaimer" component={withoutSkeleton(Disclaimer)} />
      <Route path="/agb" component={withoutSkeleton(AGB)} />
      <Route path="/widerruf" component={withoutSkeleton(Widerruf)} />

      {/* SEO Landing Pages */}
      <Route path="/paypal-chargeback" component={withoutSkeleton(PayPalSEO)} />
      <Route path="/amex-chargeback" component={withoutSkeleton(AmexSEO)} />
      <Route path="/visa-mastercard-chargeback" component={withoutSkeleton(VisaMastercardSEO)} />
      <Route path="/klarna-reklamation" component={withoutSkeleton(KlarnaSEO)} />
      <Route path="/flug-chargeback" component={withoutSkeleton(FlugSEO)} />
      <Route path="/kiwi-rueckerstattung" component={withoutSkeleton(KiwiSEO)} />
      <Route path="/lieferando-rueckerstattung" component={withoutSkeleton(LieferandoSEO)} />
      <Route path="/wolt-rueckerstattung" component={withoutSkeleton(WoltSEO)} />
      <Route path="/ubereats-rueckerstattung" component={withoutSkeleton(UberEatsSEO)} />
      <Route path="/ware-nicht-erhalten" component={withoutSkeleton(WareNichtErhaltenSEO)} />
      <Route path="/abo-falle-chargeback" component={withoutSkeleton(AboFalleSEO)} />
      <Route
        path="/chargeback-antrag-vorlage"
        component={withoutSkeleton(ChargebackAntragVorlageSEO)}
      />
      <Route
        path="/paypal-kaeuferschutz-vorlage"
        component={withoutSkeleton(PayPalKaeuferschutzVorlageSEO)}
      />
      <Route
        path="/klarna-reklamation-vorlage"
        component={withoutSkeleton(KlarnaReklamationVorlageSEO)}
      />
      <Route
        path="/ware-nicht-erhalten-musterbrief"
        component={withoutSkeleton(WareNichtErhaltenMusterbriefSEO)}
      />
      <Route path="/abo-falle-musterbrief" component={withoutSkeleton(AboFalleMusterbriefSEO)} />
      <Route
        path="/rueckerstattung-haendler-vorlage"
        component={withoutSkeleton(RueckerstattungHaendlerVorlageSEO)}
      />
      <Route path="/visa-reason-code-13-1" component={withoutSkeleton(VisaReasonCodeSEO)} />
      <Route
        path="/mastercard-chargeback-reason-code"
        component={withoutSkeleton(MastercardReasonCodeSEO)}
      />

      {/* Programmatic merchant SEO */}
      <Route
        path="/hilfe/:merchantSlug/:problemSlug"
        component={withoutSkeleton(MerchantProblemPage)}
      />
      <Route path="/hilfe/:merchantSlug" component={withoutSkeleton(MerchantIndexPage)} />

      {/* Trust / scam ratgeber */}
      <Route path="/scam-shops-2026" component={withoutSkeleton(ScamShopsPage)} />

      {/* Comparison */}
      <Route
        path="/vergleich/paypal-vs-kreditkarte-vs-klarna"
        component={withoutSkeleton(ComparePage)}
      />

      <Route component={NotFound} />
    </Switch>
  );
}

interface AppProps {
  ssrPath?: string;
}

function App({ ssrPath }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} ssrPath={ssrPath}>
          <div className="min-h-screen flex flex-col font-sans bg-background">
            <RouteHeadSync />
            <RouteChunkPreloader />
            <Navbar />
            <main className="flex-1">
              <ScrollToTop />
              <Router />
            </main>
            <Footer />
          </div>
        </WouterRouter>
        <IdleToaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
