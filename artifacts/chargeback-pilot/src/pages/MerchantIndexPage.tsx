import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, CreditCard, FileSearch, Sparkles } from "lucide-react";
import NotFound from "./not-found";
import {
  getMerchant,
  getMerchantIndexSeo,
  getProblem,
  getProblemDisplayLabel,
} from "@/data/merchants";
import { isIndexableMerchantProblemPath } from "@/seo-quality";
import { SEO_LASTMOD } from "@/seo-routes";
import { trackCtaClick } from "@/lib/analytics";

const SITE = "https://chargebackpilot.de";

interface MerchantHubContent {
  shortAnswer: string;
  focus: string[];
  evidence: string[];
  paymentPath: {
    title: string;
    text: string;
  };
  faq: { q: string; a: string }[];
}

const PRIORITY_MERCHANT_CONTENT: Record<string, MerchantHubContent> = {
  apple: {
    shortAnswer:
      "Wenn eine Apple- oder iTunes-Abbuchung unklar ist, pruefe zuerst Abo, Kaufhistorie, Familienfreigabe und Apple-Erstattungsweg. Bleibt die Zahlung danach strittig, helfen Bestellnummer, Kontoauszug und Supportantworten, den Zahlungsweg sachlich einzuordnen.",
    focus: [
      "Bei Apple / iTunes ist die Kaufhistorie im Apple-Konto der wichtigste Startpunkt, weil dort Abo, In-App-Kauf, Datum und Bestellnummer sichtbar sein koennen.",
      "Pruefe auch Familienfreigabe, vergessene Probeabos und hinterlegte Zahlungsmittel, bevor du eine Zahlung als unklar einordnest.",
      "Wenn Apple keine nachvollziehbare Loesung anbietet, kann je nach Zahlungsart eine Anfrage bei Karte, PayPal oder Bank vorbereitet werden.",
    ],
    evidence: [
      "Screenshot der Apple-Kaufhistorie mit Bestellnummer",
      "Kontoauszug oder Kartenumsatz mit Datum und Betrag",
      "Abo-Status, Kuendigungsdatum oder Erstattungsantwort",
      "Supportverlauf mit Apple, falls bereits kontaktiert",
    ],
    paymentPath: {
      title: "Zahlungsweg nach Apple-Pruefung klaeren",
      text: "Apple ist meist der erste Ansprechpartner. Danach entscheidet der tatsaechliche Zahlungsweg: Kreditkarte, PayPal, SEPA oder Wallet-Zahlung koennen unterschiedliche Pruefwege und Fristen haben.",
    },
    faq: [
      {
        q: "Was sollte ich bei einer Apple / iTunes Abbuchung zuerst pruefen?",
        a: "Pruefe Kaufhistorie, Abo-Uebersicht, Familienfreigabe und die verwendete Apple-ID. Viele unklare Abbuchungen lassen sich ueber Bestellnummer, Abo-Status oder In-App-Kauf zuordnen.",
      },
      {
        q: "Kann ich nach einer Apple-Ablehnung noch Bank oder PayPal kontaktieren?",
        a: "Das kann je nach Zahlungsart eine Option sein. Hilfreich ist, wenn du Apples Antwort, den Umsatz und die Bestellnummer sauber dokumentierst und die Anbieterregeln direkt beim Zahlungsdienstleister pruefst.",
      },
      {
        q: "Welche Belege helfen bei Apple-Abos am meisten?",
        a: "Wichtig sind Kaufhistorie, Abo-Status, Kuendigungsnachweis, Zahlungsbeleg und Supportantworten. Eine kurze Chronologie macht nachvollziehbar, wann die Abbuchung erfolgte und was du bereits unternommen hast.",
      },
    ],
  },
  "uber-eats": {
    shortAnswer:
      "Bei Uber Eats zaehlen App-Status, Lieferzeit, Fotos und Supportverlauf. Dokumentiere die Bestellung sofort, reklamiere zuerst in der App und pruefe danach je nach Zahlungsart PayPal, Kreditkarte oder Bank.",
    focus: [
      "Bei Uber Eats verschwinden wichtige Details oft im App-Verlauf; sichere deshalb Bestelluebersicht, Uhrzeit, Lieferstatus und Supportantwort zeitnah als Screenshot.",
      "Bei falscher oder unbrauchbarer Lieferung sind Fotos direkt nach Erhalt besonders hilfreich, weil sie Zustand, Umfang und Abweichung zeigen.",
      "Wenn der App-Support nicht nachvollziehbar klaert, sollte der Zahlungsweg getrennt betrachtet werden: PayPal, Karte und Bank haben unterschiedliche Regeln.",
    ],
    evidence: [
      "Bestelluebersicht in der Uber-Eats-App",
      "Screenshot von Lieferstatus und Uhrzeit",
      "Fotos der falschen, kalten oder fehlenden Bestellung",
      "Support-Chat und Zahlungsnachweis",
    ],
    paymentPath: {
      title: "Erst App-Support, dann Zahlungsweg",
      text: "Der erste Schritt ist meist die Reklamation in der App. Wenn das Ergebnis offen bleibt, kann der Zahlungsdienstleister nur dann sinnvoll pruefen, wenn Problem, Betrag und Supportverlauf klar belegt sind.",
    },
    faq: [
      {
        q: "Was tun, wenn eine Uber Eats Bestellung fehlt?",
        a: "Sichere App-Status, erwartete Lieferzeit, Zahlungsbeleg und Supportverlauf. Reklamiere direkt in der App und notiere, welchen Betrag du klaeren moechtest.",
      },
      {
        q: "Welche Beweise sind bei falschem Essen wichtig?",
        a: "Fotos der Lieferung, Bestelluebersicht und Supportantworten sind besonders hilfreich. Je konkreter die Abweichung dokumentiert ist, desto besser laesst sich der Fall nachvollziehen.",
      },
      {
        q: "Ist ein Chargeback bei Uber Eats automatisch erfolgreich?",
        a: "Nein. Ob PayPal, Bank oder Kreditkarte etwas pruefen oder entscheiden, haengt vom Einzelfall, den Belegen und den jeweiligen Anbieterregeln ab.",
      },
    ],
  },
  lieferando: {
    shortAnswer:
      "Bei Lieferando solltest du fehlende, falsche oder kalte Bestellungen sofort mit App-Status, Fotos, Supportkontakt und Zahlungsbeleg sichern. Danach laesst sich der passende Weg ueber Lieferando, PayPal, Karte oder Bank sachlich pruefen.",
    focus: [
      "Bei Lieferando ist wichtig, ob das Problem Restaurant, Lieferung, App-Status oder Zahlung betrifft; diese Punkte sollten getrennt dokumentiert werden.",
      "Fotos, Uhrzeit und Bestelluebersicht helfen besonders bei falscher, kalter oder unvollstaendiger Lieferung.",
      "Wenn keine nachvollziehbare Klaerung erfolgt, kann der Zahlungsweg eine zusaetzliche Pruefung ermoeglichen; die Entscheidung trifft aber der jeweilige Anbieter.",
    ],
    evidence: [
      "Lieferando-Bestelluebersicht und Bestellnummer",
      "Screenshot von Lieferstatus und Supportantwort",
      "Fotos der erhaltenen Bestellung",
      "Zahlungsnachweis und betroffener Betrag",
    ],
    paymentPath: {
      title: "Lieferando-Fall sauber vom Zahlungsweg trennen",
      text: "Reklamiere zuerst beim vorgesehenen Support. Fuer PayPal, Karte oder Bank ist danach wichtig, dass du zeigen kannst, welches Problem gemeldet wurde und wie Lieferando reagiert hat.",
    },
    faq: [
      {
        q: "Was sollte ich bei Lieferando zuerst dokumentieren?",
        a: "Bestellnummer, Uhrzeit, Lieferstatus, Foto der Lieferung, Zahlungsbeleg und Supportantworten. Diese Belege zeigen, was bestellt, bezahlt und tatsaechlich geliefert wurde.",
      },
      {
        q: "Kann ich bei kaltem Essen den Zahlungsdienstleister einschalten?",
        a: "Das kann je nach Zahlungsart und Einzelfall geprueft werden. Vorher ist ein dokumentierter Klaerungsversuch beim Support meist praktisch hilfreich.",
      },
      {
        q: "Welche Formulierung ist bei Lieferando sinnvoll?",
        a: "Bleibe sachlich: Bestellung, Uhrzeit, konkretes Problem, betroffener Betrag, bisherige Supportantwort und gewuenschte Klaerung. Vorwuerfe oder Druckformulierungen sind meist weniger hilfreich.",
      },
    ],
  },
  amazon: {
    shortAnswer:
      "Bei Amazon kommt es darauf an, ob Amazon selbst, ein Drittanbieter oder der Versandstatus betroffen ist. Sichere Bestellung, Tracking, A-bis-Z-Kommunikation und Zahlungsnachweis, bevor du PayPal, Klarna oder Karte pruefst.",
    focus: [
      "Bei Amazon-Faellen sollte zuerst klar sein, ob Amazon selbst verkauft hat oder ein Marktplatzhaendler beteiligt ist.",
      "Tracking, Zustellnachweis und Lieferadresse sind bei nicht erhaltener Ware besonders wichtig, weil Zustellung und Vertragspartner getrennt bewertet werden koennen.",
      "Wenn interne Amazon-Wege keine Klaerung bringen, kann der Zahlungsweg eine weitere Option sein; harte Erfolgsaussagen waeren unserioes.",
    ],
    evidence: [
      "Amazon-Bestellnummer und Rechnung",
      "Trackingstatus, Zustellfoto oder Liefernachweis",
      "Kommunikation mit Amazon oder Drittanbieter",
      "Zahlungsnachweis und genutzte Zahlungsart",
    ],
    paymentPath: {
      title: "Amazon, Drittanbieter und Zahlung getrennt pruefen",
      text: "Erst sollte der Amazon- oder Marktplatzweg dokumentiert werden. Danach kann je nach Zahlungsart PayPal, Klarna oder die kartenausgebende Bank relevant sein.",
    },
    faq: [
      {
        q: "Was ist bei Amazon Drittanbieter-Faellen wichtig?",
        a: "Dokumentiere, wer Vertragspartner ist, welche Nachricht vom Verkaeufer kam und was Amazon im Konto anzeigt. Das hilft, Supportweg und Zahlungsweg auseinanderzuhalten.",
      },
      {
        q: "Was tun, wenn Amazon Ware als zugestellt markiert?",
        a: "Sichere Tracking, Zustellnachweis, Lieferadresse und deine Rueckfrage beim Support. Danach kannst du pruefen, ob weitere Schritte ueber Zahlungsdienstleister in Betracht kommen.",
      },
      {
        q: "Sollte ich sofort ein Chargeback starten?",
        a: "Meist ist zuerst eine nachvollziehbare Klaerung ueber Amazon oder den Haendler sinnvoll. Zahlungsdienstleister fragen haeufig nach Kontaktversuchen und Belegen.",
      },
    ],
  },
  kiwi: {
    shortAnswer:
      "Bei Kiwi.com sollten Buchung, Airline-Status, Stornierungsgrund, Gutscheinangebot, Gebuehren und Zahlungsweg getrennt dokumentiert werden. Gerade bei Vermittlerrollen hilft eine klare Chronologie.",
    focus: [
      "Bei Kiwi.com ist die Rolle als Vermittler praktisch wichtig: Airline-Informationen, Kiwi-Kommunikation und Zahlungsbeleg sollten getrennt abgelegt werden.",
      "Bei Flugstornierungen sind Buchungscode, Stornierungsnachricht, angebotene Alternative und bereits erhaltene Erstattungen zentral.",
      "Wenn Steuern, Gebuehren oder Restbetraege offen bleiben, sollte die Zahlungsreklamation nur mit sauberer Aufstellung vorbereitet werden.",
    ],
    evidence: [
      "Kiwi-Buchungsnummer und Airline-Buchungscode",
      "Stornierungs- oder Umbuchungsnachricht",
      "Gebuehren- und Erstattungsaufstellung",
      "Zahlungsnachweis und Supportverlauf",
    ],
    paymentPath: {
      title: "Vermittlerweg und Zahlungsweg nebeneinander pruefen",
      text: "Klaere zuerst, welche Leistung Kiwi.com, Airline oder Zahlungsdienstleister betrifft. Fuer Karte oder PayPal sind Buchungsstatus, Erstattungsstand und Kommunikation besonders wichtig.",
    },
    faq: [
      {
        q: "Was ist bei Kiwi.com nach einer Flugstornierung wichtig?",
        a: "Sichere Buchungscode, Stornierungsnachricht, Erstattungsstand, Gutscheinangebot und Zahlungsbeleg. Eine klare Trennung zwischen Airline und Vermittler macht den Fall nachvollziehbarer.",
      },
      {
        q: "Kann ich Steuern und Gebuehren getrennt geltend machen?",
        a: "Das kann je nach Buchung und Anbieterregeln eine eigene Klaerung sein. Wichtig ist eine konkrete Aufstellung, welche Positionen gezahlt, erstattet oder noch offen sind.",
      },
      {
        q: "Wann hilft PayPal oder Kreditkarte bei Kiwi.com?",
        a: "Wenn der direkte Klaerungsweg offen bleibt, kann je nach Zahlungsart eine zusaetzliche Pruefung in Betracht kommen. Die konkreten Fristen und Regeln solltest du direkt beim Zahlungsdienstleister pruefen.",
      },
    ],
  },
};

