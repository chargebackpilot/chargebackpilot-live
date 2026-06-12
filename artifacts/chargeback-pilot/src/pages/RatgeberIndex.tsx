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
    desc: "Wie du dein Geld bei PayPal zurückholst.",
  },
  {
    path: "/amex-chargeback",
    title: "Amex Chargeback",
    desc: "American Express Reklamationen erfolgreich einreichen.",
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
    desc: "Steuern & Gebühren ohne 59€ Gebühr zurückholen.",
  },
  {
    path: "/lieferando-rueckerstattung",
    title: "Lieferando Rückerstattung",
    desc: "Geld zurück bei kaltem oder fehlendem Essen.",
  },
  {
    path: "/wolt-rueckerstattung",
    title: "Wolt Erstattung",
    desc: "Chargeback bei kalten Bestellungen oder Umwegen.",
  },
  {
    path: "/ubereats-rueckerstattung",
    title: "Uber Eats Chargeback",
    desc: "Essen nicht angekommen? So gibt's das Geld zurück.",
  },
  {
    path: "/ware-nicht-erhalten",
    title: "Ware nicht erhalten",
    desc: "Was tun, wenn das Paket nie ankommt?",
  },
  {
    path: "/abo-falle-chargeback",
    title: "Abo-Falle",
    desc: "Ungewollte Abbuchungen stoppen und Geld zurückfordern.",
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
    title: "Scam-Shops & Fake-Anbieter 2026",
    desc: "8 Warnsignale, 4 Scam-Kategorien und die strukturierte Orientierung, wie du dein Geld zurückholst.",
    tag: "Betrugsschutz",
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
