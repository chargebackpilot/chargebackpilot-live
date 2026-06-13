import { MainLayout } from "@/components/layout/MainLayout";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  CalendarCheck,
  PenLine,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

interface FaqItem {
  q: string;
  a: string;
}

interface GuideContext {
  primaryPath: string;
  firstCheck: string;
  evidenceFocus: string;
  timingHint: string;
  escalationHint: string;
  notIdealWhen: string;
  wordingHint: string;
  parallelPath: string;
}

const SITE = "https://chargebackpilot.de";
const DISPLAY_UPDATED_AT = "11. Juni 2026";
const SCHEMA_UPDATED_AT = "2026-06-11";

function guideContext(title: string, category: string): GuideContext {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();

  if (lowerCategory.includes("paypal")) {
    return {
      primaryPath: "PayPal-Konfliktcenter und anschließende Eskalation zum Käuferschutz",
      firstCheck:
        "ob die Zahlung als geschäftliche Zahlung lief und der Fall im PayPal-Konto noch fristgerecht eröffnet oder eskaliert werden kann",
      evidenceFocus:
        "PayPal-Transaktionsnummer, Artikelbeschreibung, Tracking, Händlerchat und eine kurze Chronologie",
      timingHint:
        "PayPal nennt häufig 180 Tage ab Zahlung; die konkrete Eskalationsfrist steht im jeweiligen Konflikt",
      escalationHint:
        "erst sachlich den Händlerkontakt dokumentieren, dann im Konfliktcenter klar erklären, welche Lösung verlangt wurde",
      notIdealWhen:
        "die Zahlung über Freunde und Familie lief oder du keine Transaktion im PayPal-Konto findest",
      wordingHint:
        "kurz, chronologisch und belegorientiert formulieren, ohne Betrug zu unterstellen",
      parallelPath:
        "bei hinterlegter Kreditkarte zusätzlich prüfen, ob die kartenausgebende Bank einen Weg nennt",
    };
  }

  if (
    lowerCategory.includes("kreditkarte") ||
    lowerCategory.includes("amex") ||
    lowerCategory.includes("reason")
  ) {
    return {
      primaryPath: "Umsatzreklamation bei der kartenausgebenden Bank oder direkt bei Amex",
      firstCheck:
        "welche Frist deine Bank, Amex oder der Kartenausgeber für genau diesen Umsatz nennt",
      evidenceFocus:
        "Kartenumsatz, Bestell- oder Buchungsunterlagen, Kontaktversuche, Tracking und Nachweis der Nichterfüllung",
      timingHint:
        "bei Kartenreklamationen werden oft enge Fristen genannt; maßgeblich ist die Anzeige deiner Bank",
      escalationHint:
        "die Bank um Prüfung nach den geltenden Kartenregeln bitten und Belege geordnet anhängen",
      notIdealWhen:
        "du nur mündliche Angaben hast oder noch gar keinen nachvollziehbaren Klärungsversuch beim Händler dokumentiert hast",
      wordingHint:
        "den Sachverhalt als Umsatzreklamation beschreiben und interne Reason Codes nicht als Garantie darstellen",
      parallelPath:
        "falls PayPal oder Klarna zwischengeschaltet war, zuerst dort die konkreten Konfliktregeln prüfen",
    };
  }

  if (lowerCategory.includes("klarna")) {
    return {
      primaryPath: "Problemmeldung im Klarna-Konto und parallele Klärung mit dem Händler",
      firstCheck:
        "ob die Rechnung oder Ratenzahlung im Klarna-Konto pausiert oder als Problem gemeldet werden kann",
      evidenceFocus:
        "Klarna-Rechnung, Bestelldaten, Retourenbeleg, Tracking, Fotos und Händlerkommunikation",
      timingHint:
        "Klarna-Probleme solltest du früh melden, bevor Mahnungen oder automatische Prozesse starten",
      escalationHint:
        "Klarna und Händler parallel sachlich informieren, damit Forderung und Lieferproblem zusammengeführt werden",
      notIdealWhen:
        "du die Rechnung nur ignorierst, ohne das Problem im Klarna-Konto sichtbar zu melden",
      wordingHint:
        "klar zwischen Lieferproblem, Retoure, Forderung und gewünschter Zahlungspause unterscheiden",
      parallelPath:
        "bei Kreditkartenzahlung an Klarna zusätzlich die Kartenumsatzreklamation nur nach Prüfung des Zahlungswegs betrachten",
    };
  }

  if (lowerCategory.includes("flug") || lowerTitle.includes("kiwi")) {
    return {
      primaryPath:
        "schriftliche Erstattungsaufforderung an Airline, Vermittler oder Zahlungsdienstleister",
      firstCheck:
        "wer die Leistung verkauft hat, wer storniert hat und ob Gutschein, Umbuchung oder Erstattungszusage dokumentiert ist",
      evidenceFocus:
        "Buchungscode, Ticket, Stornierungsnachricht, Erstattungszusage, Zahlungsnachweis und bisherige Antworten",
      timingHint:
        "bei Reise- und Flugfällen ändern sich Fristen je nach Zahlungsweg, Anbieter und Fallgrund",
      escalationHint:
        "zuerst den konkreten Erstattungsbetrag und die verlangten Gebühren nachvollziehbar anfordern",
      notIdealWhen:
        "du freiwillig eine endgültige Alternativlösung akzeptiert hast und keine offene Forderung mehr dokumentiert ist",
      wordingHint:
        "zwischen Ticketpreis, Steuern, Gebühren, Serviceentgelt und Gutschein sauber trennen",
      parallelPath:
        "bei Kartenzahlung eine Umsatzreklamation prüfen; bei PayPal den Konfliktweg im Konto prüfen",
    };
  }

  if (lowerCategory.includes("lieferdienst")) {
    return {
      primaryPath: "Support-Meldung in der Liefer-App und danach Zahlungsdienstleister prüfen",
      firstCheck:
        "ob Bestellung, Lieferzeit, fehlende Artikel oder Qualitätsmangel sofort in der App dokumentiert wurden",
      evidenceFocus:
        "Bestellübersicht, Zeitstempel, Fotos, Support-Chat, Fahrerroute und Zahlungsnachweis",
      timingHint:
        "bei Essen und verderblichen Waren ist eine sehr schnelle Reklamation besonders wichtig",
      escalationHint:
        "erst die konkrete Abweichung melden, dann bei Ablehnung den Zahlungsweg sachlich prüfen",
      notIdealWhen: "keine Fotos, kein Supportverlauf und keine zeitnahe Meldung vorhanden sind",
      wordingHint:
        "nicht pauschal 'schlecht' schreiben, sondern Temperatur, fehlende Artikel oder falsche Lieferung konkret benennen",
      parallelPath: "je nach Zahlung PayPal, Kreditkarte, Apple Pay, Google Pay oder Klarna prüfen",
    };
  }

  if (lowerCategory.includes("online")) {
    return {
      primaryPath: "Händlerkontakt, Käuferschutz oder Chargeback bei nicht gelieferter Ware",
      firstCheck: "ob Tracking, Zustellstatus und Händlerantwort wirklich zusammenpassen",
      evidenceFocus:
        "Bestellbestätigung, Trackingverlauf, Zahlungsnachweis, Händlerkommunikation und Screenshots des Shops",
      timingHint:
        "warte nicht endlos auf den Händler, sondern sichere Fristen bei PayPal, Bank oder Klarna frühzeitig",
      escalationHint:
        "den Händler schriftlich zur Klärung auffordern und danach den Zahlungsdienstleister mit Belegen einbinden",
      notIdealWhen:
        "du keinen Zahlungsnachweis oder keine belastbare Verbindung zwischen Händler und Bestellung hast",
      wordingHint:
        "zwischen 'nicht geliefert', 'angeblich zugestellt' und 'falsche Ware' präzise unterscheiden",
      parallelPath:
        "PayPal, Kreditkarte und Klarna haben unterschiedliche Regeln; der genutzte Zahlungsweg entscheidet",
    };
  }

  if (lowerCategory.includes("abo")) {
    return {
      primaryPath:
        "schriftlicher Widerspruch gegen die Abbuchung plus Kündigungs- und Zahlungswegprüfung",
      firstCheck:
        "ob es eine nachweisbare Zustimmung, Kündigung, Testphase oder wiederkehrende Abbuchung gibt",
      evidenceFocus:
        "Umsatz, Kündigungsnachweis, Bestellseite, Vertragsmail, AGB-Screenshot und Anbieterkommunikation",
      timingHint:
        "bei wiederkehrenden Abbuchungen zählt jeder weitere Monat; Belege und Widerspruch sollten früh erfolgen",
      escalationHint:
        "Abbuchung, Vertragsgrundlage und Kündigung getrennt ansprechen, damit der Fall nachvollziehbar bleibt",
      notIdealWhen:
        "du nur die Karte sperrst, aber gegenüber dem Anbieter keine Kündigung oder keinen Widerspruch dokumentierst",
      wordingHint:
        "keine vorschnellen Betrugsvorwürfe, sondern Autorisierung und Vertragsgrundlage sachlich bestreiten",
      parallelPath:
        "Bank, Kreditkarte oder PayPal können je nach Zahlungsart unterschiedliche Rückgabewege haben",
    };
  }

  if (lowerCategory.includes("musterbrief")) {
    return {
      primaryPath:
        "schriftliche Fallaufbereitung für Händler, Bank, PayPal, Klarna oder Kartenausgeber",
      firstCheck:
        "welcher Empfänger entscheiden kann und welche Unterlagen dieser Empfänger realistischerweise braucht",
      evidenceFocus:
        "Datum, Betrag, Bestellnummer, Zahlungsnachweis, Problembelege und bisherige Kommunikation",
      timingHint:
        "Vorlagen helfen nur, wenn sie rechtzeitig und mit den konkreten Fristen des Zahlungswegs genutzt werden",
      escalationHint:
        "erst die Hauptforderung klar benennen, dann Belege und gewünschte Prüfung sortiert aufführen",
      notIdealWhen:
        "du nur einen Standardtext ohne konkrete Daten, Belege oder Chronologie versendest",
      wordingHint:
        "neutral, knapp und prüfbar schreiben; lange emotionale Schilderungen schwächen oft die Übersicht",
      parallelPath: "den Musterbrief je nach Zahlung an Händler, Bank, PayPal oder Klarna anpassen",
    };
  }

  return {
    primaryPath: "schriftliche Reklamation und danach Prüfung des passenden Zahlungswegs",
    firstCheck: "welcher Anbieter zuständig ist und welche Frist im konkreten Konto angezeigt wird",
    evidenceFocus: "Zahlungsnachweis, Bestelldaten, Problembelege und bisherige Kommunikation",
    timingHint:
      "Fristen unterscheiden sich je nach Anbieter und Zahlungsart; prüfe sie direkt an der Quelle",
    escalationHint:
      "sachlich eskalieren, wenn der Händler nicht reagiert oder keine nachvollziehbare Lösung anbietet",
    notIdealWhen:
      "keine Belege oder keine klare Verbindung zwischen Zahlung und Problem vorhanden sind",
    wordingHint: "chronologisch, belegorientiert und ohne Erfolgsgarantie formulieren",
    parallelPath: "PayPal, Kreditkarte, Klarna oder Händlerweg je nach Zahlungsart getrennt prüfen",
  };
}

