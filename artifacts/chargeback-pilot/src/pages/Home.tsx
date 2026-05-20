import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SeoHead } from "@/components/SeoHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { activateFlatrate, isFlatrateActive } from "@/lib/case-persistence";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Scale,
  FileText,
  Clock,
  AlertTriangle,
  FileSignature,
  UtensilsCrossed,
  Plane,
  Building2,
  Package,
  RefreshCcw,
  Repeat2,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { useGetCaseStats } from "@workspace/api-client-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PaymentLogoStrip, PaymentHelpGrid } from "@/components/PaymentLogos";

const SCENARIOS = [
  {
    icon: UtensilsCrossed,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accentBorder: "border-orange-200",
    tag: "Lieferdienst",
    tagBg: "bg-orange-50 text-orange-700",
    headline: "Bestellung kalt, fehlt oder ungenießbar",
    detail: "Du hast bei Lieferando, Wolt oder UberEats bestellt — und erhalten, was du nicht bestellt hast, oder die Bestellung kam komplett ungenießbar an.",
    brands: ["Lieferando", "Wolt", "UberEats", "Gorillas"],
    recovery: "Bis zu 100% Rückerstattung möglich",
    href: "/fall-pruefen?problem=food_delivery",
  },
  {
    icon: Plane,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    accentBorder: "border-sky-200",
    tag: "Flug & Reise",
    tagBg: "bg-sky-50 text-sky-700",
    headline: "Flugsteuern & Gebühren nach Stornierung",
    detail: "Dein Flug wurde gestrichen oder du hast ihn nicht genutzt — Steuern und Gebühren werden von Airlines wie Ryanair oder Easyjet oft nicht automatisch erstattet.",
    brands: ["Ryanair", "Easyjet", "Condor", "TUI Fly"],
    recovery: "Steuern & Gebühren zurückfordern",
    href: "/fall-pruefen?problem=flight_travel",
  },
  {
    icon: Building2,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    accentBorder: "border-violet-200",
    tag: "Hotel & Unterkunft",
    tagBg: "bg-violet-50 text-violet-700",
    headline: "Hotelzimmer mit Mängeln oder falsch beschrieben",
    detail: "Das gebuchte Zimmer entsprach nicht der Beschreibung — Schimmel, fehlendes Meerblick-Zimmer, kaputte Klimaanlage, oder die Unterkunft war bei Ankunft gar nicht verfügbar.",
    brands: ["Booking.com", "Airbnb", "Hotels.com", "HRS"],
    recovery: "Chargeback über Kreditkarte möglich",
    href: "/fall-pruefen?problem=flight_travel",
  },
  {
    icon: Package,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accentBorder: "border-emerald-200",
    tag: "Online-Shop",
    tagBg: "bg-emerald-50 text-emerald-700",
    headline: "Ware nie angekommen oder komplett falsch",
    detail: "Du hast bei Amazon, Temu oder SHEIN bestellt — die Ware kam nie an, wurde als zugestellt markiert, oder du hast etwas völlig anderes erhalten.",
    brands: ["Amazon", "Temu", "SHEIN", "Aliexpress"],
    recovery: "PayPal Käuferschutz oder Kreditkarte",
    href: "/fall-pruefen?problem=not_received",
  },
  {
    icon: RefreshCcw,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    accentBorder: "border-rose-200",
    tag: "Rückerstattung",
    tagBg: "bg-rose-50 text-rose-700",
    headline: "Rückerstattung versprochen — nie erhalten",
    detail: "Der Händler hat dir schriftlich eine Rückerstattung zugesagt — aber das Geld ist nie auf deinem Konto angekommen. Dein stärkstes Argument für einen Chargeback.",
    brands: ["Alle Händler", "Online-Shops", "Dienstleister"],
    recovery: "Stärkste Chargeback-Position",
    href: "/fall-pruefen?problem=refund_promised",
  },
  {
    icon: Repeat2,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    accentBorder: "border-amber-200",
    tag: "Abo-Falle",
    tagBg: "bg-amber-50 text-amber-700",
    headline: "Ungewollte Abbuchung trotz Kündigung",
    detail: "Du hast ein Abo gekündigt — aber es wird weiter abgebucht. Oder du bist in eine Abofalle getappt, die du nie bewusst abgeschlossen hast.",
    brands: ["Netflix", "Spotify", "Amazon Prime", "Klarna"],
    recovery: "Rückbuchung mehrerer Monate möglich",
    href: "/fall-pruefen?problem=subscription",
  },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Chargeback-Strategie", desc: "Passende Vorgehensweise je nach Zahlungsart und Problemtyp — PayPal, Kreditkarte, Klarna und mehr." },
  { icon: CheckCircle2, title: "Beweis-Checkliste", desc: "Welche Dokumente für deinen spezifischen Fall entscheidend sind — und was du noch beschaffen solltest." },
    { icon: FileSignature, title: "KI-Textassistent", desc: "KI-gestützte Textvorlagen, die deinen Fall klar strukturieren." },
    { icon: Clock, title: "Fristen-Überblick", desc: "PayPal 180 Tage, Kreditkarte 60–120 Tage — wir zeigen dir, worauf du jetzt achten musst." },
  { icon: AlertTriangle, title: "Gegenargumente entschärfen", desc: "Bereite dich auf typische Ausreden der Händler vor — mit konkreten Antworten." },
  { icon: FileText, title: "3 Textvorlagen pro Fall", desc: "Händler-Anschreiben, Bank-Chargeback-Antrag und Eskalationsschreiben — sofort kopierbereit." },
];

