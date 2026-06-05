import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useState, Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Route chunks stay lazy for PageSpeed, but public routes no longer render skeleton fallbacks.
// This keeps the first bundle small while avoiding visible skeleton loading on public pages.
function lazyWithPreload<T extends React.ComponentType<any>>(loader: () => Promise<{ default: T }>) {
  const Component = lazy(loader) as React.LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> };
  Component.preload = loader;
  return Component;
}

const loadWizard = () => import("@/pages/Wizard");

const LazyToaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
const Home = lazyWithPreload(() => import("@/pages/Home"));
const RatgeberIndex = lazyWithPreload(() => import("@/pages/RatgeberIndex"));
const Wizard = lazyWithPreload(loadWizard);
const Admin = lazyWithPreload(() => import("@/pages/Admin"));
const AdminDemo = lazyWithPreload(() => import("@/pages/AdminDemo"));
const MerchantProblemPage = lazyWithPreload(() => import("@/pages/MerchantProblemPage"));
const MerchantIndexPage = lazyWithPreload(() => import("@/pages/MerchantIndexPage"));
const ScamShopsPage = lazyWithPreload(() => import("@/pages/ScamShopsPage"));
const ComparePage = lazyWithPreload(() => import("@/pages/ComparePage"));
const Impressum = lazyWithPreload(() => import("@/pages/LegalPages").then((m) => ({ default: m.Impressum })));
const Datenschutz = lazyWithPreload(() => import("@/pages/LegalPages").then((m) => ({ default: m.Datenschutz })));
const AGB = lazyWithPreload(() => import("@/pages/LegalPages").then((m) => ({ default: m.AGB })));
const Widerruf = lazyWithPreload(() => import("@/pages/LegalPages").then((m) => ({ default: m.Widerruf })));
const PayPalSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.PayPalSEO })));
const AmexSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.AmexSEO })));
const VisaMastercardSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.VisaMastercardSEO })));
const KlarnaSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.KlarnaSEO })));
const FlugSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.FlugSEO })));
const KiwiSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.KiwiSEO })));
const LieferandoSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.LieferandoSEO })));
const WoltSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.WoltSEO })));
const UberEatsSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.UberEatsSEO })));
const WareNichtErhaltenSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.WareNichtErhaltenSEO })));
const AboFalleSEO = lazyWithPreload(() => import("@/pages/SEOPages").then((m) => ({ default: m.AboFalleSEO })));

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
    const schedule = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(cb, 1200) as unknown as number);
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

function RouteShellFallback() {
  const [pathname] = useLocation();
  const isWizard = pathname === "/vorlagen-generator";
  const isGuide = pathname === "/ratgeber" || pathname.includes("chargeback") || pathname.includes("rueckerstattung") || pathname.includes("reklamation") || pathname.includes("ware-nicht-erhalten") || pathname.includes("abo-falle") || pathname.startsWith("/hilfe/") || pathname.startsWith("/vergleich/") || pathname === "/scam-shops-2026";

  if (isWizard) {
    return (
      <div className="container mx-auto max-w-5xl py-10 px-4" aria-busy="true" aria-label="Vorlagen-Generator wird geladen">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="h-7 w-44 rounded bg-muted mb-2" />
            <div className="h-4 w-24 rounded bg-muted mb-6" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-muted/60" />
              ))}
            </div>
          </aside>
          <div>
            <div className="lg:hidden mb-6 space-y-3">
              <div className="h-7 w-48 rounded bg-muted" />
              <div className="h-2 rounded bg-muted" />
            </div>
            <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm">
              <div className="h-7 w-56 rounded bg-muted mb-2" />
              <div className="h-4 w-72 max-w-full rounded bg-muted mb-6" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl border bg-background" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isGuide) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4" aria-busy="true" aria-label="Ratgeber wird geladen">
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
  <Suspense fallback={<RouteShellFallback />}>
    <Component {...props} />
  </Suspense>
);

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <Route path="/" component={withoutSkeleton(Home)} />
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

      {/* Programmatic merchant SEO */}
      <Route path="/hilfe/:merchantSlug/:problemSlug" component={withoutSkeleton(MerchantProblemPage)} />
      <Route path="/hilfe/:merchantSlug" component={withoutSkeleton(MerchantIndexPage)} />

      {/* Trust / scam ratgeber */}
      <Route path="/scam-shops-2026" component={withoutSkeleton(ScamShopsPage)} />

      {/* Comparison */}
      <Route path="/vergleich/paypal-vs-kreditkarte-vs-klarna" component={withoutSkeleton(ComparePage)} />

      <Route component={NotFound} />
    </Switch>
  );
}

interface AppProps {
  ssrPath?: string;
}

function App({ ssrPath }: AppProps) {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} ssrPath={ssrPath}>
      <div className="min-h-screen flex flex-col font-sans bg-background">
        <Navbar />
        <main className="flex-1">
          <ScrollToTop />
          <Router />
        </main>
        <Footer />
      </div>
      <IdleToaster />
    </WouterRouter>
  );
}

export default App;
