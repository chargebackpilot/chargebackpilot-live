import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "wouter";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CreditCard,
  FileText,
  GitCompare,
  Landmark,
  Plane,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { getMerchant, getProblem, getProblemDisplayLabel, MERCHANTS } from "@/data/merchants";
import { getAllSeoQualityResults } from "@/seo-quality";

interface GuideLink {
  path: string;
  title: string;
  desc: string;
}

interface Cluster {
  title: string;
  desc: string;
  icon: LucideIcon;
  links: GuideLink[];
}

export const GUIDES: GuideLink[] = [
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
    desc: "Umsatzreklamationen bei Kreditkartenzahlungen strukturiert vorbereiten.",
  },
  {
    path: "/klarna-reklamation",
    title: "Klarna Reklamation",
    desc: "Probleme bei Klarna-Zahlungen sachlich melden und Belege ordnen.",
  },
  {
    path: "/flug-chargeback",
    title: "Flug Chargeback",
    desc: "Erstattungsfragen bei Ausfällen und Stornierungen nachvollziehbar prüfen.",
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
    desc: "Kalte, falsche oder fehlende Bestellungen belegorientiert einordnen.",
  },
  {
    path: "/ubereats-rueckerstattung",
    title: "Uber Eats Rückerstattung",
    desc: "Nicht gelieferte oder falsche Bestellung sachlich aufbereiten.",
  },
  {
    path: "/ware-nicht-erhalten",
    title: "Ware nicht erhalten",
    desc: "Tracking, Händlerkontakt und Zahlungsweg sauber sortieren.",
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
    desc: "Klärung und Zahlungsstand sachlich beim Händler anfragen.",
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

const QUICK_ENTRY_LINKS: Array<GuideLink & { tag: string; icon: LucideIcon }> = [
  {
    path: "/hilfe/apple",
    tag: "App Store",
    icon: CreditCard,
    title: "Apple / iTunes Abbuchung prüfen",
    desc: "Abo, In-App-Kauf oder App-Store-Zahlung sachlich einordnen.",
  },
  {
    path: "/hilfe/uber-eats",
    tag: "Lieferdienst",
    icon: Utensils,
    title: "Uber Eats Reklamation",
    desc: "Fehlende, falsche oder unbrauchbare Bestellung dokumentieren.",
  },
  {
    path: "/scam-shops-2026",
    tag: "Warnsignale",
    icon: AlertTriangle,
    title: "Fake-Shop-Verdacht prüfen",
    desc: "Belege sichern und den passenden Zahlungsweg prüfen.",
  },
  {
    path: "/vergleich/paypal-vs-kreditkarte-vs-klarna",
    tag: "Vergleich",
    icon: GitCompare,
    title: "PayPal vs Klarna vs Kreditkarte",
    desc: "Reklamationswege je nach Zahlungsart gegenüberstellen.",
  },
];

const FINDER_STEPS: Array<{
  title: string;
  desc: string;
  icon: LucideIcon;
  links: Pick<GuideLink, "path" | "title">[];
}> = [
  {
    title: "Zahlungsweg klären",
    desc: "PayPal, Kreditkarte, Klarna oder Lastschrift entscheiden oft über Fristen und Ablauf.",
    icon: CreditCard,
    links: [
      { title: "PayPal", path: "/paypal-chargeback" },
      { title: "Kreditkarte", path: "/visa-mastercard-chargeback" },
      { title: "Klarna", path: "/klarna-reklamation" },
    ],
  },
  {
    title: "Problemtyp eingrenzen",
    desc: "Nicht geliefert, Flug storniert, Abo-Falle oder Lieferdienst: der Falltyp bestimmt die Belege.",
    icon: Search,
    links: [
      { title: "Ware fehlt", path: "/ware-nicht-erhalten" },
      { title: "Flug & Reise", path: "/flug-chargeback" },
      { title: "Abo-Falle", path: "/abo-falle-chargeback" },
    ],
  },
  {
    title: "Text sauber vorbereiten",
    desc: "Wenn die Fakten sortiert sind, helfen Vorlagen für Händler, PayPal, Klarna oder Bank.",
    icon: FileText,
    links: [
      { title: "Bank-Antrag", path: "/chargeback-antrag-vorlage" },
      { title: "PayPal-Vorlage", path: "/paypal-kaeuferschutz-vorlage" },
      { title: "Musterbrief", path: "/ware-nicht-erhalten-musterbrief" },
    ],
  },
];

const GUIDE_CLUSTERS: Cluster[] = [
  {
    title: "Zahlungsarten",
    desc: "Wenn du schon weißt, womit bezahlt wurde.",
    icon: CreditCard,
    links: [
      GUIDES[0],
      GUIDES[2],
      GUIDES[3],
      GUIDES[1],
      {
        path: "/vergleich/paypal-vs-kreditkarte-vs-klarna",
        title: "PayPal vs Klarna vs Kreditkarte",
        desc: "Schutzwege nebeneinander prüfen.",
      },
    ],
  },
  {
    title: "Vorlagen & Mustertexte",
    desc: "Für Händlerkontakt, Bank, PayPal oder Klarna.",
    icon: FileText,
    links: [GUIDES[11], GUIDES[12], GUIDES[13], GUIDES[14], GUIDES[15], GUIDES[16]],
  },
  {
    title: "Problemfälle",
    desc: "Für typische Situationen nach Kauf, Reise oder Lieferung.",
    icon: ShoppingBag,
    links: [GUIDES[9], GUIDES[10], GUIDES[4], GUIDES[5], GUIDES[6], GUIDES[7], GUIDES[8]],
  },
  {
    title: "Sonderfälle & Einordnung",
    desc: "Für Warnsignale, Reason Codes und den nächsten Eskalationsschritt.",
    icon: ShieldCheck,
    links: [
      {
        path: "/scam-shops-2026",
        title: "Shop-Warnsignale 2026",
        desc: "Auffällige Shops vorsichtig einordnen.",
      },
      GUIDES[17],
      GUIDES[18],
      GUIDES[16],
    ],
  },
];

function LinkPill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-8 items-center gap-1 rounded-md border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary hover:text-primary"
    >
      {children}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {description && (
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

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
        title: `${merchant.name}: ${getProblemDisplayLabel(merchant, problem)}`,
        desc: `${getProblemDisplayLabel(merchant, problem)} bei ${merchant.name} strukturiert vorbereiten.`,
      },
    ];
  });
  const itemListLinks = Array.from(
    new Map(
      [...QUICK_ENTRY_LINKS, ...GUIDE_CLUSTERS.flatMap((cluster) => cluster.links)].map((item) => [
        item.path,
        item,
      ])
    ).values()
  );
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ratgeber & Chargeback-Guides",
    url: "https://chargebackpilot.de/ratgeber",
    inLanguage: "de-DE",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: itemListLinks.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `https://chargebackpilot.de${item.path}`,
      })),
    },
  };

  return (
    <MainLayout>
      <SeoHead
        title="Ratgeber & Chargeback-Guides 2026 | ChargebackPilot"
        description="Praxisnahe Schritt-für-Schritt-Anleitungen für Käuferschutz, Chargeback und Reklamation — sortiert nach Zahlungsart, Anbieter und Problemtyp."
        canonical="/ratgeber"
        jsonLd={[collectionSchema]}
      />
      <Breadcrumbs items={[{ label: "Ratgeber" }]} />

      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-12">
        <header className="mb-12 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
              <BookOpen className="h-4 w-4" />
              Ratgeber-Hub
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              Chargeback, Käuferschutz und Reklamation richtig einordnen
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Starte beim Zahlungsweg, grenze den Problemtyp ein und sammle die richtigen Belege.
              Dieser Hub verbindet die wichtigsten Guides, Vorlagen und Anbieterfälle ohne
              Erfolgsversprechen und ohne Rechtsberatung.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <LinkPill href="/chargeback-antrag-vorlage">Chargeback Antrag</LinkPill>
              <LinkPill href="/paypal-kaeuferschutz-vorlage">PayPal Vorlage</LinkPill>
              <LinkPill href="/scam-shops-2026">Shop-Warnsignale</LinkPill>
            </div>
          </div>

          <Card className="border-primary/15 bg-primary/5 shadow-sm">
            <CardContent className="p-5">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                Schnell sortieren
              </p>
              <h2 className="text-xl font-bold">Welcher Guide passt?</h2>
              <div className="mt-4 space-y-3">
                {[
                  { icon: CreditCard, text: "Zahlungsweg: PayPal, Karte, Klarna oder Bank" },
                  { icon: ShoppingBag, text: "Problem: nicht geliefert, falsch, Abo oder Reise" },
                  { icon: FileText, text: "Belege: Zahlung, Bestellung, Verlauf, Fotos" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex gap-3 text-sm text-foreground/85">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
              <Link href="/vorlagen-generator?new=1">
                <Button className="mt-5 w-full gap-2">
                  Fall-Check starten
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </header>

        <section className="mb-12">
          <SectionIntro
            eyebrow="Schnelle Einstiege"
            title="Aktuelle und häufige Suchintentionen"
            description="Vier direkte Wege zu Themen, bei denen Nutzer meist schnell eine konkrete Orientierung brauchen."
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_ENTRY_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Card className="h-full cursor-pointer transition-colors hover:border-primary">
                    <CardContent className="flex h-full flex-col p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                          {item.tag}
                        </span>
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold leading-snug">{item.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                      <ArrowRight className="mt-4 h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <SectionIntro
            eyebrow="Wegweiser"
            title="In drei Schritten zum passenden Einstieg"
            description="Wenn du unsicher bist, beginne hier: erst Zahlungsweg, dann Problemtyp, dann der passende Text."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {FINDER_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="h-full">
                  <CardContent className="p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {step.links.map((link) => (
                        <LinkPill key={link.path} href={link.path}>
                          {link.title}
                        </LinkPill>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <SectionIntro
            eyebrow="Themencluster"
            title="Alle zentralen Ratgeber nach Thema"
            description="Kompakt gruppiert, damit du nicht durch doppelte Listen scrollen musst."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {GUIDE_CLUSTERS.map((cluster) => {
              const Icon = cluster.icon;
              return (
                <Card key={cluster.title} className="h-full">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{cluster.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {cluster.desc}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      {cluster.links.map((guide) => (
                        <Link
                          key={guide.path}
                          href={guide.path}
                          className="group rounded-lg border bg-background p-3 transition-colors hover:border-primary"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold leading-snug">{guide.title}</p>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                {guide.desc}
                              </p>
                            </div>
                            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-12 rounded-2xl border bg-muted/30 p-5 md:p-7">
          <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-start">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                Vorgehensweise
              </p>
              <h2 className="text-2xl font-bold tracking-tight">So nutzt du den Hub sinnvoll</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Landmark,
                  title: "Regeln prüfen",
                  text: "Fristen und Verfahren hängen von Bank, PayPal, Klarna oder Anbieter ab.",
                },
                {
                  icon: ShieldCheck,
                  title: "Sachlich bleiben",
                  text: "Keine Vorwürfe ohne Beleg, sondern Chronologie und Nachweise ordnen.",
                },
                {
                  icon: Plane,
                  title: "Einzelfall beachten",
                  text: "Die Guides geben Orientierung, ersetzen aber keine rechtliche Prüfung.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title}>
                    <Icon className="mb-2 h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {priorityMerchantProblems.length > 0 && (
          <section className="mb-12">
            <SectionIntro
              eyebrow="Anbieterfälle"
              title="Priorisierte Anbieter-Probleme"
              description="Konkrete Fälle mit Beleglisten, Zahlungsweg und sachlichen nächsten Schritten."
            />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {priorityMerchantProblems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Card className="h-full cursor-pointer transition-colors hover:border-primary">
                    <CardContent className="flex h-full items-start justify-between gap-3 p-4">
                      <div>
                        <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionIntro
            eyebrow="Anbieter"
            title="Nach Anbieter suchen"
            description="Hubs für bekannte Shops, Plattformen, Lieferdienste, Reiseanbieter und digitale Dienste."
          />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {MERCHANTS.map((m) => (
              <Link key={m.slug} href={`/hilfe/${m.slug}`}>
                <Card className="cursor-pointer transition-colors hover:border-primary">
                  <CardContent className="flex min-h-12 items-center justify-between gap-2 p-3">
                    <span className="text-sm font-medium leading-snug">{m.name}</span>
                    <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
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
