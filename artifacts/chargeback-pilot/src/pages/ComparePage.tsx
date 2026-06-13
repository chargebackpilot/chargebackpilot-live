import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Check, X, Minus } from "lucide-react";

const ROWS: {
  label: string;
  paypal: string | true | false;
  karte: string | true | false;
  klarna: string | true | false;
}[] = [
  {
    label: "Frist ab Zahlung",
    paypal: "180 Tage",
    karte: "60–120 Tage",
    klarna: "Bis Zahlungsziel",
  },
  {
    label: "Reaktionszeit Erstattung",
    paypal: "10–20 Tage",
    karte: "30–90 Tage",
    klarna: "1–10 Tage",
  },
  { label: "Käuferschutz: Ware nicht erhalten", paypal: true, karte: true, klarna: true },
  { label: "Käuferschutz: Anders als beschrieben", paypal: true, karte: true, klarna: true },
  { label: "Digitale Güter / Software", paypal: false, karte: true, klarna: false },
  { label: "Dienstleistungen vor Ort", paypal: false, karte: true, klarna: false },
  { label: "Ware nicht zurückgesendet nötig", paypal: false, karte: true, klarna: false },
  { label: "Bei Insolvenz des Händlers", paypal: true, karte: true, klarna: "Begrenzt" },
  { label: "Antragsaufwand", paypal: "Niedrig", karte: "Mittel", klarna: "Niedrig" },
  { label: "Mahnung blockierbar", paypal: "n/a", karte: "n/a", klarna: true },
];

const FAQS = [
  {
    q: "Ist PayPal, Kreditkarte oder Klarna grundsätzlich am besten?",
    a: "Es gibt keinen pauschal besten Weg. PayPal ist oft nutzerfreundlich im Konfliktcenter, Kreditkarten können bei nicht erbrachter Leistung oder Insolvenz stark sein, Klarna ist praktisch, wenn eine offene Rechnung früh pausiert oder geklärt werden soll. Entscheidend sind Zahlungsart, Frist, Belege und Anbieterregeln.",
  },
  {
    q: "Sollte ich mehrere Käuferschutzwege gleichzeitig starten?",
    a: "Vorsicht mit parallelen Verfahren. Du solltest vermeiden, denselben Betrag doppelt geltend zu machen oder widersprüchliche Angaben zu senden. Besser ist eine klare Reihenfolge: Zahlungsweg prüfen, zuständigen Anbieter auswählen, Erstattungen oder Teilgutschriften transparent angeben.",
  },
  {
    q: "Wann ist die Kreditkarte stärker als PayPal?",
    a: "Eine Kreditkartenreklamation kann besonders relevant sein, wenn Ware oder Leistung nicht erbracht wurde, ein Anbieter insolvent ist oder PayPal nicht der eigentliche Zahlungsweg war. Die Bank entscheidet aber nach Kartenregeln und verlangt meist eine saubere Beleglage.",
  },
  {
    q: "Wann ist Klarna besonders sinnvoll?",
    a: "Klarna ist vor allem dann wichtig, wenn eine Rechnung noch offen ist, eine Retoure nicht verbucht wurde oder eine Forderung pausiert werden soll. Problem und Belege sollten früh im Klarna-Konto gemeldet werden, statt Mahnungen einfach abzuwarten.",
  },
  {
    q: "Welche Fristen sind im Vergleich besonders kritisch?",
    a: "PayPal nennt häufig 180 Tage ab Zahlung, bei Kreditkarten werden oft kürzere Fristen genannt, und bei Klarna zählt häufig die frühe Problemmeldung vor dem Zahlungsziel. Maßgeblich sind immer die aktuell angezeigten Regeln im jeweiligen Konto oder bei deiner Bank.",
  },
  {
    q: "Was ist der wichtigste Unterschied bei den Belegen?",
    a: "PayPal braucht oft Transaktion, Händlerkontakt und Artikel-/Trackingbelege. Banken achten auf Kartenumsatz, Nichterfüllung und Kommunikationsnachweise. Klarna braucht Rechnungsdaten, Retouren- oder Lieferbelege und den Stand der Händlerklärung.",
  },
];

function Cell({ v }: { v: string | true | false }) {
  if (v === true) return <Check className="w-5 h-5 text-emerald-600 mx-auto" />;
  if (v === false) return <X className="w-5 h-5 text-red-500 mx-auto" />;
  if (v === "n/a") return <Minus className="w-5 h-5 text-muted-foreground mx-auto" />;
  return <span className="text-sm font-medium">{v}</span>;
}

