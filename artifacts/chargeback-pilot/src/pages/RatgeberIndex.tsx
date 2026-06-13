import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, AlertTriangle, GitCompare, Store } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { getMerchant, getProblem, MERCHANTS } from "@/data/merchants";
import { getAllSeoQualityResults } from "@/seo-quality";

export const GUIDES = [
  {
    path: "/paypal-chargeback",
    title: "PayPal Käuferschutz",
    desc: "Konflikt sachlich vorbereiten und PayPal-Fristen im Blick behalten.",
  },
  {
    path: "/amex-chargeback",
    title: "Amex Chargeback",
    desc: "American-Express-Umsatzreklamationen strukturiert vorbereiten.",
  },
  {
    path: "/visa-mastercard-chargeback",
    title: "Visa & Mastercard Chargeback",
    desc: "Der Weg zur Rückerstattung bei Kreditkartenzahlungen.",
  },
  {
    path: "/klarna-reklamation",
    title: "Klarna Reklamation",
    desc: "Käuferschutz bei Klarna-Zahlungen nutzen.",
  },
  {
    path: "/flug-chargeback",
    title: "Flug Chargeback",
    desc: "Reiserückerstattung bei Ausfällen und Stornierungen.",
  },
  {
    path: "/kiwi-rueckerstattung",
    title: "Kiwi.com Erstattung",
    desc: "Steuern, Gebühren und Erstattungswege nachvollziehbar prüfen.",
  },
  {
    path: "/lieferando-rueckerstattung",
    title: "Lieferando Rückerstattung",
    desc: "Problem mit kaltem, falschem oder fehlendem Essen dokumentieren.",
  },
  {
    path: "/wolt-rueckerstattung",
    title: "Wolt Erstattung",
    desc: "Chargeback bei kalten Bestellungen oder Umwegen.",
  },
  {
    path: "/ubereats-rueckerstattung",
    title: "Uber Eats Chargeback",
    desc: "Nicht gelieferte oder falsche Bestellung sachlich aufbereiten.",
  },
  {
    path: "/ware-nicht-erhalten",
    title: "Ware nicht erhalten",
    desc: "Was tun, wenn das Paket nie ankommt?",
  },
  {
    path: "/abo-falle-chargeback",
    title: "Abo-Falle",
    desc: "Ungewollte Abbuchungen prüfen und Widerspruch vorbereiten.",
  },
  {
    path: "/chargeback-antrag-vorlage",
    title: "Chargeback Antrag Vorlage",
    desc: "Mustertext für Bank und Kreditkartenreklamation.",
  },
  {
    path: "/paypal-kaeuferschutz-vorlage",
    title: "PayPal Käuferschutz Vorlage",
    desc: "Sachlicher Text für Konfliktcenter und Eskalation.",
  },
  {
    path: "/klarna-reklamation-vorlage",
    title: "Klarna Reklamation Vorlage",
    desc: "Problem melden, Rechnung klären und Belege ordnen.",
  },
  {
    path: "/ware-nicht-erhalten-musterbrief",
    title: "Ware nicht erhalten Musterbrief",
    desc: "Vorlage für Händler, PayPal, Klarna oder Bank.",
  },
  {
    path: "/abo-falle-musterbrief",
    title: "Abo-Falle Musterbrief",
    desc: "Ungewollter Abbuchung widersprechen.",
  },
  {
    path: "/rueckerstattung-haendler-vorlage",
    title: "Rückerstattung Händler Vorlage",
    desc: "Geld sachlich vom Händler zurückfordern.",
  },
  {
    path: "/visa-reason-code-13-1",
    title: "Visa Reason Code 13.1",
    desc: "Ware oder Leistung nicht erhalten verständlich einordnen.",
  },
  {
    path: "/mastercard-chargeback-reason-code",
    title: "Mastercard Reason Codes",
    desc: "Chargeback-Gründe für die Bank sauber vorbereiten.",
  },
];

const HIGHLIGHTS = [
  {
    path: "/vergleich/paypal-vs-kreditkarte-vs-klarna",
    icon: GitCompare,
    title: "PayPal vs. Kreditkarte vs. Klarna",
    desc: "Vergleich 2026 — welche Reklamationswege im Streitfall je nach Zahlungsart häufig in Betracht kommen.",
    tag: "Vergleich",
  },
  {
    path: "/scam-shops-2026",
    icon: AlertTriangle,
    title: "Fake-Shop-Verdacht & Warnsignale 2026",
    desc: "8 Warnsignale, 4 typische Muster und strukturierte nächste Schritte bei auffälligen Online-Shops.",
    tag: "Warnsignale",
  },
];

