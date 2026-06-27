import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, ShieldCheck, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { getRouteMeta } from "@/seo-routes";

interface ShopWarningSignal {
  title: string;
  description: string;
}

const RED_FLAGS: ShopWarningSignal[] = [
  {
    title: "Unrealistisch niedrige Preise",
    description:
      "Marken-Sneaker für 19 €, AirPods für 25 € — wenn ein Angebot deutlich zu gut wirkt, kann das ein Warnsignal sein.",
  },
  {
    title: "Nur Vorkasse oder Krypto",
    description:
      "Viele seriöse Shops bieten mehrere Zahlungsarten wie PayPal, Klarna oder Kreditkarte. Ausschließliche Vorkasse kann ein Warnsignal sein.",
  },
  {
    title: "Kein Impressum oder unklare Anschrift",
    description:
      "Fehlen nachvollziehbare Anbieterangaben, kann das die Zuordnung des Vertragspartners und spätere Klärung erschweren.",
  },
  {
    title: "Brandneue Domain ohne Reviews",
    description:
      "Eine WHOIS-Abfrage kann zeigen, wie alt die Domain ist. Sehr junge Domain + kaum auffindbare Bewertungen kann ein zusätzliches Warnsignal sein.",
  },
  {
    title: "Schlechtes Deutsch & Auto-Übersetzungen",
    description:
      "Wörtlich übersetzte Produktbeschreibungen können ein Hinweis auf unklare Lieferwege oder Dropshipping-Strukturen sein.",
  },
  {
    title: "Kein Widerrufsrecht oder unklare AGB",
    description:
      "Unklare oder fehlende Verbraucherinformationen sind ein deutliches Warnsignal und können rechtlich problematisch sein.",
  },
  {
    title: "Drohende Mahnungen statt sauberer Rechnung",
    description:
      "Inkasso-Anschreiben für Bestellungen, die du nie getätigt hast — ein auffälliges Abo-Falle- oder Inkasso-Muster.",
  },
  {
    title: "Social-Ads mit Promi-Fakes",
    description:
      "Künstlich erzeugte Influencer- oder Promi-Testimonials in TikTok-/Instagram-Ads sind ein wachsendes Warnmuster 2026.",
  },
];

const SHOP_RISK_CATEGORIES = [
  {
    name: "Auffällige Marken-Shops",
    examples: "Sneaker, Designer-Mode, Sonnenbrillen",
    action:
      "Zahlungsdienstleister zeitnah kontaktieren und prüfen, ob eine Reklamation wegen Fälschung oder abweichender Ware in Betracht kommt.",
  },
  {
    name: "Influencer-Dropshipping",
    examples: "Beauty-Tools, Fitness-Gadgets, AI-Devices",
    action:
      "PayPal-Käuferschutz bzw. Kartenreklamation anhand deiner Belege prüfen; Fristen direkt beim Anbieter kontrollieren.",
  },
  {
    name: "Abo-Fallen über Bauernfänger-Anzeigen",
    examples: "Gewinnspiele, kostenlose Proben, Promi-Diäten",
    action:
      "Mögliche Lastschrift-Rückgabe bei der Bank prüfen und den Anbieter schriftlich kontaktieren bzw. kündigen.",
  },
  {
    name: "Unklare Inkasso-Mails & Phishing",
    examples: "Vermeintliche Mahnungen, Paket-SMS",
    action:
      "Links nicht ungeprüft anklicken, Forderung prüfen lassen und bei Verdacht Verbraucherzentrale oder Polizei kontaktieren.",
  },
];

