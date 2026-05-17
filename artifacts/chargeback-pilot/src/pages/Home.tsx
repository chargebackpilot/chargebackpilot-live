import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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
  { icon: FileSignature, title: "Gemini-Formulierungsassistent", desc: "KI-generierte, rechtlich saubere Texte auf deinen individuellen Fall zugeschnitten." },
  { icon: Clock, title: "Fristen-Überblick", desc: "PayPal 180 Tage, Kreditkarte 60–120 Tage — wir zeigen dir wie viel Zeit du noch hast." },
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
    a: "Nein, und jeder der das verspricht, lügt. Ob ein Chargeback erfolgreich ist, entscheiden die Bank und der Zahlungsdienstleister nach ihren eigenen Richtlinien. ChargebackPilot erhöht deine Chancen durch professionelle Formulierungen und vollständige Beweisführung — garantieren können wir nichts.",
  },
  {
    q: "Wie sicher sind meine Daten?",
    a: "Deine Angaben werden nur für die KI-Analyse verwendet und in unserer Datenbank gespeichert. Wir geben keine Daten an Dritte weiter. Die Analyse läuft über die Gemini AI von Google.",
  },
];

export default function Home() {
  const { data: stats } = useGetCaseStats();

  return (
    <MainLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background py-24 px-4">
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

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">So funktioniert ChargebackPilot</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              In drei Schritten zu professionellen Textvorlagen — ohne Vorkenntnisse.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                icon: FileSignature,
                title: "Fall beschreiben",
                desc: "Beantworte einfache Fragen zu Zahlungsart, Problem und Händler. Wähle bekannte Anbieter direkt aus.",
              },
              {
                num: "02",
                icon: Scale,
                title: "KI analysiert deinen Fall",
                desc: "Unsere KI prüft Beweislage, Rechtslage und Fristen — und berechnet deine Erfolgswahrscheinlichkeit.",
              },
              {
                num: "03",
                icon: FileText,
                title: "Textvorlagen erhalten",
                desc: "Kopiere fertige Anschreiben für Händler, Bank/PayPal und Eskalation — sofort einsetzbar.",
              },
            ].map((step, i) => (
              <div key={i} className="relative bg-card border rounded-2xl p-6 shadow-sm">
                <div className="text-6xl font-black text-primary/8 absolute top-4 right-5 leading-none select-none">
                  {step.num}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/fall-pruefen">
              <Button size="lg" className="gap-2">
                Jetzt kostenlose Hilfe starten
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* REAL-WORLD SCENARIO CARDS */}
      <section className="py-20 px-4 bg-muted/40 border-y">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Erkennst du dich wieder?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
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

      {/* PAYMENT METHODS BANNER */}
      <section className="py-12 px-4 bg-primary/5 border-y">
        <div className="container mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Unterstützte Zahlungsarten
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "PayPal", color: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "Visa / Mastercard", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
              { label: "American Express", color: "bg-sky-50 text-sky-700 border-sky-200" },
              { label: "Klarna", color: "bg-pink-50 text-pink-700 border-pink-200" },
              { label: "Apple Pay / Google Pay", color: "bg-gray-50 text-gray-700 border-gray-200" },
              { label: "Banküberweisung", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            ].map((pm, i) => (
              <span key={i} className={`border px-4 py-2 rounded-full text-sm font-semibold ${pm.color}`}>
                {pm.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Einfache Preisgestaltung</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Die KI-Analyse mit drei Textvorlagen ist kostenlos. Premium schaltet PDF-Export und erweiterte Argumentation frei.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Basisanalyse</CardTitle>
                <CardDescription>Kostenlose KI-Ersteinschätzung</CardDescription>
                <div className="text-4xl font-black mt-3">0 <span className="text-lg font-normal text-muted-foreground">€</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm">
                  {["Gemini-Erfolgswahrscheinlichkeit", "Beweis-Checkliste", "3 Textvorlagen", "Rechtliche Grundlagen", "Gegenargumente"].map((f) => (
                    <li key={f} className="flex gap-2.5 items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/fall-pruefen">
                  <Button className="w-full mt-2" variant="outline">Jetzt starten</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary shadow-lg relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                Empfohlen
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Premium Bericht</CardTitle>
                <CardDescription>Einmalig pro Fall</CardDescription>
                <div className="text-4xl font-black mt-3">7,99 <span className="text-lg font-normal text-muted-foreground">€</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm">
                  {["Alles aus Basis", "Druckfertiges PDF", "Erweiterte Argumentation", "Gerichtsbarkeitsanalyse", "Prioritäts-Support"].map((f) => (
                    <li key={f} className="flex gap-2.5 items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-2">Premium wählen</Button>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Abo</CardTitle>
                <CardDescription>Für mehrere Fälle</CardDescription>
                <div className="text-4xl font-black mt-3">9,99 <span className="text-lg font-normal text-muted-foreground">€/mtl.</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm">
                  {["Unbegrenzte Fälle", "Gespeicherte Fälle", "Alle Premium-Features", "Fristen-Reminder", "E-Mail-Support"].map((f) => (
                    <li key={f} className="flex gap-2.5 items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-2" variant="outline">Abo abschließen</Button>
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
            <p className="text-muted-foreground mb-4 text-sm">Bereit, deinen Fall zu prüfen?</p>
            <Link href="/fall-pruefen">
              <Button size="lg" className="gap-2">
                Fall kostenlos analysieren
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
