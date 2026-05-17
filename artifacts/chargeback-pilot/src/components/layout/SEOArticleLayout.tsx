import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SEOProps {
  title: string;
  category: string;
  whenApplies: string[];
  evidence: string[];
  steps: string[];
  mistakes: string[];
  faq: { q: string; a: string }[];
}

export function SEOArticleLayout({ title, category, whenApplies, evidence, steps, mistakes, faq }: SEOProps) {
  return (
    <MainLayout>
      <article className="pb-20">
        {/* Header */}
        <header className="bg-muted py-16 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{title}</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Erfahre alles, was du über {category} wissen musst – Fristen, Beweise und der genaue Ablauf.
            </p>
            <Link href="/fall-pruefen">
              <Button size="lg" className="gap-2">
                Fall für {category} kostenlos prüfen
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
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Schritt-für-Schritt Anleitung</h2>
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
            <p className="text-muted-foreground mb-6">Lass unsere KI deinen Fall analysieren und erhalte sofort eine erste Einschätzung und die passenden Textvorlagen.</p>
            <Link href="/fall-pruefen">
              <Button size="lg">Jetzt kostenlos analysieren</Button>
            </Link>
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