const FAQS = [
  {
    q: "Was sollte ich als Erstes tun, wenn ich einen Fake-Shop vermute?",
    a: "Sichere sofort Belege: Bestellbestätigung, Zahlungsnachweis, Shop-URL, Screenshots der Produktseite, Impressum, E-Mails und Tracking. Klicke keine verdächtigen Links mehr an und prüfe danach den passenden Zahlungsweg: PayPal, Kreditkarte, Klarna, Lastschrift oder Banküberweisung.",
  },
  {
    q: "Kann ich bei Fake-Shop-Verdacht ein Chargeback prüfen lassen?",
    a: "Bei Kreditkartenzahlung kann eine Umsatzreklamation je nach Kartenregeln und Belegen in Betracht kommen, etwa bei nicht gelieferter oder deutlich abweichender Ware. Die Bank entscheidet im Einzelfall und kann Händlerkontakt oder weitere Nachweise verlangen.",
  },
  {
    q: "Hilft PayPal Käuferschutz bei Fake-Shops?",
    a: "PayPal kann bei nicht gelieferter oder erheblich abweichender Ware relevant sein, wenn die Zahlung käuferschutzfähig war. Entscheidend sind Transaktion, Fristen im PayPal-Konto, Artikelbeschreibung, Tracking und deine Kommunikation mit dem Händler.",
  },
  {
    q: "Was ist bei Überweisung an einen Fake-Shop möglich?",
    a: "Bei Überweisung ist eine Rückholung oft schwieriger als bei Kreditkarte oder PayPal. Kontaktiere deine Bank trotzdem sofort, frage nach Rückrufmöglichkeiten und sichere alle Daten. Bei konkretem Verdacht auf Missbrauch kann zusätzlich eine Anzeige sinnvoll sein.",
  },
  {
    q: "Sollte ich eine Anzeige erstatten?",
    a: "Bei konkretem Verdacht auf Missbrauch kann eine Anzeige sinnvoll sein, insbesondere wenn der Shop verschwunden ist, falsche Identitäten nutzt oder weitere Forderungen entstehen. Die Anzeigenbestätigung kann als Beleg gegenüber Bank oder Zahlungsdienstleister hilfreich sein.",
  },
  {
    q: "Woran erkenne ich Dropshipping statt Fake-Shop?",
    a: "Dropshipping ist nicht automatisch problematisch oder rechtswidrig. Warnsignale sind aber stark abweichende Ware, verschleierte Lieferzeiten, fehlendes Impressum, keine erreichbare Kundenadresse oder Produktbilder, die massenhaft auf anderen Seiten auftauchen. Entscheidend ist, was konkret versprochen und geliefert wurde.",
  },
  {
    q: "Was mache ich, wenn bereits Inkasso-Mails kommen?",
    a: "Nicht panisch zahlen. Prüfe, ob die Forderung zu einer echten Bestellung gehört, sichere alle Schreiben und widersprich unklaren Forderungen sachlich. Bei hohem Druck oder unklarer Rechtslage können Verbraucherzentrale oder anwaltliche Prüfung sinnvoll sein.",
  },
];

