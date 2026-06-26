import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
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
import { trackPageView } from "@/lib/analytics";
import { getRouteMeta } from "@/seo-routes";

function lazyWithPreload<T extends ComponentType<any>>(loader: () => Promise<{ default: T }>) {
  const Component = lazy(loader) as LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };
  Component.preload = loader;
  return Component;
}

const loadWizardRoute = () => import("@/pages/WizardRoute");
const loadLegalPages = () => import("@/pages/LegalPages");
const loadSeoPages = () => import("@/pages/SEOPages");

const LazyToaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster }))
);
const WizardRoute = lazyWithPreload(loadWizardRoute);
const Admin = lazyWithPreload(() => import("@/pages/Admin"));
const RatgeberIndex = lazyWithPreload(() => import("@/pages/RatgeberIndex"));
const MerchantProblemPage = lazyWithPreload(() => import("@/pages/MerchantProblemPage"));
const MerchantIndexPage = lazyWithPreload(() => import("@/pages/MerchantIndexPage"));
const ScamShopsPage = lazyWithPreload(() => import("@/pages/ScamShopsPage"));
const ComparePage = lazyWithPreload(() => import("@/pages/ComparePage"));

function lazyNamed<T extends ComponentType<any>>(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string
) {
  return lazyWithPreload(() => loader().then((module) => ({ default: module[exportName] as T })));
}

const Impressum = lazyNamed(loadLegalPages, "Impressum");
const Datenschutz = lazyNamed(loadLegalPages, "Datenschutz");
const UeberUns = lazyNamed(loadLegalPages, "UeberUns");
const Methodik = lazyNamed(loadLegalPages, "Methodik");
const Disclaimer = lazyNamed(loadLegalPages, "Disclaimer");
const AGB = lazyNamed(loadLegalPages, "AGB");
const Widerruf = lazyNamed(loadLegalPages, "Widerruf");

const PayPalSEO = lazyNamed(loadSeoPages, "PayPalSEO");
const AmexSEO = lazyNamed(loadSeoPages, "AmexSEO");
const VisaMastercardSEO = lazyNamed(loadSeoPages, "VisaMastercardSEO");
const KlarnaSEO = lazyNamed(loadSeoPages, "KlarnaSEO");
const FlugSEO = lazyNamed(loadSeoPages, "FlugSEO");
const KiwiSEO = lazyNamed(loadSeoPages, "KiwiSEO");
const LieferandoSEO = lazyNamed(loadSeoPages, "LieferandoSEO");
const WoltSEO = lazyNamed(loadSeoPages, "WoltSEO");
const UberEatsSEO = lazyNamed(loadSeoPages, "UberEatsSEO");
const WareNichtErhaltenSEO = lazyNamed(loadSeoPages, "WareNichtErhaltenSEO");
const AboFalleSEO = lazyNamed(loadSeoPages, "AboFalleSEO");
const ChargebackAntragVorlageSEO = lazyNamed(loadSeoPages, "ChargebackAntragVorlageSEO");
const PayPalKaeuferschutzVorlageSEO = lazyNamed(loadSeoPages, "PayPalKaeuferschutzVorlageSEO");
const KlarnaReklamationVorlageSEO = lazyNamed(loadSeoPages, "KlarnaReklamationVorlageSEO");
const WareNichtErhaltenMusterbriefSEO = lazyNamed(loadSeoPages, "WareNichtErhaltenMusterbriefSEO");
const AboFalleMusterbriefSEO = lazyNamed(loadSeoPages, "AboFalleMusterbriefSEO");
const RueckerstattungHaendlerVorlageSEO = lazyNamed(
  loadSeoPages,
  "RueckerstattungHaendlerVorlageSEO"
);
const VisaReasonCodeSEO = lazyNamed(loadSeoPages, "VisaReasonCodeSEO");
const MastercardReasonCodeSEO = lazyNamed(loadSeoPages, "MastercardReasonCodeSEO");

const LEGAL_PATHS = new Set([
  "/impressum",
  "/datenschutz",
  "/ueber-uns",
  "/methodik",
  "/disclaimer",
  "/agb",
  "/widerruf",
]);

const SEO_PAGE_PATHS = new Set([
  "/paypal-chargeback",
  "/amex-chargeback",
  "/visa-mastercard-chargeback",
  "/klarna-reklamation",
  "/flug-chargeback",
  "/kiwi-rueckerstattung",
  "/lieferando-rueckerstattung",
  "/wolt-rueckerstattung",
  "/ubereats-rueckerstattung",
  "/ware-nicht-erhalten",
  "/abo-falle-chargeback",
  "/chargeback-antrag-vorlage",
  "/paypal-kaeuferschutz-vorlage",
  "/klarna-reklamation-vorlage",
  "/ware-nicht-erhalten-musterbrief",
  "/abo-falle-musterbrief",
  "/rueckerstattung-haendler-vorlage",
  "/visa-reason-code-13-1",
  "/mastercard-chargeback-reason-code",
]);

const IMPORTANT_PUBLIC_PRELOADS = [
  RatgeberIndex.preload,
  MerchantIndexPage.preload,
  MerchantProblemPage.preload,
  ScamShopsPage.preload,
  ComparePage.preload,
  PayPalSEO.preload,
  Datenschutz.preload,
];

