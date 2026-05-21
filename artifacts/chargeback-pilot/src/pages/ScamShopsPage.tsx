import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, ShieldCheck, Search } from "lucide-react";
import { useState } from "react";

interface ScamSignal {
  title: string;
  description: string;
}

const RED_FLAGS: ScamSignal[] = [
  { title: "Unrealistisch niedrige Preise", description: "Marken-Sneaker für 19 €, AirPods für 25 € — wenn ein Angebot zu gut wirkt, ist es das meist." },
  { title: "Nur Vorkasse oder Krypto", description: "Seriöse Shops bieten PayPal, Klarna oder Kreditkarte. Wer ausschließlich Überweisung verlangt, schließt Käuferschutz aktiv aus." },
  { title: "Kein Impressum oder Fantasie-Anschrift", description: "Pflicht in Deutschland: vollständiger Firmenname, Anschrift, Handelsregisternummer, USt-ID. Fehlt das, fehlt der Vertragspartner." },
  { title: "Brandneue Domain ohne Reviews", description: "Eine WHOIS-Abfrage zeigt, wie alt die Domain wirklich ist. Unter 6 Monate + keine Trustpilot/Google-Bewertungen = hohes Risiko." },
  { title: "Schlechtes Deutsch & Auto-Übersetzungen", description: "Wörtlich übersetzte Produktbeschreibungen sind ein klassisches Indiz für Dropshipping aus Drittländern." },
  { title: "Kein Widerrufsrecht oder unklare AGB", description: "In Deutschland gilt 14 Tage Widerruf gesetzlich. Wer das ausschließt oder verschleiert, agiert illegal." },
  { title: "Drohende Mahnungen statt sauberer Rechnung", description: "Inkasso-Anschreiben für Bestellungen, die du nie getätigt hast — klassisches Abo-Falle/Inkasso-Scam-Muster." },
  { title: "Social-Ads mit Promi-Fakes", description: "Künstlich erzeugte Influencer- oder Promi-Testimonials in TikTok-/Instagram-Ads sind ein wachsendes Scam-Muster 2026." },
];

const SCAM_CATEGORIES = [
  {
    name: "Fake-Marken-Shops",
    examples: "Sneaker, Designer-Mode, Sonnenbrillen",
    action: "Sofort Kreditkarten-Chargeback einleiten — Reason: \"Counterfeit / Not as described\".",
  },
  {
    name: "Influencer-Dropshipping",
    examples: "Beauty-Tools, Fitness-Gadgets, AI-Devices",
    action: "PayPal-Käuferschutz binnen 180 Tagen — \"Ware erheblich nicht wie beschrieben\".",
  },
  {
    name: "Abo-Fallen über Bauernfänger-Anzeigen",
    examples: "Gewinnspiele, kostenlose Proben, Promi-Diäten",
    action: "SEPA-Lastschrift binnen 8 Wochen pauschal rückrufen + sofort kündigen.",
  },
  {
    name: "Fake-Inkasso & Phishing",
    examples: "Vermeintliche Mahnungen, Paket-SMS",
    action: "Niemals klicken / nichts zahlen — Verbraucherzentrale + ggf. Polizei (Cybercrime).",
  },
];

export default function ScamShopsPage() {
  const [query, setQuery] = useState("");

  const title = "Bekannte Scam-Muster & Fake-Shops 2026 — wie du dein Geld zurückholst | ChargebackPilot";
  const description = "Verdacht auf Fake-Shop oder Internet-Betrug? Die wichtigsten Warnsignale 2026 plus die genaue Anleitung, wie du dein Geld via Chargeback, PayPal-Käuferschutz oder Lastschriftrückruf zurückholst.";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Bekannte Scam-Muster & Fake-Shops 2026",
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
    mainEntityOfPage: "https://chargebackpilot.de/scam-shops-2026",
  };

  return (
    <MainLayout>
      <SeoHead title={title} description={description} canonical="/scam-shops-2026" jsonLd={[articleSchema]} />
      <Breadcrumbs items={[{ label: "Ratgeber", href: "/ratgeber" }, { label: "Scam-Shops 2026" }]} />

      <article className="pb-20">
        <header className="bg-gradient-to-b from-red-50 to-background py-12 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Betrugsschutz 2026
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Fake-Shop erkannt? So holst du dein Geld zurück.
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Die 8 wichtigsten Warnsignale 2026 plus die exakte Schritt-für-Schritt-Anleitung
              für PayPal-Käuferschutz, Kreditkarten-Chargeback und SEPA-Lastschriftrückgabe.
            </p>
            <Link href="/vorlagen-generator?problem=fraud">
              <Button size="lg" className="gap-2">
                Verdachtsfall jetzt prüfen
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto max-w-3xl px-4 mt-10 space-y-14">
          {/* Red flags */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">Die 8 Warnsignale 2026</h2>
            <div className="grid gap-3">
              {RED_FLAGS.map((f, i) => (
                <div key={i} className="bg-card border rounded-lg p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5">{f.title}</div>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">4 Scam-Kategorien — und der jeweils schnellste Weg zum Geld</h2>
            <div className="grid gap-4">
              {SCAM_CATEGORIES.map((c, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="font-bold text-base mb-1">{c.name}</div>
                    <div className="text-xs text-muted-foreground mb-3">Typisch: {c.examples}</div>
                    <div className="flex items-start gap-2 text-sm bg-emerald-50 border border-emerald-200 text-emerald-900 rounded p-3">
                      <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-700" />
                      <span>{c.action}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Quick lookup */}
          <section className="bg-muted p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Shop-Check in 30 Sekunden
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Gib hier den Shop-Namen oder die URL ein. Wir verlinken dir die passende Quick-Anleitung.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="z. B. wundermode24.shop"
                className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
                aria-label="Shop-Name oder URL"
              />
              <Link href={`/vorlagen-generator?problem=fraud${query ? `&merchant=${encodeURIComponent(query)}` : ""}`}>
                <Button>Fall starten</Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Wichtig:</strong> Wir prüfen den Shop nicht öffentlich — die Verdachtsmeldung bleibt anonym
              in deiner Wizard-Eingabe.
            </p>
          </section>

          {/* CTA */}
          <section className="bg-primary text-primary-foreground p-6 md:p-8 rounded-2xl text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Schon abgebucht? Jetzt zählt jeder Tag.</h2>
            <p className="opacity-90 mb-5 text-sm md:text-base">
              SEPA: 8 Wochen Frist · Kreditkarte: 60–120 Tage · PayPal: 180 Tage. Wir generieren deinen Antrag in 60 Sek.
            </p>
            <Link href="/vorlagen-generator?problem=fraud">
              <Button size="lg" variant="secondary" className="gap-2">
                Geld zurückholen
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </section>
        </div>
      </article>
    </MainLayout>
  );
}