export default function ScamShopsPage() {
  const [query, setQuery] = useState("");

  const routeMeta = getRouteMeta("/scam-shops-2026");
  const title =
    routeMeta?.title ?? "Fake-Shop Geld zurück? Zahlungsweg bei Verdacht prüfen | ChargebackPilot";
  const description =
    routeMeta?.description ??
    "Fake-Shop-Verdacht? Belege sichern und Zahlungsweg prüfen: PayPal, Kreditkarte, Klarna, Lastschrift oder Bankkontakt sachlich vorbereiten.";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Fake-Shop-Verdacht: Geld zurück und Zahlungsweg prüfen",
    description,
    inLanguage: "de-DE",
    author: { "@type": "Organization", name: "ChargebackPilot" },
    publisher: {
      "@type": "Organization",
      name: "ChargebackPilot",
      logo: { "@type": "ImageObject", url: "https://chargebackpilot.de/favicon.svg" },
    },
    datePublished: "2026-01-15",
    dateModified: "2026-06-22",
    mainEntityOfPage: "https://chargebackpilot.de/scam-shops-2026",
    keywords:
      "fake shop erkennen, fake shop chargeback, paypal käuferschutz fake shop, auffälliger online shop",
    about: [
      { "@type": "Thing", name: "Fake-Shop" },
      { "@type": "Thing", name: "Auffälliger Online-Shop" },
      { "@type": "Thing", name: "Chargeback bei Fake-Shop" },
      { "@type": "Thing", name: "PayPal Käuferschutz" },
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
        canonical="/scam-shops-2026"
        jsonLd={[articleSchema, faqSchema]}
      />
      <Breadcrumbs
        items={[{ label: "Ratgeber", href: "/ratgeber" }, { label: "Shop-Warnsignale 2026" }]}
      />

      <article className="pb-20">
        <header className="bg-gradient-to-b from-red-50 to-background py-12 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Warnsignale 2026
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Fake-Shop-Verdacht? Geld zurück und Zahlungsweg prüfen.
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Die 8 wichtigsten Warnsignale 2026 plus strukturierte Orientierung, wie du Belege
              sicherst und PayPal-Käuferschutz, Kreditkarten-Chargeback, Klarna oder mögliche
              Lastschrift-Rückgabe prüfst.
            </p>
            <Link href="/vorlagen-generator?problem=fraud">
              <Button size="lg" className="gap-2">
                Verdachtsfall jetzt einordnen
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto max-w-3xl px-4 mt-10 space-y-14">
          <section className="ai-summary-card rounded-2xl border border-red-200/80 bg-red-50 p-6 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 shadow-sm">
                <Sparkles className="ai-summary-sparkle h-3.5 w-3.5" />
                Sofortcheck
              </span>
              <span className="text-xs text-muted-foreground">
                Fake-Shop-Verdacht: erst Belege sichern, dann Zahlungsweg prüfen
              </span>
            </div>
            <p className="ai-summary-text text-base leading-relaxed text-foreground/90">
              Wenn du gerade einen Fake-Shop vermutest, zählt zuerst Beweissicherung: URL,
              Impressum, Produktseite, Zahlungsbeleg, Bestellmail, Tracking und jede Antwort des
              Shops. Danach hängt der nächste Schritt vom Zahlungsweg ab: PayPal-Konflikt,
              Kreditkartenreklamation, Klarna-Problemmeldung, Bankkontakt oder Anzeige bei konkretem
              Verdacht auf Missbrauch.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                "Shop-Seite und Impressum screenshotten",
                "Zahlung und Bestellmail sichern",
                "Fristen beim Zahlungsanbieter prüfen",
              ].map((item) => (
                <div key={item} className="rounded-xl border bg-white/80 p-3 text-sm font-medium">
                  {item}
                </div>
              ))}
            </div>
          </section>

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
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">
              4 Warnmuster — und ein sinnvoller nächster Schritt
            </h2>
            <div className="grid gap-4">
              {SHOP_RISK_CATEGORIES.map((c, i) => (
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

          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">
              Beweise sichern, bevor der Shop verschwindet
            </h2>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Bei Fake-Shop-Verdacht zählt Geschwindigkeit. Viele Seiten ändern Produkttexte,
                Impressum oder Lieferhinweise nachträglich oder gehen ganz offline. Sichere deshalb
                Screenshots mit Datum, die komplette URL, Bestellnummer, Zahlungsbeleg und jede
                Antwort des Shops.
              </p>
              <p>
                Besonders wertvoll sind Belege, die das Versprechen des Shops und die Abweichung
                zeigen: Produktseite, Lieferzeit, Preis, Versandstatus, erhaltene Ware oder
                Nichtlieferung. Für Zahlungsdienstleister ist eine kurze Chronologie oft hilfreicher
                als ein langer Fließtext.
              </p>
              <p>
                Wenn du mit Kreditkarte, PayPal oder Klarna bezahlt hast, prüfe den jeweiligen
                Konfliktweg früh. Bei Überweisung solltest du deine Bank sehr schnell kontaktieren,
                weil Rückrufmöglichkeiten meist zeitkritisch sind.
              </p>
            </div>
          </section>

          {/* Quick lookup */}
          <section className="bg-muted p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Shop-Check in 30 Sekunden
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Gib hier den Shop-Namen oder die URL ein. Wir verlinken dir die passende
              Quick-Anleitung.
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
              <Link
                href={`/vorlagen-generator?problem=fraud${query ? `&merchant=${encodeURIComponent(query)}` : ""}`}
              >
                <Button>Fall starten</Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Wichtig:</strong> Wir prüfen den Shop nicht öffentlich — die Verdachtsmeldung
              bleibt anonym in deiner Wizard-Eingabe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-5 border-b pb-2">
              Häufige Fragen zu Fake-Shop-Verdacht
            </h2>
            <div className="grid gap-4">
              {FAQS.map((faq) => (
                <div key={faq.q} className="rounded-xl border bg-background p-5 shadow-sm">
                  <h3 className="mb-2 text-base font-bold leading-snug">{faq.q}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-5">Passend dazu</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  href: "/chargeback-antrag-vorlage",
                  label: "Chargeback Antrag Vorlage",
                  text: "Bank-Anfrage mit Umsatz, Shop-Daten und Belegen sachlich vorbereiten.",
                },
                {
                  href: "/paypal-kaeuferschutz-vorlage",
                  label: "PayPal Käuferschutz Vorlage",
                  text: "Konflikt im PayPal-Konto ohne harte Vorwürfe nachvollziehbar formulieren.",
                },
                {
                  href: "/ware-nicht-erhalten-musterbrief",
                  label: "Ware nicht erhalten Musterbrief",
                  text: "Händlerkontakt, Tracking und Zahlungsweg vor einer Eskalation sortieren.",
                },
                {
                  href: "/vergleich/paypal-vs-kreditkarte-vs-klarna",
                  label: "Zahlungswege vergleichen",
                  text: "PayPal, Kreditkarte, Klarna und Bankkontakt nach Belegen und Fristen einordnen.",
                },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <Card className="h-full cursor-pointer transition-colors hover:border-primary">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="font-semibold text-sm">{link.label}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{link.text}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-primary text-primary-foreground p-6 md:p-8 rounded-2xl text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Schon abgebucht? Handle möglichst zeitnah.
            </h2>
            <p className="text-primary-foreground/95 mb-5 text-sm md:text-base">
              Typische Fristen unterscheiden sich je nach Zahlungsart. Wir helfen dir, deine
              Unterlagen strukturiert vorzubereiten und die passenden Anbieterregeln zu prüfen.
            </p>
            <Link href="/vorlagen-generator?problem=fraud">
              <Button size="lg" variant="secondary" className="gap-2">
                Nächste Schritte starten
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </section>
        </div>
      </article>
    </MainLayout>
  );
}
