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
import { ArrowRight, Check, X, Minus, Sparkles } from "lucide-react";
import { getRouteMeta } from "@/seo-routes";

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
  const routeMeta = getRouteMeta("/vergleich/paypal-vs-kreditkarte-vs-klarna");
  const title =
    routeMeta?.title ??
    "PayPal vs. Kreditkarte vs. Klarna — welcher Käuferschutz ist 2026 besser? | ChargebackPilot";
  const description =
    routeMeta?.description ??
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
    keywords:
      "paypal vs kreditkarte vs klarna, käuferschutz vergleich, paypal käuferschutz kreditkarte chargeback klarna",
    about: [
      { "@type": "Thing", name: "PayPal Käuferschutz" },
      { "@type": "Thing", name: "Kreditkarten-Chargeback" },
      { "@type": "Thing", name: "Klarna Käuferschutz" },
    ],
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
          <section className="ai-summary-card rounded-2xl border border-blue-200/70 bg-slate-50 p-6 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
                <Sparkles className="ai-summary-sparkle h-3.5 w-3.5" />
                Kurzvergleich
              </span>
              <span className="text-xs text-muted-foreground">
                PayPal vs. Kreditkarte vs. Klarna auf den Punkt gebracht
              </span>
            </div>
            <p className="ai-summary-text text-base leading-relaxed text-foreground/90">
              Wenn Ware fehlt, eine Leistung nicht erbracht wurde oder eine Rechnung strittig ist,
              entscheidet zuerst dein Zahlungsweg. PayPal ist oft stark im Konfliktcenter,
              Kreditkarte bei Umsatzreklamation und nicht erbrachter Leistung, Klarna bei offenen
              Rechnungen, Retouren und Zahlungspause.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-white/80 p-4">
                <h2 className="mb-1 text-sm font-bold">PayPal</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Schnell starten, wenn die Transaktion käuferschutzfähig ist und Belege im Konto
                  hochgeladen werden können.
                </p>
              </div>
              <div className="rounded-xl border bg-white/80 p-4">
                <h2 className="mb-1 text-sm font-bold">Kreditkarte</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Sinnvoll, wenn Kartenumsatz, Nichterfüllung und Händlerkontakt sauber belegbar
                  sind.
                </p>
              </div>
              <div className="rounded-xl border bg-white/80 p-4">
                <h2 className="mb-1 text-sm font-bold">Klarna</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Besonders wichtig, wenn eine Rechnung offen ist und ein Problem früh gemeldet
                  werden sollte.
                </p>
              </div>
            </div>
          </section>

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
                <strong>Kreditkarte</strong> oder <strong>SEPA-Lastschrift</strong> können je nach
                Zahlungsweg relevant sein. Prüfe Rückgaberegeln und Fristen direkt bei deiner Bank;
                PayPal-Käuferschutz kann bei digitalen Gütern von den jeweiligen Richtlinien
                abhängen.
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
              Unsicher, welcher Weg in deinem Fall sinnvoll sein kann?
            </h2>
            <p className="text-primary-foreground/95 mb-5 text-sm md:text-base">
              Unsere KI strukturiert deine Angaben indikativ und nennt mögliche Anlaufstellen, die
              du selbst prüfen kannst.
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
