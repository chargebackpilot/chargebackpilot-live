import { MainLayout } from "@/components/layout/MainLayout";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { openNewWizardCase } from "@/lib/case-persistence";

interface SEOProps {
  title: string;
  category: string;
  whenApplies: string[];
  evidence: string[];
  steps: string[];
  mistakes: string[];
  faq: { q: string; a: string }[];
}

const SITE = "https://chargebackpilot.de";

export function SEOArticleLayout({ title, category, whenApplies, evidence, steps, mistakes, faq }: SEOProps) {
  const [pathname] = useLocation();
  const description = `${title}: typische Fristenhinweise, Belege und strukturierte Orientierung bei ${category}. Mit unverbindlichen Textentwürfen.`;
  const canonicalPath = pathname || "/ratgeber";

  const handleNewCaseClick = () => {
    openNewWizardCase();
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    totalTime: "PT15M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "EUR", value: "0.99" },
    supply: evidence.map((e) => ({ "@type": "HowToSupply", name: e })),
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Schritt ${i + 1}`,
      text: s,
    })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "de-DE",
    author: { "@type": "Organization", name: "ChargebackPilot" },
    publisher: {
      "@type": "Organization",
      name: "ChargebackPilot",
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` },
    },
    mainEntityOfPage: `${SITE}${canonicalPath}`,
    datePublished: "2026-01-15",
    dateModified: "2026-05-20",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Ratgeber", item: `${SITE}/ratgeber` },
      { "@type": "ListItem", position: 3, name: category, item: `${SITE}${canonicalPath}` },
    ],
  };

  const relatedGuides = [
    { href: "/paypal-chargeback", label: "PayPal Käuferschutz" },
    { href: "/visa-mastercard-chargeback", label: "Visa & Mastercard" },
    { href: "/klarna-reklamation", label: "Klarna Reklamation" },
    { href: "/vergleich/paypal-vs-kreditkarte-vs-klarna", label: "Vergleich Käuferschutz" },
  ].filter((g) => g.href !== canonicalPath).slice(0, 3);

  return (
    <MainLayout>
      <SeoHead
        title={`${title} | ChargebackPilot`}
        description={description}
        canonical={canonicalPath}
        jsonLd={[howToSchema, faqSchema, articleSchema, breadcrumbSchema]}
      />
      <Breadcrumbs items={[{ label: "Ratgeber", href: "/ratgeber" }, { label: category }]} />
      <article className="pb-20">
        {/* Header */}
        <header className="bg-muted py-16 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{title}</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Erhalte eine strukturierte Orientierung zu {category}: typische Fristenhinweise, Belege und mögliche nächste Schritte.
            </p>
            <Link href="/vorlagen-generator?new=1" onClick={(e) => { e.preventDefault(); handleNewCaseClick(); }}>
              <Button size="lg" className="gap-2">
                Vorlagen für {category} generieren
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto max-w-3xl px-4 mt-12 space-y-16">
          
          {/* Wann greift es */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Wann greift der Schutz?</h2>
            <ul className="space-y-3">
              {whenApplies.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Beweise */}
          <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Beweis-Checkliste
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {evidence.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-background p-3 rounded-lg border shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Ablauf */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Schritt-für-Schritt Orientierung</h2>
            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="pt-1">
                    <p className="text-foreground/90">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Fehler */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-red-600 flex items-center gap-2 border-b pb-2 border-red-100">
              <AlertTriangle className="w-6 h-6" />
              Häufige Fehler vermeiden
            </h2>
            <ul className="space-y-4">
              {mistakes.map((mistake, i) => (
                <li key={i} className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-900 text-sm">
                  {mistake}
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Häufig gestellte Fragen (FAQ)</h2>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Bottom CTA */}
          <section className="bg-muted p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Unsicher bei deinem Fall?</h2>
            <p className="text-muted-foreground mb-6">Nutze unseren Generator und erhalte unverbindliche Textentwürfe zur eigenen Prüfung.</p>
            <Link href="/vorlagen-generator?new=1" onClick={(e) => { e.preventDefault(); handleNewCaseClick(); }}>
              <Button size="lg">Vorlagen generieren</Button>
            </Link>
          </section>

          <section className="border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-3">Nächster sinnvoller Schritt</h2>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {relatedGuides.map((g) => (
                <Link key={g.href} href={g.href}>
                  <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                    {g.label}
                  </Button>
                </Link>
              ))}
            </div>
          </section>

          {/* Trademark Disclaimer */}
          <section className="mt-16 text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border/50 text-center">
            <p>
              <strong>Markenrechtlicher Hinweis:</strong> Genannte Markenbezeichnungen (wie z.B. PayPal, Klarna, Visa, Mastercard, American Express, Ryanair, Lieferando etc.) sind eingetragene Warenzeichen der jeweiligen Eigentümer. ChargebackPilot steht in keinerlei Verbindung, Partnerschaft oder Kooperation mit diesen Unternehmen. Die Nennung dient ausschließlich der Beschreibung des Anwendungsbereichs unseres Text-Generators.
            </p>
          </section>

        </div>
      </article>
    </MainLayout>
  );
}
