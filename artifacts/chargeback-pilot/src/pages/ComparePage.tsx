import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Minus } from "lucide-react";

const ROWS: { label: string; paypal: string | true | false; karte: string | true | false; klarna: string | true | false }[] = [
  { label: "Frist ab Zahlung", paypal: "180 Tage", karte: "60–120 Tage", klarna: "Bis Zahlungsziel" },
  { label: "Reaktionszeit Erstattung", paypal: "10–20 Tage", karte: "30–90 Tage", klarna: "1–10 Tage" },
  { label: "Käuferschutz: Ware nicht erhalten", paypal: true, karte: true, klarna: true },
  { label: "Käuferschutz: Anders als beschrieben", paypal: true, karte: true, klarna: true },
  { label: "Digitale Güter / Software", paypal: false, karte: true, klarna: false },
  { label: "Dienstleistungen vor Ort", paypal: false, karte: true, klarna: false },
  { label: "Ware nicht zurückgesendet nötig", paypal: false, karte: true, klarna: false },
  { label: "Bei Insolvenz des Händlers", paypal: true, karte: true, klarna: "Begrenzt" },
  { label: "Antragsaufwand", paypal: "Niedrig", karte: "Mittel", klarna: "Niedrig" },
  { label: "Mahnung blockierbar", paypal: "n/a", karte: "n/a", klarna: true },
];

function Cell({ v }: { v: string | true | false }) {
  if (v === true) return <Check className="w-5 h-5 text-emerald-600 mx-auto" />;
  if (v === false) return <X className="w-5 h-5 text-red-500 mx-auto" />;
  if (v === "n/a") return <Minus className="w-5 h-5 text-muted-foreground mx-auto" />;
  return <span className="text-sm font-medium">{v}</span>;
}

export default function ComparePage() {
  const title = "PayPal vs. Kreditkarte vs. Klarna — welcher Käuferschutz ist 2026 besser? | ChargebackPilot";
  const description = "Vergleich 2026: PayPal-Käuferschutz, Kreditkarten-Chargeback und Klarna-Käuferschutz im direkten Duell. Fristen, Reaktionszeiten, Vor- und Nachteile — plus klare Empfehlung pro Anwendungsfall.";

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

  return (
    <MainLayout>
      <SeoHead title={title} description={description} canonical="/vergleich/paypal-vs-kreditkarte-vs-klarna" jsonLd={[articleSchema]} />
      <Breadcrumbs items={[{ label: "Ratgeber", href: "/ratgeber" }, { label: "Vergleich Käuferschutz" }]} />

      <article className="pb-20">
        <header className="bg-gradient-to-b from-blue-50 to-background py-12 px-4 border-b">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              PayPal vs. Kreditkarte vs. Klarna 2026
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Welcher Käuferschutz ist im Streitfall oft passend? Direktvergleich mit Fristen, typischen Abläufen und unserer Einordnung pro Use-Case.
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
                      <td className="p-3 text-center"><Cell v={row.paypal} /></td>
                      <td className="p-3 text-center"><Cell v={row.karte} /></td>
                      <td className="p-3 text-center"><Cell v={row.klarna} /></td>
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
                Wenn möglich mit <strong>Kreditkarte</strong> zahlen — längere Frist und stärkere Rechte
                bei Insolvenz. <strong>PayPal</strong> ist die solide zweite Wahl.
              </p>
            </div>
            <div className="bg-card border rounded-xl p-5">
              <div className="text-xs font-bold uppercase text-primary mb-2">Empfehlung</div>
              <div className="font-bold text-lg mb-2">Reise & Flug</div>
              <p className="text-sm text-muted-foreground mb-3">
                Eindeutig <strong>Kreditkarte</strong>. Lange Frist ab Reisedatum + Standard-Reason-Code
                Service-not-rendered-Reason bei abgesagten Leistungen.
              </p>
            </div>
            <div className="bg-card border rounded-xl p-5">
              <div className="text-xs font-bold uppercase text-primary mb-2">Empfehlung</div>
              <div className="font-bold text-lg mb-2">Digitale & Abo</div>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Kreditkarte</strong> oder <strong>SEPA-Lastschrift</strong> (8-Wochen-Rückruf).
                PayPal-Käuferschutz greift bei digitalen Gütern oft nicht.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-primary text-primary-foreground p-6 md:p-8 rounded-2xl text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Unsicher, welcher Weg in deinem Fall der richtige ist?</h2>
            <p className="text-primary-foreground/95 mb-5 text-sm md:text-base">
              Unsere KI bewertet deinen Fall indikativ und zeigt dir einen passenden nächsten Kanal auf.
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
