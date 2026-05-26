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

function AppShellSkeleton() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full bg-background flex flex-col items-center justify-center pt-24 pb-32">
        <div className="container mx-auto px-4 w-full max-w-5xl">
          <div className="animate-pulse flex flex-col items-center">
            {/* Tag Skeleton */}
            <div className="h-7 w-48 bg-muted rounded-full mb-6"></div>
            {/* Headline Skeleton */}
            <div className="h-12 sm:h-16 w-3/4 max-w-2xl bg-muted rounded-lg mb-6"></div>
            <div className="h-12 sm:h-16 w-1/2 max-w-md bg-muted rounded-lg mb-10"></div>
            {/* Text Skeleton */}
            <div className="h-5 w-full max-w-3xl bg-muted rounded mb-2"></div>
            <div className="h-5 w-5/6 max-w-2xl bg-muted rounded mb-2"></div>
            <div className="h-5 w-4/6 max-w-xl bg-muted rounded mb-10"></div>
            {/* Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <div className="h-12 w-full sm:w-64 bg-muted rounded-md"></div>
              <div className="h-12 w-full sm:w-56 bg-muted rounded-md"></div>
            </div>
            
            {/* Grid Skeleton */}
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

function Router() {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/vorlagen-generator" component={Wizard} />
        <Route path="/ratgeber" component={RatgeberIndex} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/demo" component={AdminDemo} />
        
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

        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
