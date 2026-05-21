import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

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

function Router() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
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
