import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

// Route chunks stay lazy for PageSpeed, but public routes no longer render skeleton fallbacks.
// This keeps the first bundle small while avoiding visible skeleton loading on public pages.
const Wizard = lazy(() => import("@/pages/Wizard"));
const RatgeberIndex = lazy(() => import("@/pages/RatgeberIndex"));
const MerchantProblemPage = lazy(() => import("@/pages/MerchantProblemPage"));
const MerchantIndexPage = lazy(() => import("@/pages/MerchantIndexPage"));
const ScamShopsPage = lazy(() => import("@/pages/ScamShopsPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const Impressum = lazy(() => import("@/pages/LegalPages").then((m) => ({ default: m.Impressum })));
const Datenschutz = lazy(() => import("@/pages/LegalPages").then((m) => ({ default: m.Datenschutz })));
const AGB = lazy(() => import("@/pages/LegalPages").then((m) => ({ default: m.AGB })));
const Widerruf = lazy(() => import("@/pages/LegalPages").then((m) => ({ default: m.Widerruf })));
const PayPalSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.PayPalSEO })));
const AmexSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.AmexSEO })));
const VisaMastercardSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.VisaMastercardSEO })));
const KlarnaSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.KlarnaSEO })));
const FlugSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.FlugSEO })));
const KiwiSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.KiwiSEO })));
const LieferandoSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.LieferandoSEO })));
const WoltSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.WoltSEO })));
const UberEatsSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.UberEatsSEO })));
const WareNichtErhaltenSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.WareNichtErhaltenSEO })));
const AboFalleSEO = lazy(() => import("@/pages/SEOPages").then((m) => ({ default: m.AboFalleSEO })));
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

  useLayoutEffect(() => {
    // IMPORTANT: Most public SEO routes already define precise <SeoHead> metadata.
    // We only force metadata for operational routes that don't provide page-level SEO tags.
    const shouldForceMeta = /^\/(admin|admin\/demo|vorlagen-generator|impressum|datenschutz|agb|widerruf)$/.test(pathname);
    if (!shouldForceMeta) return;

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

const withAdminSuspense = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={null}>
    <Component {...props} />
  </Suspense>
);

const withoutSkeleton = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={null}>
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
        <ScrollToTop />
        <RouteMetaUpdater />
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