function buildFallbackHubContent(merchantName: string, problems: string[]): MerchantHubContent {
  const problemText = problems.length ? problems.join(", ") : "Reklamation";
  return {
    shortAnswer: `Bei ${merchantName} zaehlen vor allem eine klare Chronologie, der passende Zahlungsweg und geordnete Belege. Dokumentiere Bestell- oder Buchungsdaten, Betrag, Problem und bisherigen Supportkontakt, bevor du weitere Schritte pruefst.`,
    focus: [
      `Halte fest, welches konkrete Problem bei ${merchantName} vorliegt und wann du den Anbieter kontaktiert hast.`,
      "Trenne Anbieterweg und Zahlungsweg, weil PayPal, Klarna, Kreditkarte oder Bank unterschiedliche Regeln haben koennen.",
      "Formuliere sachlich mit Datum, Betrag, Belegen und gewuenschter Klaerung statt mit pauschalen Vorwuerfen.",
    ],
    evidence: [
      "Bestell- oder Buchungsnummer",
      "Zahlungsnachweis",
      "Supportverlauf",
      "Screenshots zum konkreten Problem",
    ],
    paymentPath: {
      title: "Passenden Zahlungsweg pruefen",
      text: `Je nachdem, ob du mit PayPal, Klarna, Kreditkarte oder Bank gezahlt hast, unterscheiden sich Fristen und Ablauf. ${merchantName}-Belege sollten deshalb geordnet vorliegen.`,
    },
    faq: [
      {
        q: `Welche Belege sind bei ${merchantName} wichtig?`,
        a: `Hilfreich sind Bestell- oder Buchungsnummer, Zahlungsnachweis, Supportverlauf und Screenshots zum konkreten Problem: ${problemText}.`,
      },
      {
        q: `Sollte ich ${merchantName} zuerst kontaktieren?`,
        a: "In vielen Faellen ist ein dokumentierter Klaerungsversuch sinnvoll. Eine sachliche Nachricht mit angemessener Rueckmeldefrist hilft auch spaeter bei PayPal, Klarna, Bank oder Kreditkarte.",
      },
      {
        q: "Ist das eine Rechtsberatung?",
        a: "Nein. ChargebackPilot bietet allgemeine Orientierung und unverbindliche Formulierungshilfe. Die Entscheidung treffen Anbieter, Bank oder Zahlungsdienstleister nach ihren Regeln.",
      },
    ],
  };
}