const QUICK_PATHS = [
  {
    title: "Nach Zahlungsart starten",
    desc: "PayPal, Kreditkarte, Amex oder Klarna: finde den passenden Ablauf.",
    links: [
      { label: "PayPal", href: "/paypal-chargeback" },
      { label: "Kreditkarte", href: "/visa-mastercard-chargeback" },
      { label: "Klarna", href: "/klarna-reklamation" },
    ],
  },
  {
    title: "Nach Problem suchen",
    desc: "Nicht geliefert, Flug storniert, Abo-Falle oder Lieferdienst.",
    links: [
      { label: "Ware fehlt", href: "/ware-nicht-erhalten" },
      { label: "Flug & Reise", href: "/flug-chargeback" },
      { label: "Abo-Falle", href: "/abo-falle-chargeback" },
    ],
  },
  {
    title: "Direkt mit Vorlage arbeiten",
    desc: "Mustertexte für Bank, Händler, PayPal oder Klarna vorbereiten.",
    links: [
      { label: "Chargeback-Antrag", href: "/chargeback-antrag-vorlage" },
      { label: "PayPal-Vorlage", href: "/paypal-kaeuferschutz-vorlage" },
      { label: "Musterbrief", href: "/ware-nicht-erhalten-musterbrief" },
    ],
  },
];

const ESCALATION_PATHS = [
  {
    title: "Erstkontakt vorbereiten",
    desc: "Für Fälle, in denen der Händler noch reagieren könnte und du eine saubere schriftliche Grundlage brauchst.",
    links: [
      { label: "Händler-Vorlage", href: "/rueckerstattung-haendler-vorlage" },
      { label: "Ware fehlt", href: "/ware-nicht-erhalten-musterbrief" },
      { label: "Abo widersprechen", href: "/abo-falle-musterbrief" },
    ],
  },
  {
    title: "Zahlungsdienstleister einschalten",
    desc: "Wenn der Händler nicht reagiert, eine Zahlung streitig ist oder eine Leistung nicht erbracht wurde.",
    links: [
      { label: "PayPal Käuferschutz", href: "/paypal-chargeback" },
      { label: "Kreditkarte", href: "/visa-mastercard-chargeback" },
      { label: "Klarna", href: "/klarna-reklamation" },
    ],
  },
  {
    title: "Sonderfälle einordnen",
    desc: "Für Fälle mit höherem Erklärungsbedarf, etwa auffällige Online-Shops, Reason Codes oder Reisevermittler.",
    links: [
      { label: "Shop-Warnsignale", href: "/scam-shops-2026" },
      { label: "Visa 13.1", href: "/visa-reason-code-13-1" },
      { label: "Kiwi.com", href: "/kiwi-rueckerstattung" },
    ],
  },
];

const MONEY_GUIDE_LINKS = [
  {
    href: "/chargeback-antrag-vorlage",
    keyword: "Chargeback Antrag Vorlage",
    intent: "Bank oder Kreditkartenherausgeber sachlich um Prüfung bitten.",
  },
  {
    href: "/paypal-kaeuferschutz-vorlage",
    keyword: "PayPal Käuferschutz Vorlage",
    intent: "Konfliktcenter und Eskalation klar formulieren.",
  },
  {
    href: "/klarna-reklamation-vorlage",
    keyword: "Klarna Reklamation Vorlage",
    intent: "Rechnung, Retoure oder Lieferproblem strukturiert melden.",
  },
  {
    href: "/ware-nicht-erhalten-musterbrief",
    keyword: "Ware nicht erhalten Musterbrief",
    intent: "Händler, PayPal, Klarna oder Bank nachvollziehbar anschreiben.",
  },
  {
    href: "/visa-mastercard-chargeback",
    keyword: "Visa & Mastercard Chargeback",
    intent: "Kartenumsatz und Belege für die Bank sortieren.",
  },
  {
    href: "/paypal-chargeback",
    keyword: "PayPal Chargeback",
    intent: "Käuferschutz, Konfliktcenter und Kartenweg sauber trennen.",
  },
  {
    href: "/scam-shops-2026",
    keyword: "Fake-Shop-Verdacht",
    intent: "Warnsignale prüfen und Zahlungsweg zeitnah sichern.",
  },
  {
    href: "/vergleich/paypal-vs-kreditkarte-vs-klarna",
    keyword: "PayPal vs. Kreditkarte vs. Klarna",
    intent: "Den passenden Käuferschutzweg nach Zahlungsart auswählen.",
  },
  {
    href: "/lieferando-rueckerstattung",
    keyword: "Lieferando Rückerstattung",
    intent: "Kalte, falsche oder fehlende Lieferung dokumentieren.",
  },
  {
    href: "/kiwi-rueckerstattung",
    keyword: "Kiwi.com Rückerstattung",
    intent: "Steuern, Gebühren und Zahlungsweg getrennt prüfen.",
  },
];

