import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Clock, FileText, ExternalLink,
} from "lucide-react";
import NotFound from "./not-found";
import {
  getMerchant,
  getProblem,
  generateMerchantProblemCopy,
  MERCHANTS,
} from "@/data/merchants";

const SITE = "https://chargebackpilot.de";

const TRUST_LABEL: Record<string, { label: string; color: string }> = {
  trusted: { label: "Etablierter Anbieter", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  mixed: { label: "Gemischte Erfahrungen", color: "bg-amber-100 text-amber-800 border-amber-300" },
  risky: { label: "Häufige Beschwerden", color: "bg-orange-100 text-orange-800 border-orange-300" },
  scam_reported: { label: "Betrugsverdacht gemeldet", color: "bg-red-100 text-red-800 border-red-300" },
};

export default function MerchantProblemPage() {
  const [, params] = useRoute<{ merchantSlug: string; problemSlug: string }>(
    "/hilfe/:merchantSlug/:problemSlug",
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
  const wizardPayment = preferredPayment ? wizardPaymentParam[preferredPayment] ?? "" : "";
  const wizardParams = new URLSearchParams({
    problem: problem.wizardProblemId,
    merchant: merchant.name,
    ...(wizardPayment ? { payment: wizardPayment } : {}),
  });
  const wizardHref = `/vorlagen-generator?${wizardParams.toString()}`;

  const breadcrumbItems = [
    { label: "Ratgeber", href: "/ratgeber" },
    { label: merchant.name, href: `/hilfe/${merchant.slug}` },
    { label: problem.label },
  ];

  const canonicalPath = `/hilfe/${merchant.slug}/${problem.slug}`;
  const fullUrl = `${SITE}${canonicalPath}`;

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${merchant.name} ${problem.label}: Geld zurückholen`,
    description: copy.metaDescription,
    totalTime: "PT15M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "EUR", value: "0.99" },
    supply: copy.evidence.map((e) => ({ "@type": "HowToSupply", name: e })),
    step: copy.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Schritt ${i + 1}`,
      text: s,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
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
    dateModified: "2026-05-20",
  };

  // Related merchants in same sector
  const related = MERCHANTS.filter(
    (m) => m.slug !== merchant.slug && m.sector === merchant.sector,
  ).slice(0, 4);

  // Sibling problems for this merchant
  const siblings = merchant.problems
    .filter((p) => p !== problem.slug)
    .map((slug) => getProblem(slug))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <MainLayout>
      <SeoHead
        title={`${copy.title} | ChargebackPilot`}
        description={copy.metaDescription}
        canonical={canonicalPath}
        jsonLd={[howToSchema, faqSchema, articleSchema]}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <article className="pb-20">
        {/* Header */}
        <header className="bg-gradient-to-b from-blue-50 to-background py-12 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${trust.color}`}>
                {trust.label}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {merchant.country}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {merchant.name}: {problem.label}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              {merchant.description} Hier liest du, wie du bei <strong>{problem.searchPhrase}</strong> dein Geld zurückholst — mit Fristen, Beweisen und fertigen Textvorlagen.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={wizardHref}>
                <Button size="lg" className="gap-2">
                  Fall jetzt kostenlos analysieren
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
                <div className="font-semibold text-sm">60 Sek.</div>
              </div>
              <div className="bg-background border rounded-lg p-3">
                <FileText className="w-4 h-4 mx-auto text-primary mb-1" />
                <div className="text-xs text-muted-foreground">Vorlagen</div>
                <div className="font-semibold text-sm">3 fertig</div>
              </div>
              <div className="bg-background border rounded-lg p-3">
                <ShieldCheck className="w-4 h-4 mx-auto text-primary mb-1" />
                <div className="text-xs text-muted-foreground">Preis</div>
                <div className="font-semibold text-sm">0,99 € (inkl. MwSt.)</div>
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

          {/* Wann greift es */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">Wann hast du gute Karten?</h2>
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
                <div key={i} className="flex items-center gap-3 bg-background p-3 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">In 5 Schritten zum Geld zurück</h2>
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
              Je nach Zahlungsart hast du unterschiedlich lange Zeit. Diese Tabelle zeigt, welche Frist
              bei {merchant.name}-Fällen für dich relevant ist — handle immer auf die kürzeste Frist, sonst
              läuft dir die stärkste Option weg.
            </p>
            <div className="space-y-3">
              {copy.deadlines.map((d, i) => (
                <div key={i} className="bg-card border rounded-xl p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary/10 text-primary font-bold text-sm px-3 py-2 rounded-lg min-w-[110px] text-center">
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

          {/* Dispute / Reason-Code */}
          <section className="bg-blue-50/50 p-6 md:p-8 rounded-2xl border border-blue-100">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              Richtige Reason-Code-Kategorie
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                {copy.disputeCategory.method}
              </span>
              <span className="text-xs font-mono px-2 py-1 rounded bg-white border border-blue-200 text-blue-900">
                {copy.disputeCategory.code}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">{copy.disputeCategory.explainer}</p>
          </section>

          {/* Legal basis */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">Rechtliche Grundlagen (kein Rechtsrat)</h2>
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
              Rechtsberatung. Konkrete rechtliche Fragen besprich bitte mit der Verbraucherzentrale oder
              einem Fachanwalt für Verbraucherrecht.
            </p>
          </section>

          {/* Mistakes */}
          <section>
            <h2 className="text-2xl font-bold mb-5 text-red-700 flex items-center gap-2 border-b pb-2 border-red-100">
              <AlertTriangle className="w-6 h-6" /> Häufige Fehler
            </h2>
            <ul className="space-y-3">
              {copy.mistakes.map((m, i) => (
                <li key={i} className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-900 text-sm">
                  {m}
                </li>
              ))}
            </ul>
          </section>

          {/* Mid CTA */}
          <section className="bg-primary text-primary-foreground p-6 md:p-8 rounded-2xl text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Lass die KI deinen {merchant.name}-Fall prüfen</h2>
            <p className="opacity-90 mb-5 text-sm md:text-base">
              60 Sekunden, kostenlose Einschätzung — Vorlagen für 0,99 € (inkl. MwSt.) freischalten. 
            </p>
            <Link href={wizardHref}>
              <Button size="lg" variant="secondary" className="gap-2">
                Jetzt Fall analysieren
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">Häufig gestellte Fragen</h2>
            <Accordion type="single" collapsible className="w-full">
              {copy.faq.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Sibling problems */}
          {siblings.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-5">Weitere {merchant.name}-Themen</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {siblings.map((p) => (
                  <Link key={p.slug} href={`/hilfe/${merchant.slug}/${p.slug}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <span className="font-medium text-sm">{merchant.name}: {p.label}</span>
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
              <strong>Markenrechtlicher Hinweis:</strong> {merchant.name} ist ein eingetragenes Warenzeichen
              des jeweiligen Eigentümers. ChargebackPilot steht in keiner Verbindung, Partnerschaft oder
              Kooperation mit {merchant.name}. Die Nennung dient ausschließlich der Beschreibung des
              Anwendungsbereichs unseres Text-Generators. Keine Rechtsberatung.
            </p>
          </section>
        </div>
      </article>
    </MainLayout>
  );
}