function enrichFaq(
  baseFaq: FaqItem[],
  title: string,
  category: string,
  ctx: GuideContext
): FaqItem[] {
  const generated: FaqItem[] = [
    {
      q: `Wann ist dieser Ratgeber sinnvoll?`,
      a: `Sinnvoll ist dieser Weg, wenn dein Problem zum beschriebenen Falltyp passt, du Zahlung und Bestellung belegen kannst und der Händler oder Anbieter keine nachvollziehbare Lösung anbietet. Vor einer Eskalation solltest du prüfen, ${ctx.firstCheck}.`,
    },
    {
      q: `Welche Unterlagen sollte ich vor dem Antrag sortieren?`,
      a: `Besonders wichtig sind ${ctx.evidenceFocus}. Lege die Belege am besten in einer kurzen Reihenfolge ab: Zahlung, Bestellung, Problem, Kontaktversuch, aktueller Stand.`,
    },
    {
      q: `Muss ich den Händler vorher kontaktieren?`,
      a: `In vielen Fällen ist ein dokumentierter Kontaktversuch hilfreich oder wird vom Zahlungsdienstleister erwartet. Eine sachliche Nachricht mit Bestellnummer, Betrag, Problem und gewünschter Lösung verbessert die Nachvollziehbarkeit.`,
    },
    {
      q: `Welche Frist gilt bei ${category}?`,
      a: `${ctx.timingHint}. Verlasse dich deshalb nicht nur auf allgemeine Richtwerte, sondern prüfe die Frist direkt im PayPal-Konto, bei Klarna, bei deiner Bank oder beim Kartenausgeber.`,
    },
    {
      q: `Was sollte ich in der Begründung vermeiden?`,
      a: `Vermeide pauschale Vorwürfe, lange emotionale Texte und unklare Beträge. Besser ist: ${ctx.wordingHint}. Jede zentrale Aussage sollte durch einen Beleg oder zumindest ein konkretes Datum nachvollziehbar sein.`,
    },
    {
      q: `Was passiert, wenn der Antrag abgelehnt wird?`,
      a: `Eine Ablehnung ist nicht automatisch endgültig. Prüfe die Begründung, reiche fehlende Belege nach und frage nach, ob eine erneute Prüfung möglich ist. Weitere Wege wie Händler-Eskalation, Verbraucherzentrale oder anwaltliche Prüfung hängen vom Einzelfall ab.`,
    },
    {
      q: `Kann ChargebackPilot den Fall für mich durchsetzen?`,
      a: `Nein. ChargebackPilot vertritt dich nicht gegenüber Händlern, Banken oder Zahlungsdienstleistern und bietet keine Rechtsberatung. Das Tool hilft dir, deinen Sachverhalt zu ordnen und unverbindliche Formulierungsvorschläge zu erstellen.`,
    },
    {
      q: `Kann ich mehrere Wege parallel nutzen?`,
      a: `Du solltest Doppelverfahren und widersprüchliche Angaben vermeiden. Sinnvoll ist eine saubere Reihenfolge: erst Zuständigkeit und Zahlungsweg klären, dann ${ctx.parallelPath}. Bereits erhaltene Erstattungen müssen transparent berücksichtigt werden.`,
    },
  ];

  const seen = new Set<string>();
  return [...baseFaq, ...generated].filter((item) => {
    const key = item.q.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function SEOArticleLayout({
  title,
  category,
  whenApplies,
  evidence,
  steps,
  mistakes,
  faq,
}: SEOProps) {
  const [pathname] = useLocation();
  const description = `${title}: typische Fristenhinweise, Belege und strukturierte Orientierung bei ${category}. Mit unverbindlichen Textentwürfen.`;
  const canonicalPath = pathname || "/ratgeber";
  const context = guideContext(title, category);
  const enrichedFaq = enrichFaq(faq, title, category, context);

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
    dateModified: SCHEMA_UPDATED_AT,
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: enrichedFaq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const relatedGuides = [
    { href: "/paypal-chargeback", label: "PayPal Käuferschutz" },
    { href: "/visa-mastercard-chargeback", label: "Visa & Mastercard" },
    { href: "/klarna-reklamation", label: "Klarna Reklamation" },
    { href: "/vergleich/paypal-vs-kreditkarte-vs-klarna", label: "Vergleich Käuferschutz" },
  ]
    .filter((g) => g.href !== canonicalPath)
    .slice(0, 3);

  return (
    <MainLayout>
      <SeoHead
        title={`${title} | ChargebackPilot`}
        description={description}
        canonical={canonicalPath}
        jsonLd={[howToSchema, articleSchema, faqSchema]}
      />
      <Breadcrumbs items={[{ label: "Ratgeber", href: "/ratgeber" }, { label: category }]} />
      <article className="pb-20">
        {/* Header */}
        <header className="bg-muted py-16 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{title}</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Erhalte eine strukturierte Orientierung zu {category}: typische Fristenhinweise,
              Belege und mögliche nächste Schritte.
            </p>
            <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
            <Link
              href="/vorlagen-generator?new=1"
              onClick={(e) => {
                e.preventDefault();
                handleNewCaseClick();
              }}
            >
              <Button size="lg" className="gap-2">
                Kostenlosen Fall-Check starten
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

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">
              Kurz einordnen, bevor du eskalierst
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-background p-4">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
                  Passender Weg
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {context.primaryPath}
                </p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-sky-700">
                  Vorher prüfen
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Prüfe zuerst, {context.firstCheck}.
                </p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">
                  Schwächerer Fall
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Schwieriger wird es, wenn {context.notIdealWhen}.
                </p>
              </div>
            </div>
          </section>

          {/* Beweise */}
          <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Beweis-Checkliste
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {evidence.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-background p-3 rounded-lg border shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">
              Was deinen Antrag nachvollziehbarer macht
            </h2>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Zahlungsdienstleister entscheiden selten nach einem einzelnen Satz. Entscheidend
                ist, ob dein Ablauf prüfbar ist: Was wurde gekauft, wann wurde gezahlt, was ist
                konkret schiefgelaufen, wie hat der Anbieter reagiert und welche Lösung verlangst
                du?
              </p>
              <p>
                Für diese Seite ist besonders wichtig: {context.evidenceFocus}. Ergänze dazu eine
                kurze Chronologie mit Datum und Uhrzeit. So wirkt dein Antrag nicht wie ein
                austauschbarer Standardtext, sondern wie eine nachvollziehbare Fallakte.
              </p>
              <p>
                Formuliere sachlich und knapp: {context.wordingHint}. Wenn du unsicher bist, trenne
                Tatsachen von Vermutungen. Belege sollten die Tatsachen stützen; Vermutungen sollten
                als solche erkennbar bleiben.
              </p>
            </div>
          </section>

          {/* Ablauf */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">
              Schritt-für-Schritt Orientierung
            </h2>
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

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">
              Zahlungsweg und Eskalation sauber trennen
            </h2>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Der richtige nächste Schritt hängt stark davon ab, wie du bezahlt hast. PayPal,
                Klarna, Kreditkarte, Apple Pay, Google Pay oder eine direkte Händlerzahlung können
                unterschiedliche Zuständigkeiten, Fristen und Beleganforderungen haben.
              </p>
              <p>
                Für {category} gilt als praktische Reihenfolge: {context.escalationHint}. Parallel
                solltest du prüfen: {context.parallelPath}. Wichtig ist, keine widersprüchlichen
                Angaben zu machen und bereits erhaltene Teilgutschriften offen zu nennen.
              </p>
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
                <li
                  key={i}
                  className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-900 text-sm"
                >
                  {mistake}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-3">Wie diese Orientierung entsteht</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Wir strukturieren typische Anbieterregeln, Zahlungsarten, Belegarten und deine Angaben
              zu einem nachvollziehbaren Ablauf. Entscheidungen treffen Banken, PayPal, Klarna,
              Händler oder Kartennetzwerke immer im Einzelfall; ChargebackPilot liefert dafür
              unverbindliche Formulierungs- und Sortierhilfe.
            </p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Häufig gestellte Fragen (FAQ)</h2>
            <Accordion type="single" collapsible className="w-full">
              {enrichedFaq.map((f, i) => (
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
            <p className="text-muted-foreground mb-6">
              Nutze unseren Generator und erhalte unverbindliche Textentwürfe zur eigenen Prüfung.
            </p>
            <Link
              href="/vorlagen-generator?new=1"
              onClick={(e) => {
                e.preventDefault();
                handleNewCaseClick();
              }}
            >
              <Button size="lg">Kostenlosen Fall-Check starten</Button>
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
              <strong>Markenrechtlicher Hinweis:</strong> Genannte Markenbezeichnungen (wie z.B.
              PayPal, Klarna, Visa, Mastercard, American Express, Ryanair, Lieferando etc.) sind
              eingetragene Warenzeichen der jeweiligen Eigentümer. ChargebackPilot steht in
              keinerlei Verbindung, Partnerschaft oder Kooperation mit diesen Unternehmen. Die
              Nennung dient ausschließlich der Beschreibung des Anwendungsbereichs unseres
              Text-Generators.
            </p>
          </section>
        </div>
      </article>
    </MainLayout>
  );
}