const FAQS = [
  {
    q: "Ist ChargebackPilot eine Rechtsberatung?",
    a: "Nein. ChargebackPilot bietet keine Rechtsberatung, keine Rechtsdienstleistung und keine Vertretung gegenüber Banken oder Händlern. Wir helfen dir, deinen Fall strukturiert aufzubereiten und stellen KI-generierte Textvorlagen zur Verfügung.",
  },
  {
    q: "Für welche Zahlungsarten funktioniert ein Chargeback?",
    a: "Chargeback ist vor allem bei Kreditkarten (Visa, Mastercard, Amex) und PayPal möglich. Klarna bietet ebenfalls einen Käuferschutz. Bei Banküberweisungen ist es deutlich schwieriger — hier empfehlen wir den direkten Weg zum Händler.",
  },
  {
    q: "Wie lange habe ich Zeit für einen Chargeback?",
    a: "Die Fristen variieren: PayPal Käuferschutz gilt 180 Tage ab Zahlung. Kreditkarten-Chargeback ist meist 60–120 Tage ab Kontoauszugsdatum möglich. Nach Ablauf der Frist verfällt der Anspruch gegenüber der Bank — daher solltest du schnell handeln.",
  },
  {
    q: "Gibt es eine Erfolgsgarantie?",
    a: "Nein, und jeder der das verspricht, lügt. Ob ein Chargeback oder eine Händler-Rückzahlung erfolgreich ist, entscheiden die Bank und der Zahlungsdienstleister nach ihren eigenen Richtlinien. ChargebackPilot hilft dir lediglich bei der professionellen Formulierung — garantieren können wir nichts.",
  },
  {
    q: "Wie sicher sind meine Daten?",
    a: "Deine Angaben werden für die KI-Textgenerierung verwendet und in unserer Datenbank gespeichert. Zur Verarbeitung nutzen wir die Gemini API von Google LLC als Dienstleister. Wir geben die Daten nicht an weitere Dritte weiter, soweit dies nicht zur Bereitstellung des Dienstes erforderlich ist.",
  },
];

