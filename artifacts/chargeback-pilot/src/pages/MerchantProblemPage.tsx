import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  FileText,
  ExternalLink,
  CalendarCheck,
  PenLine,
} from "lucide-react";
import NotFound from "./not-found";
import {
  getMerchant,
  getProblem,
  getProblemDisplayLabel,
  generateMerchantProblemCopy,
  MERCHANTS,
} from "@/data/merchants";
import { isIndexableMerchantProblemPath } from "@/seo-quality";

const SITE = "https://chargebackpilot.de";
const DISPLAY_UPDATED_AT = "25. Juni 2026";
const SCHEMA_UPDATED_AT = "2026-06-25";

const TRUST_LABEL: Record<string, { label: string; color: string }> = {
  trusted: {
    label: "Bekannter Anbieter",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  mixed: {
    label: "Einzelfall genau dokumentieren",
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  risky: {
    label: "Sorgfältige Belege sinnvoll",
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
  scam_reported: {
    label: "Drittanbieter genau prüfen",
    color: "bg-red-100 text-red-800 border-red-300",
  },
};

interface GuideLink {
  href: string;
  label: string;
  description: string;
}

const PROBLEM_GUIDE_LINKS: Record<string, GuideLink[]> = {
  "ware-nicht-erhalten": [
    {
      href: "/ware-nicht-erhalten-musterbrief",
      label: "Ware nicht erhalten Musterbrief",
      description: "Sachlicher Aufbau für Händler, PayPal, Klarna oder Bank.",
    },
    {
      href: "/paypal-kaeuferschutz-vorlage",
      label: "PayPal Käuferschutz Vorlage",
      description: "Textaufbau für Konfliktcenter und Eskalation.",
    },
    {
      href: "/visa-mastercard-chargeback",
      label: "Kreditkarten-Chargeback",
      description: "Umsatzreklamation bei Visa oder Mastercard einordnen.",
    },
  ],
  "lieferung-falsch": [
    {
      href: "/lieferando-rueckerstattung",
      label: "Lieferdienst-Rückerstattung",
      description: "Falsche, kalte oder unvollständige Bestellung dokumentieren.",
    },
    {
      href: "/paypal-kaeuferschutz-vorlage",
      label: "PayPal-Text vorbereiten",
      description: "Kurz und belegorientiert im PayPal-Konfliktcenter formulieren.",
    },
    {
      href: "/visa-mastercard-chargeback",
      label: "Kartenzahlung prüfen",
      description: "Kartenumsatz und Belege für die Bank sortieren.",
    },
  ],
  "flug-storniert": [
    {
      href: "/flug-chargeback",
      label: "Flug Chargeback",
      description: "Stornierung, Erstattung, Gutschein und Zahlungsweg trennen.",
    },
    {
      href: "/chargeback-antrag-vorlage",
      label: "Bank-Antrag Vorlage",
      description: "Umsatzreklamation mit Buchung und Belegen vorbereiten.",
    },
    {
      href: "/paypal-chargeback",
      label: "PayPal bei Reisebuchung",
      description: "Konfliktcenter und Zahlungsquelle sauber unterscheiden.",
    },
  ],
  "abbuchung-ohne-zustimmung": [
    {
      href: "/abo-falle-musterbrief",
      label: "Abbuchung widersprechen",
      description: "Anbieteranschreiben mit Umsatz, Kündigung und Vertragsgrundlage.",
    },
    {
      href: "/chargeback-antrag-vorlage",
      label: "Umsatzreklamation",
      description: "Bank-Anfrage sachlich und belegorientiert vorbereiten.",
    },
  ],
};

const SPECIAL_GUIDE_LINKS: Record<string, GuideLink[]> = {
  "amazon/ware-nicht-erhalten": [
    {
      href: "/chargeback-antrag-vorlage",
      label: "Chargeback Antrag Vorlage",
      description: "Bank-Antrag mit Umsatz, Bestellnummer und Händlerkontakt aufbauen.",
    },
    {
      href: "/ware-nicht-erhalten-musterbrief",
      label: "Ware nicht erhalten Musterbrief",
      description: "Händlerkontakt und Zahlungsweg nachvollziehbar dokumentieren.",
    },
    {
      href: "/paypal-kaeuferschutz-vorlage",
      label: "PayPal Käuferschutz Vorlage",
      description: "Falls die Zahlung über PayPal lief: Konflikt sauber formulieren.",
    },
    {
      href: "/scam-shops-2026",
      label: "Shop-Warnsignale prüfen",
      description: "Bei Drittanbieter- oder Marktplatzfällen Belege zusätzlich sichern.",
    },
  ],
  "uber-eats/ware-nicht-erhalten": [
    {
      href: "/hilfe/lieferando/lieferung-falsch",
      label: "Lieferando Reklamation",
      description: "Vergleichbarer Ablauf für Essen, Support-Chat und Zahlungsweg.",
    },
    {
      href: "/hilfe/wolt/lieferung-falsch",
      label: "Wolt Lieferung falsch",
      description: "Konkrete Belege bei falscher oder unvollständiger Lieferung.",
    },
    {
      href: "/paypal-kaeuferschutz-vorlage",
      label: "PayPal-Text vorbereiten",
      description: "Wenn die App-Zahlung über PayPal lief.",
    },
    {
      href: "/visa-mastercard-chargeback",
      label: "Kartenzahlung prüfen",
      description: "Umsatz, Supportantwort und Betrag für die Bank sortieren.",
    },
  ],
  "lieferando/lieferung-falsch": [
    {
      href: "/hilfe/wolt/lieferung-falsch",
      label: "Wolt Lieferung falsch",
      description: "Ähnliche Beleglogik bei App-Support und Essenslieferung.",
    },
    {
      href: "/hilfe/uber-eats/lieferung-falsch",
      label: "Uber Eats Reklamation",
      description: "Supportverlauf, Fotos und Zahlungsweg vergleichbar dokumentieren.",
    },
    {
      href: "/paypal-kaeuferschutz-vorlage",
      label: "PayPal Käuferschutz Vorlage",
      description: "Sachlicher Text für PayPal-Zahlungen bei Lieferproblemen.",
    },
  ],
  "kiwi/flug-storniert": [
    {
      href: "/hilfe/ryanair/flug-storniert",
      label: "Ryanair Flug storniert",
      description: "Airline-Fall direkt mit Buchung, Stornierung und Zahlungsweg prüfen.",
    },
    {
      href: "/flug-chargeback",
      label: "Flug Chargeback",
      description: "Ticketpreis, Steuern, Gebühren und Gutschein sauber trennen.",
    },
    {
      href: "/visa-mastercard-chargeback",
      label: "Kreditkarten-Chargeback",
      description: "Kartenzahlung und Erstattungsantworten für die Bank sortieren.",
    },
    {
      href: "/rueckerstattung-haendler-vorlage",
      label: "Rückerstattung anfordern",
      description: "Sachliche Anfrage an Anbieter oder Vermittler vorbereiten.",
    },
  ],
};

function merchantProblemGuideLinks(merchantSlug: string, problemSlug: string, currentPath: string) {
  const key = `${merchantSlug}/${problemSlug}`;
  const links = [
    ...(SPECIAL_GUIDE_LINKS[key] ?? []),
    ...(PROBLEM_GUIDE_LINKS[problemSlug] ?? []),
    {
      href: "/vergleich/paypal-vs-kreditkarte-vs-klarna",
      label: "Zahlungswege vergleichen",
      description: "PayPal, Kreditkarte und Klarna nach Belegen und Fristen einordnen.",
    },
  ];

  const seen = new Set<string>();
  return links
    .filter((link) => {
      if (link.href === currentPath || seen.has(link.href)) return false;
      if (/^\/hilfe\/[^/]+\/[^/]+$/.test(link.href) && !isIndexableMerchantProblemPath(link.href)) {
        return false;
      }
      seen.add(link.href);
      return true;
    })
    .slice(0, 5);
}

export default function MerchantProblemPage() {
  const [, params] = useRoute<{ merchantSlug: string; problemSlug: string }>(
    "/hilfe/:merchantSlug/:problemSlug"
  );
  const merchant = params ? getMerchant(params.merchantSlug) : null;
  const problem = params ? getProblem(params.problemSlug) : null;
  if (!merchant || !problem || !merchant.problems.includes(problem.slug)) {
    return <NotFound />;
  }

  const copy = generateMerchantProblemCopy(merchant, problem);
  const trust = TRUST_LABEL[merchant.trustLevel];
  // Prefill the wizard with everything we already know (problem + merchant + preferred
  // payment for this problem). Wizard still starts at step 1 so the user fills any
  // remaining required fields (e.g. payment for them, amount, date).
  const preferredPayment = problem.paymentMethods[0];
  const wizardPaymentParam: Record<string, string> = {
    paypal: "paypal",
    kreditkarte: "visa_mastercard",
    klarna: "klarna",
    lastschrift: "bank_transfer",
    apple_pay: "apple_google_pay",
  };
  const wizardPayment = preferredPayment ? (wizardPaymentParam[preferredPayment] ?? "") : "";
  const wizardParams = new URLSearchParams({
    problem: problem.wizardProblemId,
    merchant: merchant.name,
    ...(wizardPayment ? { payment: wizardPayment } : {}),
  });
  const wizardHref = `/vorlagen-generator?${wizardParams.toString()}`;

  const breadcrumbItems = [
    { label: "Ratgeber", href: "/ratgeber" },
    { label: merchant.name, href: `/hilfe/${merchant.slug}` },
    { label: copy.displayLabel },
  ];

  const canonicalPath = `/hilfe/${merchant.slug}/${problem.slug}`;
  const fullUrl = `${SITE}${canonicalPath}`;
  const isIndexable = isIndexableMerchantProblemPath(canonicalPath);

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${merchant.name} ${copy.displayLabel}: strukturiert vorgehen`,
    description: copy.metaDescription,
    totalTime: "PT15M",
    supply: copy.evidence.map((e) => ({ "@type": "HowToSupply", name: e })),
    step: copy.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Schritt ${i + 1}`,
      text: s,
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: copy.title,
    description: copy.metaDescription,
    inLanguage: "de-DE",
    author: { "@type": "Organization", name: "ChargebackPilot" },
    publisher: {
      "@type": "Organization",
      name: "ChargebackPilot",
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` },
    },
    mainEntityOfPage: fullUrl,
    datePublished: "2026-01-15",
    dateModified: SCHEMA_UPDATED_AT,
  };

  // Related merchants in same sector
  const related = MERCHANTS.filter(
    (m) => m.slug !== merchant.slug && m.sector === merchant.sector
  ).slice(0, 4);

  // Sibling problems for this merchant
  const siblings = merchant.problems
    .filter((p) => p !== problem.slug)
    .map((slug) => getProblem(slug))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const indexedSiblings = siblings.filter((p) =>
    isIndexableMerchantProblemPath(`/hilfe/${merchant.slug}/${p.slug}`)
  );
  const contextualGuideLinks = merchantProblemGuideLinks(
    merchant.slug,
    problem.slug,
    canonicalPath
  );

  return (
    <MainLayout>
      <SeoHead
        title={`${copy.title} | ChargebackPilot`}
        description={copy.metaDescription}
        canonical={canonicalPath}
        noindex={!isIndexable}
        jsonLd={[howToSchema, articleSchema]}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <article className="pb-20">
        {/* Header */}
        <header className="bg-gradient-to-b from-blue-50 to-background py-12 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${trust.color}`}
              >
                {trust.label}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {merchant.country}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {merchant.name}: {copy.displayLabel}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              {merchant.description} Hier liest du, wie du bei <strong>{copy.searchPhrase}</strong>{" "}
              strukturiert vorgehst — mit Fristen, Beweisen und fertigen Textvorlagen.
            </p>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
                <PenLine className="h-4 w-4 text-primary" />
                ChargebackPilot Redaktion
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
                <CalendarCheck className="h-4 w-4 text-primary" />
                Aktualisiert: {DISPLAY_UPDATED_AT}
              </span>
              <span className="inline-flex items-center rounded-md border bg-background px-3 py-1.5">
                Indikative Orientierung, keine Rechtsberatung
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={wizardHref}>
                <Button size="lg" className="gap-2">
                  Kostenlosen Fall-Check starten
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href={`/hilfe/${merchant.slug}`}>
                <Button size="lg" variant="outline" className="gap-2">
                  Alle {merchant.name}-Probleme
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-8 text-center">
              <div className="bg-background border rounded-lg p-3">
                <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
                <div className="text-xs text-muted-foreground">Analyse</div>
                <div className="font-semibold text-sm">ca. 1 Min.</div>
              </div>
              <div className="bg-background border rounded-lg p-3">
                <FileText className="w-4 h-4 mx-auto text-primary mb-1" />
                <div className="text-xs text-muted-foreground">Vorlagen</div>
                <div className="font-semibold text-sm">3 fertig</div>
              </div>
              <div className="bg-background border rounded-lg p-3">
                <ShieldCheck className="w-4 h-4 mx-auto text-primary mb-1" />
                <div className="text-xs text-muted-foreground">Preis</div>
                <div className="font-semibold text-sm">0,99 € Endpreis</div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto max-w-3xl px-4 mt-12 space-y-14">
          {/* Intro long-form */}
          <section className="prose prose-neutral max-w-none">
            {copy.intro.map((para, i) => (
              <p key={i} className="text-foreground/90 leading-relaxed mb-4 text-[15px]">
                {para}
              </p>
            ))}
          </section>

          {/* Beleglage */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">
              Wann ist die Beleglage oft besser?
            </h2>
            <ul className="space-y-3">
              {copy.whenApplies.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Beweise */}
          <section className="bg-primary/5 p-6 md:p-8 rounded-2xl border border-primary/10">
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Was du sammeln solltest
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {copy.evidence.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-background p-3 rounded-lg border"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-5">
              Was bei {merchant.name} besonders wichtig ist
            </h2>
            <ul className="space-y-3">
              {copy.merchantFocus.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed text-foreground/85">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">
              In 5 Schritten zum strukturierten Vorgehen
            </h2>
            <ol className="space-y-5">
              {copy.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-foreground/90 pt-1.5 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Deadlines */}
          <section>
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2 border-b pb-2">
              <Clock className="w-6 h-6 text-primary" /> Fristen im Überblick 2026
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Je nach Zahlungsart hast du unterschiedlich lange Zeit. Diese Tabelle zeigt, welche
              Frist bei {merchant.name}-Fällen für dich relevant sein kann — prüfe möglichst früh,
              welche Frist für deine Zahlungsart und deinen Fall tatsächlich gilt.
            </p>
            <div className="space-y-3">
              {copy.deadlines.map((d, i) => (
                <div key={i} className="bg-card border rounded-xl p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-center text-sm font-bold text-blue-800 dark:bg-primary/20 dark:text-blue-100 min-w-[110px]">
                    {d.value}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-0.5">{d.label}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{d.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-emerald-50/50 p-6 md:p-8 border-emerald-100">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              {copy.paymentNextStep.title}
            </h2>
            <p className="text-sm leading-relaxed text-foreground/85">
              {copy.paymentNextStep.text}
            </p>
          </section>

          {/* Dispute / Reason-Code */}
          <section className="bg-blue-50/50 p-6 md:p-8 rounded-2xl border border-blue-100">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              Mögliche Streitkategorie
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                {copy.disputeCategory.method}
              </span>
              <span className="text-xs font-mono px-2 py-1 rounded bg-white border border-blue-200 text-blue-900">
                {copy.disputeCategory.code}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              {copy.disputeCategory.explainer}
            </p>
          </section>

          {/* Consumer/procedure notes */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">
              Verbraucher- und Verfahrenshinweise (keine Rechtsberatung)
            </h2>
            <div className="space-y-5">
              {copy.legalBasis.map((lb, i) => (
                <div key={i} className="border-l-4 border-primary/40 pl-4 py-1">
                  <h3 className="font-semibold text-base mb-1.5">{lb.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{lb.text}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-5 italic">
              Hinweis: Die genannten Paragraphen und Verordnungen sind allgemeine Information, keine
              Rechtsberatung und keine Prüfung deines Einzelfalls. Konkrete rechtliche Fragen
              besprich bitte mit der Verbraucherzentrale oder anwaltlicher Beratung.
            </p>
          </section>

          {/* Mistakes */}
          <section>
            <h2 className="text-2xl font-bold mb-5 text-red-700 flex items-center gap-2 border-b pb-2 border-red-100">
              <AlertTriangle className="w-6 h-6" /> Häufige Fehler
            </h2>
            <ul className="space-y-3">
              {copy.mistakes.map((m, i) => (
                <li
                  key={i}
                  className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-900 text-sm"
                >
                  {m}
                </li>
              ))}
            </ul>
          </section>

          {/* Mid CTA */}
          <section className="bg-primary text-primary-foreground p-6 md:p-8 rounded-2xl text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Lass die KI deinen {merchant.name}-Fall einordnen
            </h2>
            <p className="text-primary-foreground/95 mb-5 text-sm md:text-base">
              Kostenlose, indikative Einschätzung — Vorlagen für 0,99 € Endpreis freischalten.
            </p>
            <Link href={wizardHref}>
              <Button size="lg" variant="secondary" className="gap-2">
                Kostenlosen Fall-Check starten
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </section>

          <section className="rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-3">Wie diese Orientierung entsteht</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Wir kombinieren Anbieterprofil, Problemtyp, Zahlungsart, typische Belegarten und
              allgemeine Verfahrenshinweise zu einer strukturierten Einordnung. Entscheidungen
              treffen {merchant.name}, Banken, PayPal, Klarna oder Kartennetzwerke im Einzelfall;
              ChargebackPilot liefert dafür unverbindliche Formulierungs- und Sortierhilfe.
            </p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">Häufig gestellte Fragen</h2>
            <div className="grid gap-4">
              {copy.faq.map((f, i) => (
                <div key={i} className="rounded-xl border bg-background p-5 shadow-sm">
                  <h3 className="mb-2 text-base font-bold leading-snug">{f.q}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {contextualGuideLinks.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-5">Passend dazu</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {contextualGuideLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Card className="h-full cursor-pointer transition-colors hover:border-primary">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="font-semibold text-sm">{link.label}</span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {link.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Sibling problems */}
          {indexedSiblings.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-5">Weitere {merchant.name}-Themen</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {indexedSiblings.map((p) => (
                  <Link key={p.slug} href={`/hilfe/${merchant.slug}/${p.slug}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <span className="font-medium text-sm">
                          {merchant.name}: {getProblemDisplayLabel(merchant, p)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related merchants */}
          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-5">Ähnliche Anbieter</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {related.map((m) => (
                  <Link key={m.slug} href={`/hilfe/${m.slug}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <span className="font-medium text-sm">{m.name}</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Disclaimer */}
          <section className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border/50">
            <p>
              <strong>Markenrechtlicher Hinweis:</strong> {merchant.name} ist eine Markenbezeichnung
              des jeweiligen Rechteinhabers. ChargebackPilot steht in keiner Verbindung,
              Partnerschaft oder Kooperation mit {merchant.name}. Die Nennung dient ausschließlich
              der Beschreibung des Anwendungsbereichs unseres Text-Generators. Keine Rechtsberatung.
            </p>
          </section>
        </div>
      </article>
    </MainLayout>
  );
}