export default function RatgeberIndex() {
  const priorityMerchantProblems = getAllSeoQualityResults().flatMap((result) => {
    if (result.status !== "index") return [];
    const [, , merchantSlug, problemSlug] = result.url.split("/");
    const merchant = getMerchant(merchantSlug);
    const problem = getProblem(problemSlug);
    if (!merchant || !problem) return [];
    return [
      {
        path: result.url,
        title: `${merchant.name}: ${problem.label}`,
        desc: `${problem.searchPhrase} bei ${merchant.name} strukturiert vorbereiten.`,
      },
    ];
  });

  return (
    <MainLayout>
      <SeoHead
        title="Ratgeber & Chargeback-Guides 2026 | ChargebackPilot"
        description="Praxisnahe Schritt-für-Schritt-Anleitungen für Käuferschutz, Chargeback und Reklamation — sortiert nach Zahlungsart, Anbieter und Problemtyp."
        canonical="/ratgeber"
      />
      <Breadcrumbs items={[{ label: "Ratgeber" }]} />

      <div className="container mx-auto max-w-5xl py-12 px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Ratgeber & Chargeback-Guides</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto min-h-[3.5rem] [font-family:Inter,system-ui,-apple-system,Segoe_UI,Roboto,Helvetica,Arial,sans-serif]">
            <span className="md:hidden">
              Praxis-Guides für schnelle Rückerstattung bei Zahlungsproblemen.
            </span>
            <span className="hidden md:inline">
              Praxisnahe Informationen, Tipps und Schritt-für-Schritt-Anleitungen für typische
              Zahlungsprobleme.
            </span>
          </p>
        </div>

        <section className="mb-16">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                Häufig gesucht
              </p>
              <h2 className="text-2xl font-bold">Direkt zu den wichtigsten Lösungen</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Die meistgesuchten Einstiegspunkte sind bewusst priorisiert: erst Vorlage oder
              Zahlungsweg wählen, dann Belege und nächsten Schritt sauber vorbereiten.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {MONEY_GUIDE_LINKS.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="h-full cursor-pointer transition-colors hover:border-primary">
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <h3 className="mb-1 font-semibold">{item.keyword}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.intent}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-5">Schnell zum passenden Einstieg</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {QUICK_PATHS.map((group) => (
              <Card key={group.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {group.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex flex-wrap gap-2">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Highlights */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-5">Top-Empfehlungen</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon;
              return (
                <Link key={i} href={h.path}>
                  <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          {h.tag}
                        </span>
                      </div>
                      <CardTitle className="flex items-start justify-between gap-3">
                        <span>{h.title}</span>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm leading-relaxed">
                        {h.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-16 rounded-2xl border bg-muted/30 p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4">Wie du den passenden Guide auswählst</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-2">1. Zahlungsweg klären</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                PayPal, Kreditkarte, Klarna, SEPA oder Überweisung haben unterschiedliche Regeln.
                Starte deshalb nicht beim Händlernamen, sondern bei der tatsächlichen Zahlung.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Problemtyp eingrenzen</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Nicht geliefert, falsch geliefert, Flug storniert oder Abo-Falle: Der Problemtyp
                entscheidet, welche Belege und Formulierungen am wichtigsten sind.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Belege sichern</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Screenshots, Zahlungsnachweis, Tracking und Händlerkommunikation machen aus einer
                Beschwerde eine prüfbare Fallakte. Genau darauf sind die Guides ausgelegt.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Alle Ratgeber sind als praktische Orientierung für Verbraucher in Deutschland gedacht.
            Sie ersetzen keine Rechtsberatung, vermeiden Erfolgsversprechen und nennen Fristen nur
            als allgemeine Hinweise, die du beim jeweiligen Anbieter prüfen solltest.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-5">Nach Eskalationsstufe</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {ESCALATION_PATHS.map((group) => (
              <Card key={group.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {group.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex flex-wrap gap-2">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Core guides */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-5">Nach Zahlungsart & Problemtyp</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GUIDES.map((guide, i) => (
              <Link key={i} href={guide.path}>
                <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-4 text-lg">
                      <span>{guide.title}</span>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-relaxed">
                      {guide.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-5">Priorisierte Anbieter-Probleme</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priorityMerchantProblems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-4 text-lg">
                      <span>{item.title}</span>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-relaxed">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Merchant hubs */}
        <section>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            Nach Anbieter
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Direkt zu deinem Anbieter — mit individuellen Anleitungen pro Problemtyp.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {MERCHANTS.map((m) => (
              <Link key={m.slug} href={`/hilfe/${m.slug}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{m.name}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
