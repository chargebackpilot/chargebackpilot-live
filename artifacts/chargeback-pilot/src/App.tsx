import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Lazy-loaded routes for better performance
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/Home"));
const Wizard = lazy(() => import("@/pages/Wizard"));
const RatgeberIndex = lazy(() => import("@/pages/RatgeberIndex"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminDemo = lazy(() => import("@/pages/AdminDemo"));
const MerchantProblemPage = lazy(() => import("@/pages/MerchantProblemPage"));
const MerchantIndexPage = lazy(() => import("@/pages/MerchantIndexPage"));
const ScamShopsPage = lazy(() => import("@/pages/ScamShopsPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));

// Legal pages
const Impressum = lazy(() => import("@/pages/LegalPages").then(m => ({ default: m.Impressum })));
const Datenschutz = lazy(() => import("@/pages/LegalPages").then(m => ({ default: m.Datenschutz })));
const AGB = lazy(() => import("@/pages/LegalPages").then(m => ({ default: m.AGB })));
const Widerruf = lazy(() => import("@/pages/LegalPages").then(m => ({ default: m.Widerruf })));

// SEO Pages
const PayPalSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.PayPalSEO })));
const AmexSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.AmexSEO })));
const VisaMastercardSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.VisaMastercardSEO })));
const KlarnaSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.KlarnaSEO })));
const FlugSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.FlugSEO })));
const KiwiSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.KiwiSEO })));
const LieferandoSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.LieferandoSEO })));
const WoltSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.WoltSEO })));
const UberEatsSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.UberEatsSEO })));
const WareNichtErhaltenSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.WareNichtErhaltenSEO })));
const AboFalleSEO = lazy(() => import("@/pages/SEOPages").then(m => ({ default: m.AboFalleSEO })));

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

function DefaultSkeleton() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full bg-background flex flex-col items-center justify-center pt-24 pb-32">
        <div className="container mx-auto px-4 w-full max-w-5xl">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-7 w-48 bg-muted rounded-full mb-6"></div>
            <div className="h-12 sm:h-16 w-3/4 max-w-2xl bg-muted rounded-lg mb-6"></div>
            <div className="h-12 sm:h-16 w-1/2 max-w-md bg-muted rounded-lg mb-10"></div>
            <div className="h-5 w-full max-w-3xl bg-muted rounded mb-2"></div>
            <div className="h-5 w-5/6 max-w-2xl bg-muted rounded mb-2"></div>
            <div className="h-5 w-4/6 max-w-xl bg-muted rounded mb-10"></div>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <div className="h-12 w-full sm:w-64 bg-muted rounded-md"></div>
              <div className="h-12 w-full sm:w-56 bg-muted rounded-md"></div>
            </div>
            <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-6xl">
              <div className="h-44 bg-muted rounded-2xl w-full"></div>
              <div className="h-44 bg-muted rounded-2xl w-full"></div>
              <div className="h-44 bg-muted rounded-2xl w-full"></div>
            </div>
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
        <div className="bg-muted py-16 px-4 border-b">
          <div className="container mx-auto max-w-3xl animate-pulse">
            <div className="h-10 w-3/4 bg-slate-200 rounded-lg mb-6"></div>
            <div className="h-6 w-full bg-slate-200 rounded mb-2"></div>
            <div className="h-6 w-5/6 bg-slate-200 rounded mb-8"></div>
            <div className="h-12 w-48 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
        <div className="container mx-auto max-w-3xl px-4 mt-12 animate-pulse space-y-12 pb-20">
          <div>
            <div className="h-8 w-1/2 bg-muted rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-6 w-full bg-muted rounded"></div>
              <div className="h-6 w-5/6 bg-muted rounded"></div>
            </div>
          </div>
          <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
            <div className="h-8 w-1/3 bg-muted rounded mb-6"></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="h-12 bg-background rounded-lg"></div>
              <div className="h-12 bg-background rounded-lg"></div>
            </div>
          </div>
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
          <div className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8 min-h-[500px]">
             <div className="h-8 w-1/3 bg-muted rounded mb-2"></div>
             <div className="h-4 w-1/2 bg-muted rounded mb-8"></div>
             <div className="space-y-4">
                <div className="h-16 bg-muted rounded-xl"></div>
                <div className="h-16 bg-muted rounded-xl"></div>
                <div className="h-16 bg-muted rounded-xl"></div>
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={withSuspense(Home, DefaultSkeleton)} />
      <Route path="/vorlagen-generator" component={withSuspense(Wizard, WizardSkeleton)} />
      <Route path="/ratgeber" component={withSuspense(RatgeberIndex, ArticleSkeleton)} />
      <Route path="/admin" component={withSuspense(Admin, DefaultSkeleton)} />
      <Route path="/admin/demo" component={withSuspense(AdminDemo, DefaultSkeleton)} />
      
      {/* Legal Pages */}
      <Route path="/impressum" component={withSuspense(Impressum, ArticleSkeleton)} />
      <Route path="/datenschutz" component={withSuspense(Datenschutz, ArticleSkeleton)} />
      <Route path="/agb" component={withSuspense(AGB, ArticleSkeleton)} />
      <Route path="/widerruf" component={withSuspense(Widerruf, ArticleSkeleton)} />
      
      {/* SEO Landing Pages */}
      <Route path="/paypal-chargeback" component={withSuspense(PayPalSEO, ArticleSkeleton)} />
      <Route path="/amex-chargeback" component={withSuspense(AmexSEO, ArticleSkeleton)} />
      <Route path="/visa-mastercard-chargeback" component={withSuspense(VisaMastercardSEO, ArticleSkeleton)} />
      <Route path="/klarna-reklamation" component={withSuspense(KlarnaSEO, ArticleSkeleton)} />
      <Route path="/flug-chargeback" component={withSuspense(FlugSEO, ArticleSkeleton)} />
      <Route path="/kiwi-rueckerstattung" component={withSuspense(KiwiSEO, ArticleSkeleton)} />
      <Route path="/lieferando-rueckerstattung" component={withSuspense(LieferandoSEO, ArticleSkeleton)} />
      <Route path="/wolt-rueckerstattung" component={withSuspense(WoltSEO, ArticleSkeleton)} />
      <Route path="/ubereats-rueckerstattung" component={withSuspense(UberEatsSEO, ArticleSkeleton)} />
      <Route path="/ware-nicht-erhalten" component={withSuspense(WareNichtErhaltenSEO, ArticleSkeleton)} />
      <Route path="/abo-falle-chargeback" component={withSuspense(AboFalleSEO, ArticleSkeleton)} />

      {/* Programmatic merchant SEO */}
      <Route path="/hilfe/:merchantSlug/:problemSlug" component={withSuspense(MerchantProblemPage, ArticleSkeleton)} />
      <Route path="/hilfe/:merchantSlug" component={withSuspense(MerchantIndexPage, ArticleSkeleton)} />

      {/* Trust / scam ratgeber */}
      <Route path="/scam-shops-2026" component={withSuspense(ScamShopsPage, ArticleSkeleton)} />

      {/* Comparison */}
      <Route path="/vergleich/paypal-vs-kreditkarte-vs-klarna" component={withSuspense(ComparePage, ArticleSkeleton)} />

      <Route component={withSuspense(NotFound, DefaultSkeleton)} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
