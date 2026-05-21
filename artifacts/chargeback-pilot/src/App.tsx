import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Wizard from "@/pages/Wizard";
import RatgeberIndex from "@/pages/RatgeberIndex";
import Admin from "@/pages/Admin";
import AdminDemo from "@/pages/AdminDemo";
import { Impressum, Datenschutz, AGB, Widerruf } from "@/pages/LegalPages";
import { 
  PayPalSEO, AmexSEO, VisaMastercardSEO, 
  KlarnaSEO, FlugSEO, LieferandoSEO, WoltSEO, UberEatsSEO, KiwiSEO,
  WareNichtErhaltenSEO, AboFalleSEO 
} from "@/pages/SEOPages";
import MerchantProblemPage from "@/pages/MerchantProblemPage";
import MerchantIndexPage from "@/pages/MerchantIndexPage";
import ScamShopsPage from "@/pages/ScamShopsPage";
import ComparePage from "@/pages/ComparePage";

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
