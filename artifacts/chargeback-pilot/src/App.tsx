import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
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
const loadRatgeberIndex = () => import("@/pages/RatgeberIndex");
const loadMerchantProblemPage = () => import("@/pages/MerchantProblemPage");
const loadMerchantIndexPage = () => import("@/pages/MerchantIndexPage");
const loadScamShopsPage = () => import("@/pages/ScamShopsPage");
const loadComparePage = () => import("@/pages/ComparePage");
const loadLegalPages = () => import("@/pages/LegalPages");
const loadSeoPages = () => import("@/pages/SEOPages");

const Wizard = lazyWithPreload(loadWizard);
const RatgeberIndex = lazyWithPreload(loadRatgeberIndex);
const MerchantProblemPage = lazyWithPreload(loadMerchantProblemPage);
const MerchantIndexPage = lazyWithPreload(loadMerchantIndexPage);
const ScamShopsPage = lazyWithPreload(loadScamShopsPage);
const ComparePage = lazyWithPreload(loadComparePage);
const Impressum = lazyWithPreload(() => loadLegalPages().then((m) => ({ default: m.Impressum })));
const Datenschutz = lazyWithPreload(() => loadLegalPages().then((m) => ({ default: m.Datenschutz })));
const AGB = lazyWithPreload(() => loadLegalPages().then((m) => ({ default: m.AGB })));
const Widerruf = lazyWithPreload(() => loadLegalPages().then((m) => ({ default: m.Widerruf })));
const PayPalSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.PayPalSEO })));
const AmexSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.AmexSEO })));
const VisaMastercardSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.VisaMastercardSEO })));
const KlarnaSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.KlarnaSEO })));
const FlugSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.FlugSEO })));
const KiwiSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.KiwiSEO })));
const LieferandoSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.LieferandoSEO })));
const WoltSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.WoltSEO })));
const UberEatsSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.UberEatsSEO })));
const WareNichtErhaltenSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.WareNichtErhaltenSEO })));
const AboFalleSEO = lazyWithPreload(() => loadSeoPages().then((m) => ({ default: m.AboFalleSEO })));
const Admin = lazyWithPreload(() => import("@/pages/Admin"));
const AdminDemo = lazyWithPreload(() => import("@/pages/AdminDemo"));

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

  useLayoutEffect(() => {
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
        match: /^\/impressum$/,
        title: "Impressum · ChargebackPilot",
        description:
          "Impressum von ChargebackPilot gemäß den geltenden Informationspflichten für Online-Angebote in Deutschland.",
      },
      {
        match: /^\/datenschutz$/,
        title: "Datenschutzerklärung · ChargebackPilot",
        description:
          "Datenschutzerklärung von ChargebackPilot mit Informationen zur Datenverarbeitung, Rechtsgrundlagen und Betroffenenrechten.",
      },
      {
        match: /^\/agb$/,
        title: "Allgemeine Geschäftsbedingungen (AGB) · ChargebackPilot",
        description:
          "Allgemeine Geschäftsbedingungen von ChargebackPilot für Nutzung, Leistungsumfang, Vergütung und Haftung.",
      },
      {
        match: /^\/widerruf$/,
        title: "Widerrufsbelehrung · ChargebackPilot",
        description:
          "Widerrufsbelehrung von ChargebackPilot mit Fristen, Voraussetzungen und Musterinformationen für Verbraucher.",
      },
      {
        match: /^\/paypal-chargeback$/,
        title: "PayPal Chargeback / Käuferschutz erfolgreich nutzen | ChargebackPilot",
        description: "PayPal Chargeback / Käuferschutz erfolgreich nutzen: typische Fristenhinweise, Belege und strukturierte Orientierung bei PayPal. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/amex-chargeback$/,
        title: "American Express Chargeback einleiten | ChargebackPilot",
        description: "American Express Chargeback einleiten: typische Fristenhinweise, Belege und strukturierte Orientierung bei Amex. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/visa-mastercard-chargeback$/,
        title: "Visa / Mastercard Chargeback: Geld zurück | ChargebackPilot",
        description: "Visa / Mastercard Chargeback: Geld zurück: typische Fristenhinweise, Belege und strukturierte Orientierung bei Kreditkarte. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/klarna-reklamation$/,
        title: "Klarna Reklamation & Käuferschutz | ChargebackPilot",
        description: "Klarna Reklamation & Käuferschutz: typische Fristenhinweise, Belege und strukturierte Orientierung bei Klarna. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/flug-chargeback$/,
        title: "Flug Chargeback / Reiserückerstattung | ChargebackPilot",
        description: "Flug Chargeback / Reiserückerstattung: typische Fristenhinweise, Belege und strukturierte Orientierung bei Flug/Reise. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/kiwi-rueckerstattung$/,
        title: "Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen | ChargebackPilot",
        description: "Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen: typische Fristenhinweise, Belege und strukturierte Orientierung bei Flug/Reise. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/lieferando-rueckerstattung$/,
        title: "Lieferando / Essen Rückerstattung | ChargebackPilot",
        description: "Lieferando / Essen Rückerstattung: typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/wolt-rueckerstattung$/,
        title: "Wolt Rückerstattung (Essen kalt / nicht geliefert) | ChargebackPilot",
        description: "Wolt Rückerstattung (Essen kalt / nicht geliefert): typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/ubereats-rueckerstattung$/,
        title: "Uber Eats Erstattung & Chargeback | ChargebackPilot",
        description: "Uber Eats Erstattung & Chargeback: typische Fristenhinweise, Belege und strukturierte Orientierung bei Lieferdienst. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/ware-nicht-erhalten$/,
        title: "Chargeback: Ware nicht erhalten | ChargebackPilot",
        description: "Chargeback: Ware nicht erhalten: typische Fristenhinweise, Belege und strukturierte Orientierung bei Online-Shopping. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/abo-falle-chargeback$/,
        title: "Abo-Falle Chargeback | ChargebackPilot",
        description: "Abo-Falle Chargeback: typische Fristenhinweise, Belege und strukturierte Orientierung bei Abonnements. Mit unverbindlichen Textentwürfen.",
      },
      {
        match: /^\/hilfe\//,
        title: "Händler-spezifische Hilfe bei Reklamationen · ChargebackPilot",
        description:
          "Konkrete Leitfäden zu typischen Problemen bei bekannten Händlern inklusive Beweis-Checkliste und Eskalationspfad.",
      },
      {
        match: /^\/vergleich\//,
        title: "PayPal vs Kreditkarte vs Klarna: Käuferschutz Vergleich 2026 | ChargebackPilot",
        description:
          "Welcher Weg ist in deinem Fall am besten? Vergleich von Fristen, Erfolgschancen und Vorgehen bei Rückerstattungen.",
      },
      {
        match: /^\/scam-shops-2026$/,
        title: "Scam-Shops 2026 erkennen & Geld zurückholen | ChargebackPilot",
        description: "Scam-Shops 2026: Warnsignale, Belege und nächste Schritte bei Fake-Shops, Käuferschutz und Chargeback.",
      },
    ];

    const current =
      metaByPath.find((m) => m.match.test(pathname)) ?? {
        title: "ChargebackPilot · Chargeback & Reklamationshilfe",
        description:
          "ChargebackPilot unterstützt dich mit KI-gestützter Formulierungshilfe für Rückerstattungen und Reklamationen.",
      };

    const noindex = /^\/(admin|admin\/demo)$/.test(pathname);

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
    upsertMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    upsertMeta("googlebot", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1");
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

function RouteShellFallback() {
  return <div className="min-h-screen bg-background" aria-hidden="true" />;
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
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/vorlagen-generator" component={withoutSkeleton(Wizard)} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <div className="min-h-screen flex flex-col font-sans bg-background">
          <Navbar />
          <main className="flex-1">
            <ScrollToTop />
            <RouteMetaUpdater />
            <Router />
          </main>
          <Footer />
        </div>
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