export default function MerchantIndexPage() {
  const [, params] = useRoute<{ merchantSlug: string }>("/hilfe/:merchantSlug");
  const merchant = params ? getMerchant(params.merchantSlug) : null;
  if (!merchant) return <NotFound />;

  const indexSeo = getMerchantIndexSeo(merchant);
  const title = indexSeo.title;
  const description = indexSeo.description;
  const problems = merchant.problems
    .map((slug) => getProblem(slug))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const indexedProblems = problems.filter((p) =>
    isIndexableMerchantProblemPath(`/hilfe/${merchant.slug}/${p.slug}`)
  );
  const visibleProblemLabels = problems.map((p) => getProblemDisplayLabel(merchant, p));
  const hubContent =
    PRIORITY_MERCHANT_CONTENT[merchant.slug] ??
    buildFallbackHubContent(merchant.name, visibleProblemLabels);
  const canonicalPath = `/hilfe/${merchant.slug}`;
  const hubWizardHref = `/vorlagen-generator?new=1&merchant=${encodeURIComponent(
    merchant.name
  )}&source=${encodeURIComponent(canonicalPath)}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: indexSeo.headline,
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
      dateModified: SEO_LASTMOD,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: hubContent.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <MainLayout>
      <SeoHead title={title} description={description} canonical={canonicalPath} jsonLd={jsonLd} />
      <Breadcrumbs items={[{ label: "Ratgeber", href: "/ratgeber" }, { label: merchant.name }]} />

      <article className="pb-20">
        <header className="bg-gradient-to-b from-blue-50 to-background py-12 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{indexSeo.headline}</h1>
            <p className="text-lg text-muted-foreground mb-6">{merchant.description}</p>
            <Link
              href={hubWizardHref}
              onClick={() => trackCtaClick("merchant_hub_hero", hubWizardHref)}
            >
              <Button size="lg" className="gap-2">
                Kostenlosen Fall-Check starten <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto max-w-3xl px-4 mt-10 space-y-10">
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-bold text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Kurzantwort
            </div>
            <p className="text-base leading-relaxed text-foreground">{hubContent.shortAnswer}</p>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: FileSearch,
                title: "Bei diesem Anbieter wichtig",
                text: hubContent.focus[0],
              },
              {
                icon: CheckCircle2,
                title: "Belege zuerst sichern",
                text: hubContent.evidence.slice(0, 3).join(", "),
              },
              {
                icon: CreditCard,
                title: hubContent.paymentPath.title,
                text: hubContent.paymentPath.text,
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <h2 className="mb-1 text-sm font-bold">{item.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">
              Was bei {merchant.name} besonders wichtig ist
            </h2>
            <div className="space-y-3">
              {hubContent.focus.map((item) => (
                <div key={item} className="rounded-xl border bg-card p-4 text-sm leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </section>

          {indexedProblems.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-5">Wichtige Guides zu {merchant.name}</h2>
              <div className="grid gap-3">
                {indexedProblems.map((p) => (
                  <Link key={p.slug} href={`/hilfe/${merchant.slug}/${p.slug}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-5 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">
                            {merchant.name}: {getProblemDisplayLabel(merchant, p)}
                          </div>
                          <div className="text-sm text-muted-foreground leading-relaxed mt-2">
                            <p>
                              <strong>3 sinnvolle Schritte bei {merchant.name}:</strong>
                            </p>
                            <ol className="list-decimal pl-4 mt-2 space-y-1">
                              <li>Kontaktiere den Support von {merchant.name} schriftlich.</li>
                              <li>Sichere Beweise passend zu Problem und Zahlungsart.</li>
                              <li>
                                Erstelle strukturierte Formulierungsvorschläge für Händler und
                                Zahlungsdienstleister.
                              </li>
                            </ol>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {indexedProblems.length === 0 && (
            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-3">
                Fall bei {merchant.name} strukturiert vorbereiten
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Bei {merchant.name} kommt es vor allem auf eine klare Chronologie, den passenden
                Zahlungsweg und nachvollziehbare Belege an. Der kostenlose Fall-Check hilft dir,
                dein konkretes Problem sachlich einzuordnen und die nächsten Schritte vorzubereiten.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {problems.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/vorlagen-generator?merchant=${encodeURIComponent(
                      merchant.name
                    )}&problem=${encodeURIComponent(p.wizardProblemId)}&source=${encodeURIComponent(
                      canonicalPath
                    )}`}
                    onClick={() =>
                      trackCtaClick(
                        `merchant_hub_problem_${p.slug}`,
                        `/vorlagen-generator?problem=${encodeURIComponent(p.wizardProblemId)}`
                      )
                    }
                    className="rounded-lg border bg-muted/30 px-3 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="font-semibold">{getProblemDisplayLabel(merchant, p)}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Belege sichern, Zahlungsweg prüfen, Textentwurf vorbereiten
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Belege sichern",
                text: hubContent.evidence.join(", "),
              },
              {
                title: "Zahlungsweg prüfen",
                text: "PayPal, Kreditkarte, Klarna oder Bank haben unterschiedliche Ablaeufe und Fristen.",
              },
              {
                title: "Sachlich formulieren",
                text: "Keine Vorwuerfe, sondern konkrete Daten, Problem, bisherige Klaerung und gewuenschte Loesung.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-4">
                  <h2 className="mb-1 text-sm font-bold">{item.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border/50">
            <p>
              <strong>Markenrechtlicher Hinweis:</strong> {merchant.name} ist eine Markenbezeichnung
              des jeweiligen Rechteinhabers. ChargebackPilot ist unabhängig und steht in keiner
              Verbindung, Partnerschaft oder Kooperation mit {merchant.name}. Die Nennung dient
              ausschließlich dazu, typische Verbraucherfälle sachlich einzuordnen. Keine
              Rechtsberatung.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Häufige Fragen zu {merchant.name}</h2>
            <div className="grid gap-3">
              {hubContent.faq.map((item) => (
                <div key={item.q} className="rounded-xl border bg-card p-4">
                  <h3 className="mb-2 text-base font-bold leading-snug">{item.q}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </MainLayout>
  );
}