export default function Home() {
  const { data: stats } = useGetCaseStats();
  const { toast } = useToast();
  const [flatrateLoading, setFlatrateLoading] = useState(false);
  const [flatrateActive, setFlatrateActive] = useState(false);

  // On mount: detect flatrate_success from Stripe return + reflect current flatrate status
  useEffect(() => {
    setFlatrateActive(isFlatrateActive());
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (params.get("flatrate_success") === "1" && sid) {
      fetch(`/api/stripe/checkout/verify/${encodeURIComponent(sid)}`)
        .then((r) => r.json())
        .then((j) => {
          if (j?.paid && j?.mode === "flatrate") {
            activateFlatrate(sid, 12);
            setFlatrateActive(true);
            toast({
              title: "Flatrate aktiviert!",
              description: "Alle Fälle für 12 Monate freigeschaltet.",
            });
          }
        })
        .catch(() => {/* silent — user can retry */})
        .finally(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("flatrate_success");
          url.searchParams.delete("flatrate_cancel");
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        });
    } else if (params.get("flatrate_cancel") === "1") {
      const url = new URL(window.location.href);
      url.searchParams.delete("flatrate_cancel");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  }, [toast]);

  const handleFlatrateCheckout = async () => {
    setFlatrateLoading(true);
    try {
      const res = await fetch("/api/stripe/flatrate-checkout", { method: "POST" });
      const json = await res.json();
      if (json?.url) {
        window.location.href = json.url;
      } else {
        toast({
          title: "Zahlung gerade nicht verfügbar",
          description: json?.error ?? "Bitte versuche es später erneut.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Verbindung fehlgeschlagen",
        description: "Bitte prüfe deine Internetverbindung.",
        variant: "destructive",
      });
    } finally {
      setFlatrateLoading(false);
    }
  };

  return (
    <MainLayout>
      <SeoHead 
        title="ChargebackPilot | Käuferschutz & Rückerstattung online"
        description="Geld zurück bei Betrug, Scam-Shops, Lieferando, Flugausfall oder Abo-Fallen. Einfache Chargeback-Generierung für PayPal und Kreditkarten."
        canonical="/"
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 md:pt-24 pb-32">
        <div className="container mx-auto max-w-5xl text-center relative">
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide">
            Käuferschutz für Verbraucher
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Probleme beim Online-Kauf? <br className="hidden md:block" />
            <span className="text-primary">Dein Assistent für jede Reklamation.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Lieferung fehlt, Flug gestrichen oder falsches Essen? Wir leiten dich als Privatperson perfekt durch den Käuferschutz-Prozess. Erhalte strukturierte Anleitungen und exakte Textvorlagen für PayPal, Kreditkarte und Händler, damit du genau weißt, was du schreiben musst.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/fall-pruefen">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 gap-2 h-12" data-testid="hero-cta-primary">
                Kostenlose Hilfe starten
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/ratgeber">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12" data-testid="hero-cta-secondary">
                Alle Guides ansehen
              </Button>
            </Link>
          </div>

          {/* STATS */}
          <div className="mt-14 pt-8 border-t flex flex-wrap justify-center gap-10 text-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg leading-none">{stats?.totalCases ?? 0}</div>
                <div className="text-muted-foreground text-xs">Fälle analysiert</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg leading-none">{stats?.strongCases ?? 0}</div>
                <div className="text-muted-foreground text-xs">Starke Ausgangslage</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg leading-none">3</div>
                <div className="text-muted-foreground text-xs">Vorlagen pro Fall</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg leading-none">6</div>
                <div className="text-muted-foreground text-xs">Zahlungsarten</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO-Text / Intro */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Chargeback & Käuferschutz: Hole dir dein Geld zurück</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Egal ob <strong>kaltes Essen von Lieferando oder Wolt</strong>, <strong>nicht gelieferte Pakete</strong> von Fake-Shops oder <strong>einbehaltene Steuern und Gebühren bei Flugstornierungen</strong> (z.B. Kiwi.com) – in den meisten Fällen musst du das nicht hinnehmen. Mit dem sogenannten <strong>Chargeback-Verfahren</strong> bei Kreditkarten (Visa, Mastercard, Amex) oder dem Käuferschutz von PayPal und Klarna kannst du dir dein Geld direkt über deinen Zahlungsdienstleister zurückholen.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            ChargebackPilot analysiert deinen individuellen Fall per KI, zeigt dir genau auf, welche Beweise du brauchst und generiert das perfekte Anschreiben für Händler und Bank. Erhöhe deine Erfolgschancen und spare Zeit, Nerven und teure Anwaltskosten.
          </p>
        </div>
      </section>

      {/* Typical Scenarios (SEO rich) */}
      <section className="py-16 md:py-24 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Typische Fälle für einen erfolgreichen Chargeback</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ChargebackPilot ist auf diese konkreten Alltagssituationen ausgelegt — mit spezifischen Vorlagen für jeden Fall.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SCENARIOS.map((sc, i) => (
            <Link key={i} href={sc.href}>
              <div
                className={`group bg-white border-2 ${sc.accentBorder} rounded-2xl p-5 h-full flex flex-col gap-4 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5`}
                data-testid={`scenario-card-${i}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-xl ${sc.iconBg} ${sc.iconColor} flex items-center justify-center flex-shrink-0`}>
                    <sc.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.tagBg} flex-shrink-0`}>
                    {sc.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-bold text-base leading-snug mb-2">{sc.headline}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{sc.detail}</p>
                </div>

                {/* Brands */}
                <div className="flex flex-wrap gap-1.5">
                  {sc.brands.map((brand, j) => (
                    <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">
                      {brand}
                    </span>
                  ))}
                </div>

                {/* Recovery + Arrow */}
                <div className="flex items-center justify-between pt-3 border-t border-dashed">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    {sc.recovery}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm mb-4">Dein Fall ist nicht dabei?</p>
          <Link href="/fall-pruefen">
            <Button variant="outline" className="gap-2">
              Trotzdem kostenlos Hilfe starten
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Was du bekommst</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Alles, was du für eine professionelle Reklamation brauchst — an einem Ort.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAYMENT METHODS — clickable help grid */}
      <section className="py-20 px-4 bg-muted/30 border-y">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
              Hilfe nach Zahlungsart
            </span>
            <h2 className="text-3xl font-bold mb-3">Wie hast du bezahlt? So generieren wir deine Briefe.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Jede Zahlungsart hat eigene Schutzregeln, eigene Fristen und eigene Rückforderungswege. Klicke deine Zahlungsmethode an — wir starten sofort den Text-Generator für das passende Verfahren.
            </p>
          </div>
          <PaymentHelpGrid />
          <p className="text-center text-xs text-muted-foreground mt-6 max-w-xl mx-auto">
            Kein Häkchen, keine Anmeldung — die Text-Generierung startet kostenlos. Du zahlst erst, wenn du die fertigen Brief-Vorlagen brauchst (0,99 € pro Fall).
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-4 bg-background" id="pricing">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Flexible Preisgestaltung</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Beginne kostenlos. Lade für einen kleinen Betrag die Brief-Vorlagen für deinen Fall herunter oder nutze im Abo alle Funktionen unbegrenzt.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Basis-Formulierungshilfe</CardTitle>
                <CardDescription>Kostenlose Text-Generierung</CardDescription>
                <div className="text-4xl font-black mt-3">0 <span className="text-lg font-normal text-muted-foreground">€</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm">
                  {["Text-Strukturierung (indikativ)", "Beweis-Checkliste", "Fallzusammenfassung", "Mögliche rechtliche Hinweise", "Erster Schritt der Anleitung"].map((f) => (
                    <li key={f} className="flex gap-2.5 items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/fall-pruefen">
                  <Button className="w-full mt-2" variant="outline">Jetzt kostenlos starten</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Unlock */}
            <Card className="border-2 border-primary shadow-lg relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                Empfohlen
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Einzelfall Freischaltung</CardTitle>
                <CardDescription>Einmalig pro Vorlagen-Paket</CardDescription>
                <div className="text-4xl font-black mt-3">0,99 <span className="text-lg font-normal text-muted-foreground">€</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm">
                    {["Alles aus Basis-Variante", "Alle Textvorlagen", "Vollständige Anleitung", "PDF & E-Mail Export", "Entkräftung von Gegenargumenten"].map((f) => (
                    <li key={f} className="flex gap-2.5 items-center">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="!mt-5">
                  <Link href="/fall-pruefen">
                    <Button className="w-full">Paket für 0,99 € freischalten</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Flatrate */}
            <Card className="border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Chargeback Flatrate</CardTitle>
                <CardDescription>Für 12 Monate · kein Abo</CardDescription>
                <div className="text-4xl font-black mt-3">9,99 <span className="text-lg font-normal text-muted-foreground">€ einmalig</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm">
                  {["Unbegrenzte Fall-Freischaltungen", "Alle Premium-Features", "Gültig 12 Monate ab Kauf", "Keine Abbuchung danach"].map((f) => (
                    <li key={f} className="flex gap-2.5 items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {flatrateActive ? (
                  <Button className="w-full mt-2" variant="outline" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" />Flatrate aktiv
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    onClick={handleFlatrateCheckout}
                    disabled={flatrateLoading}
                    data-testid="flatrate-checkout"
                  >
                    {flatrateLoading ? "Wird vorbereitet…" : "Flatrate für 9,99 € kaufen"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-muted/40 border-t">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-10 text-center">Häufige Fragen</h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white border rounded-xl px-4">
                <AccordionTrigger className="font-semibold text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4 text-sm">Bereit, Brief-Vorlagen zu generieren?</p>
            <Link href="/fall-pruefen">
              <Button size="lg" className="gap-2">
                Jetzt kostenlos starten
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Bottom Content */}
      <section className="py-16 bg-muted/10 border-t">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">Wann greift ein Chargeback?</h2>
              <p className="text-muted-foreground mb-4">
                Das Chargeback-Verfahren ist dein Rettungsanker, wenn der Händler nicht kooperiert. Es ist international standardisiert durch Visa und Mastercard (sogenannte <em>Reason Codes</em>). Typische Gründe sind:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong>Ware nicht geliefert:</strong> Der Shop behauptet, es sei verschickt, aber du hast nichts erhalten.</li>
                <li><strong>Falsche oder defekte Ware:</strong> Du bestellst ein Markenprodukt und bekommst eine billige Fälschung aus Asien.</li>
                <li><strong>Leistung nicht erbracht:</strong> Der Flug wurde gestrichen oder das Lieferessen (Lieferando, UberEats) kam komplett kalt an.</li>
                <li><strong>Ungewollte Abonnements:</strong> Versteckte Abofallen und unautorisierte Abbuchungen auf der Kreditkarte.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">PayPal & Klarna Käuferschutz</h2>
              <p className="text-muted-foreground mb-4">
                Neben dem klassischen Kreditkarten-Chargeback bieten auch moderne Zahlungsanbieter starke Schutzmechanismen. Der <strong>PayPal Käuferschutz</strong> greift bis zu 180 Tage nach dem Kauf. Wichtig ist hier, niemals per "Geld an Freunde senden" zu zahlen.
              </p>
              <p className="text-muted-foreground">
                Bei Zahlungen über <strong>Klarna</strong> solltest du umgehend eine <em>Zahlungspause</em> in der App einlegen, wenn ein Problem auftritt. So verhinderst du Mahngebühren, während der Fall geklärt wird. Unser Tool generiert dir für all diese Plattformen die exakt passenden Begründungstexte.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