function normalizeInternalPath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function preloadPublicRoute(pathname: string) {
  const path = normalizeInternalPath(pathname);
  if (path === "/ratgeber") return void RatgeberIndex.preload();
  if (path === "/scam-shops-2026") return void ScamShopsPage.preload();
  if (path === "/vergleich/paypal-vs-kreditkarte-vs-klarna") return void ComparePage.preload();
  if (/^\/hilfe\/[^/]+\/[^/]+$/.test(path)) return void MerchantProblemPage.preload();
  if (/^\/hilfe\/[^/]+$/.test(path)) return void MerchantIndexPage.preload();
  if (LEGAL_PATHS.has(path)) return void Datenschutz.preload();
  if (SEO_PAGE_PATHS.has(path)) return void PayPalSEO.preload();
}

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
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      applyStandardSeoHead({
        title: "Admin · ChargebackPilot",
        description: "Interner Admin-Bereich von ChargebackPilot.",
        canonical: pathname === "/admin" ? "/admin" : "/404",
        noindex: true,
      });
      return;
    }

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

function PublicAnalyticsTracker() {
  const [pathname] = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      trackPageView(pathname, document.title);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}

function PublicRouteChunkPreloader() {
  useEffect(() => {
    const preloadFromEvent = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        preloadPublicRoute(url.pathname);
      } catch {
        /* best-effort route preloading */
      }
    };

    document.addEventListener("mouseover", preloadFromEvent, true);
    document.addEventListener("focusin", preloadFromEvent, true);
    document.addEventListener("touchstart", preloadFromEvent, { capture: true, passive: true });

    const idlePreload = window.setTimeout(() => {
      IMPORTANT_PUBLIC_PRELOADS.forEach((preload) => {
        void preload();
      });
    }, 8000);

    return () => {
      document.removeEventListener("mouseover", preloadFromEvent, true);
      document.removeEventListener("focusin", preloadFromEvent, true);
      document.removeEventListener("touchstart", preloadFromEvent, true);
      window.clearTimeout(idlePreload);
    };
  }, []);

  return null;
}

function AdminRouteFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" aria-hidden="true">
      <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-primary animate-spin" />
    </div>
  );
}

function RouteShellFallback() {
  const [pathname] = useLocation();
  const isWizard = pathname === "/vorlagen-generator";

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

  return <div className="min-h-[60vh] bg-background" aria-hidden="true" />;
}

const withAdminSuspense = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={<AdminRouteFallback />}>
    <Component {...props} />
  </Suspense>
);

function Router() {
  const [location] = useLocation();

  return (
    <Suspense fallback={<RouteShellFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/vorlagen-generator">
          {() => (
            <Suspense fallback={<RouteShellFallback />}>
              <WizardRoute key={location} />
            </Suspense>
          )}
        </Route>
        <Route path="/ratgeber" component={RatgeberIndex} />
        <Route path="/admin" component={withAdminSuspense(Admin)} />

        {/* Legal Pages */}
        <Route path="/impressum" component={Impressum} />
        <Route path="/datenschutz" component={Datenschutz} />
        <Route path="/ueber-uns" component={UeberUns} />
        <Route path="/methodik" component={Methodik} />
        <Route path="/disclaimer" component={Disclaimer} />
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
        <Route path="/chargeback-antrag-vorlage" component={ChargebackAntragVorlageSEO} />
        <Route path="/paypal-kaeuferschutz-vorlage" component={PayPalKaeuferschutzVorlageSEO} />
        <Route path="/klarna-reklamation-vorlage" component={KlarnaReklamationVorlageSEO} />
        <Route
          path="/ware-nicht-erhalten-musterbrief"
          component={WareNichtErhaltenMusterbriefSEO}
        />
        <Route path="/abo-falle-musterbrief" component={AboFalleMusterbriefSEO} />
        <Route
          path="/rueckerstattung-haendler-vorlage"
          component={RueckerstattungHaendlerVorlageSEO}
        />
        <Route path="/visa-reason-code-13-1" component={VisaReasonCodeSEO} />
        <Route path="/mastercard-chargeback-reason-code" component={MastercardReasonCodeSEO} />

        {/* Programmatic merchant SEO */}
        <Route path="/hilfe/:merchantSlug/:problemSlug" component={MerchantProblemPage} />
        <Route path="/hilfe/:merchantSlug" component={MerchantIndexPage} />

        {/* Trust / scam ratgeber */}
        <Route path="/scam-shops-2026" component={ScamShopsPage} />

        {/* Comparison */}
        <Route path="/vergleich/paypal-vs-kreditkarte-vs-klarna" component={ComparePage} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

interface AppProps {
  ssrPath?: string;
}

function AppFrame() {
  const [pathname] = useLocation();
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <RouteHeadSync />
      <PublicAnalyticsTracker />
      <PublicRouteChunkPreloader />
      {!isAdminPath && <Navbar />}
      <main className="flex-1">
        <ScrollToTop />
        <Router />
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
}

function App({ ssrPath }: AppProps) {
  return (
    <ThemeProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} ssrPath={ssrPath}>
        <AppFrame />
      </WouterRouter>
      <IdleToaster />
    </ThemeProvider>
  );
}

export default App;