export default function ComparePage() {
  const title =
    "PayPal vs. Kreditkarte vs. Klarna — welcher Käuferschutz ist 2026 besser? | ChargebackPilot";
  const description =
    "Vergleich 2026: PayPal-Käuferschutz, Kreditkarten-Reklamation und Klarna-Käuferschutz im Überblick. Typische Fristen, Abläufe und Vor- und Nachteile — als unverbindliche Orientierung.";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "PayPal vs. Kreditkarte vs. Klarna: Welcher Käuferschutz ist 2026 besser?",
    description,
    inLanguage: "de-DE",
    author: { "@type": "Organization", name: "ChargebackPilot" },
    publisher: {
      "@type": "Organization",
      name: "ChargebackPilot",
      logo: { "@type": "ImageObject", url: "https://chargebackpilot.de/favicon.svg" },
    },
    datePublished: "2026-01-15",
    dateModified: "2026-05-20",
    mainEntityOfPage: "https://chargebackpilot.de/vergleich/paypal-vs-kreditkarte-vs-klarna",
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <MainLayout>
      <SeoHead
        title={title}
        description={description}
        canonical="/vergleich/paypal-vs-kreditkarte-vs-klarna"
        jsonLd={[articleSchema, faqSchema]}
      />
      <Breadcrumbs
        items={[{ label: "Ratgeber", href: "/ratgeber" }, { label: "Vergleich Käuferschutz" }]}
      />

      <article className="pb-20">
        <header className="bg-gradient-to-b from-blue-50 to-background py-12 px-4 border-b">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              PayPal vs. Kreditkarte vs. Klarna 2026
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Welcher Käuferschutz ist im Streitfall oft passend? Direktvergleich mit Fristen,
              typischen Abläufen und unserer Einordnung pro Use-Case.
            </p>
            <Link href="/vorlagen-generator">
              <Button size="lg" className="gap-2">
                Fall strukturiert analysieren <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto max-w-4xl px-4 mt-10 space-y-12">
          {/* Comparison table */}
          <section>
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left p-3 font-semibold">Kriterium</th>
                    <th className="p-3 font-bold text-primary text-center">PayPal</th>
                    <th className="p-3 font-bold text-primary text-center">Kreditkarte</th>
                    <th className="p-3 font-bold text-primary text-center">Klarna</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 font-medium">{row.label}</td>
                      <td className="p-3 text-center">
                        <Cell v={row.paypal} />
                      </td>
                      <td className="p-3 text-center">
                        <Cell v={row.karte} />
                      </td>
                      <td className="p-3 text-center">
                        <Cell v={row.klarna} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recommendations */}
          <section className="grid md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-xl p-5">
              <div className="text-xs font-bold uppercase text-primary mb-2">Empfehlung</div>
              <div className="font-bold text-lg mb-2">Physische Ware</div>
              <p className="text-sm text-muted-foreground mb-3">
                Häufig ist eine <strong>Kreditkarte</strong> gut dokumentierbar;{" "}
                <strong>PayPal</strong> kann je nach Anbieterregeln ebenfalls passend sein.
              </p>
            </div>
            <div className="bg-card border rounded-xl p-5">
              <div className="text-xs font-bold uppercase text-primary mb-2">Empfehlung</div>
              <div className="font-bold text-lg mb-2">Reise & Flug</div>
              <p className="text-sm text-muted-foreground mb-3">
                Oft lohnt sich die Prüfung über die <strong>Kreditkarte</strong>, insbesondere wenn
                eine Leistung nicht erbracht wurde. Die konkrete Kategorie hängt vom Einzelfall ab.
              </p>
            </div>
            <div className="bg-card border rounded-xl p-5">
              <div className="text-xs font-bold uppercase text-primary mb-2">Empfehlung</div>
              <div className="font-bold text-lg mb-2">Digitale & Abo</div>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Kreditkarte</strong> oder <strong>SEPA-Lastschrift</strong>{" "}
                (8-Wochen-Rückruf). PayPal-Käuferschutz kann bei digitalen Gütern von den jeweiligen
                Richtlinien abhängen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">
              Wie du den richtigen Weg auswählst
            </h2>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Der beste Käuferschutz ist nicht der Anbieter mit der lautesten Werbung, sondern der
                Weg, der zu deiner Zahlung passt. Prüfe zuerst, wer die Zahlung tatsächlich
                abgewickelt hat: PayPal-Konto, Kreditkarte, Klarna-Rechnung oder eine hinterlegte
                Karte bei Apple Pay oder Google Pay.
              </p>
              <p>
                Danach zählt die Beleglage. Bei nicht gelieferter Ware sind Tracking, Händlerkontakt
                und Bestellbestätigung zentral. Bei Flügen oder Dienstleistungen sind
                Stornierungsnachricht, Leistungsbeschreibung und Erstattungszusage wichtiger. Bei
                Klarna-Retouren ist der Einlieferungsbeleg oft der Kern des Falls.
              </p>
              <p>
                Nutze den Vergleich deshalb als Startpunkt, nicht als Garantie. Die endgültige
                Entscheidung treffen PayPal, Klarna, Bank oder Kartenausgeber anhand der jeweils
                geltenden Regeln und deiner Nachweise.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">Häufige Fragen zum Vergleich</h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, index) => (
                <AccordionItem key={faq.q} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <section className="bg-primary text-primary-foreground p-6 md:p-8 rounded-2xl text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Unsicher, welcher Weg in deinem Fall der richtige ist?
            </h2>
            <p className="text-primary-foreground/95 mb-5 text-sm md:text-base">
              Unsere KI bewertet deinen Fall indikativ und zeigt dir einen passenden nächsten Kanal
              auf.
            </p>
            <Link href="/vorlagen-generator">
              <Button size="lg" variant="secondary" className="gap-2">
                Jetzt unverbindlich einordnen
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </section>
        </div>
      </article>
    </MainLayout>
  );
}
