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
import { getRouteMeta } from "@/seo-routes";
import RatgeberIndex from "@/pages/RatgeberIndex";
import MerchantProblemPage from "@/pages/MerchantProblemPage";
import MerchantIndexPage from "@/pages/MerchantIndexPage";
import ScamShopsPage from "@/pages/ScamShopsPage";
import ComparePage from "@/pages/ComparePage";
import {
  AGB,
  Datenschutz,
  Disclaimer,
  Impressum,
  Methodik,
  UeberUns,
  Widerruf,
} from "@/pages/LegalPages";
import {
  AboFalleSEO,
  AboFalleMusterbriefSEO,
  AmexSEO,
  ChargebackAntragVorlageSEO,
  FlugSEO,
  KlarnaSEO,
  KlarnaReklamationVorlageSEO,
  KiwiSEO,
  LieferandoSEO,
  MastercardReasonCodeSEO,
  PayPalSEO,
  PayPalKaeuferschutzVorlageSEO,
  RueckerstattungHaendlerVorlageSEO,
  UberEatsSEO,
  VisaMastercardSEO,
  VisaReasonCodeSEO,
  WareNichtErhaltenSEO,
  WareNichtErhaltenMusterbriefSEO,
  WoltSEO,
} from "@/pages/SEOPages";

function lazyWithPreload<T extends ComponentType<any>>(loader: () => Promise<{ default: T }>) {
  const Component = lazy(loader) as LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };
  Component.preload = loader;
  return Component;
}

const loadWizardRoute = () => import("@/pages/WizardRoute");

const LazyToaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster }))
);
const WizardRoute = lazyWithPreload(loadWizardRoute);
const Admin = lazyWithPreload(() => import("@/pages/Admin"));
const AdminDemo = import.meta.env.DEV ? lazyWithPreload(() => import("@/pages/AdminDemo")) : null;

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
  <Suspense fallback={<RouteShellFallback />}>
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
            <WizardRoute key={location} />
          </Suspense>
        )}
      </Route>
      <Route path="/ratgeber" component={RatgeberIndex} />
      <Route path="/admin" component={withAdminSuspense(Admin)} />
      {AdminDemo ? <Route path="/admin/demo" component={withAdminSuspense(AdminDemo)} /> : null}

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
      <Route path="/ware-nicht-erhalten-musterbrief" component={WareNichtErhaltenMusterbriefSEO} />
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
  );
}

interface AppProps {
  ssrPath?: string;
}

function App({ ssrPath }: AppProps) {
  return (
    <ThemeProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} ssrPath={ssrPath}>
        <div className="min-h-screen flex flex-col font-sans bg-background">
          <RouteHeadSync />
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
  );
}

export default App;
