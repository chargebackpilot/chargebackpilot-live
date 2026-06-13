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

interface GuideExample {
  title: string;
  situation: string;
  usefulProof: string;
  nextMove: string;
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

function snippetAnswer(title: string, category: string, ctx: GuideContext): string {
  return `${title} ist vor allem dann relevant, wenn dein Problem zu ${category} passt, du Zahlung und Sachverhalt belegen kannst und der Anbieter keine nachvollziehbare Lösung anbietet. Der stärkste nächste Schritt ist meist: ${ctx.primaryPath}. Entscheidend sind saubere Belege, eine kurze Chronologie und die Fristen deines Zahlungsdienstleisters.`;
}

function guideExamples(category: string, title: string): GuideExample[] {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();

  if (lowerCategory.includes("paypal")) {
    return [
      {
        title: "Ware nicht erhalten, Händler verweist nur auf Versand",
        situation:
          "Du hast per PayPal gezahlt, der Händler liefert nicht oder antwortet nur mit allgemeinen Versandhinweisen.",
        usefulProof:
          "PayPal-Transaktion, Bestellbestätigung, Trackingstatus und schriftliche Händlernachricht.",
        nextMove:
          "Konflikt im PayPal-Konto eröffnen und den Sachverhalt chronologisch mit Belegen darstellen.",
      },
      {
        title: "Ware deutlich anders als beschrieben",
        situation:
          "Das gelieferte Produkt entspricht nicht der Artikelbeschreibung, etwa falsches Modell, Fälschung oder erheblicher Defekt.",
        usefulProof:
          "Artikelbeschreibung, Fotos der erhaltenen Ware, Verpackung, Chatverlauf und Zahlungsbeleg.",
        nextMove:
          "Abweichung konkret benennen und im Konfliktcenter nicht nur allgemein von schlechter Qualität sprechen.",
      },
    ];
  }

  if (
    lowerCategory.includes("kreditkarte") ||
    lowerCategory.includes("amex") ||
    lowerCategory.includes("reason")
  ) {
    return [
      {
        title: "Leistung bezahlt, aber nicht erbracht",
        situation:
          "Du hast per Karte gezahlt, der Anbieter liefert nicht, storniert nicht sauber oder reagiert nicht mehr.",
        usefulProof:
          "Kartenumsatz, Vertrag oder Buchung, Kontaktversuche, Stornierungs- oder Nichterfüllungsnachweis.",
        nextMove: "Bank oder Amex um Umsatzreklamation nach den geltenden Kartenregeln bitten.",
      },
      {
        title: "Händler sagt Erstattung zu, zahlt aber nicht",
        situation:
          "Der Händler bestätigt schriftlich eine Rückerstattung, die Gutschrift taucht aber nicht auf.",
        usefulProof:
          "Erstattungszusage, ursprünglicher Umsatz, bisherige Nachrichten und Kontoauszug ohne Gutschrift.",
        nextMove:
          "Sachlich auf die ausbleibende Gutschrift hinweisen und die Bank um Prüfung bitten.",
      },
    ];
  }

  if (lowerCategory.includes("klarna")) {
    return [
      {
        title: "Retoure wurde nicht verbucht",
        situation:
          "Du hast Ware zurückgesendet, aber die Klarna-Rechnung bleibt offen oder es kommen Mahnungen.",
        usefulProof:
          "Retourenlabel, Einlieferungsbeleg, Tracking, Bestellnummer und Händlerkommunikation.",
        nextMove:
          "Problem im Klarna-Konto melden und die Forderung mit Retourenbeleg sachlich klären.",
      },
      {
        title: "Ware fehlt, Rechnung ist aber fällig",
        situation:
          "Die Bestellung ist nicht angekommen, Klarna erwartet aber Zahlung zum Fälligkeitsdatum.",
        usefulProof: "Klarna-Rechnung, Tracking, Bestellbestätigung und Nachricht an den Händler.",
        nextMove:
          "Nicht ignorieren, sondern früh im Klarna-Konto melden und parallel den Händler kontaktieren.",
      },
    ];
  }

  if (lowerCategory.includes("flug") || lowerTitle.includes("kiwi")) {
    return [
      {
        title: "Flug wurde gestrichen, Geld kommt nicht zurück",
        situation:
          "Airline oder Vermittler bestätigt Stornierung, bietet aber nur Gutschein oder reagiert nicht weiter.",
        usefulProof:
          "Buchungscode, Stornierungsmail, Zahlungsnachweis und bisherige Erstattungsaufforderung.",
        nextMove:
          "Erstattungsweg schriftlich klären und je nach Zahlung Kreditkarte oder PayPal prüfen.",
      },
      {
        title: "Steuern und Gebühren werden gekürzt",
        situation:
          "Bei nicht genutztem Flug werden Gebühren oder Serviceentgelte abgezogen, ohne dass die Berechnung klar ist.",
        usefulProof:
          "Ticketpreis-Aufschlüsselung, AGB-Auszug, Antwort des Vermittlers und Zahlungsnachweis.",
        nextMove:
          "Nachvollziehbare Aufstellung verlangen und danach den Zahlungsweg sachlich prüfen.",
      },
    ];
  }

  if (lowerCategory.includes("lieferdienst")) {
    return [
      {
        title: "Bestellung kommt kalt, falsch oder unvollständig an",
        situation:
          "Die App zeigt Lieferung an, aber die Ware ist ungenießbar, falsch oder zentrale Artikel fehlen.",
        usefulProof: "Fotos direkt nach Lieferung, Bestellübersicht, Zeitstempel und Support-Chat.",
        nextMove: "Problem sofort in der App melden und bei Ablehnung den Zahlungsweg prüfen.",
      },
      {
        title: "Lieferung wird als zugestellt markiert, ist aber nicht da",
        situation: "Der Status springt auf zugestellt, du hast die Bestellung aber nicht erhalten.",
        usefulProof: "App-Status, Fahrerroute, Supportverlauf und Zahlungsnachweis.",
        nextMove:
          "Nicht nur neu bestellen, sondern den Fall zeitnah dokumentieren und Supportantwort sichern.",
      },
    ];
  }

  if (lowerCategory.includes("online")) {
    return [
      {
        title: "Tracking sagt zugestellt, Paket fehlt",
        situation: "Der Shop verweist auf einen Zustellscan, du hast die Ware aber nicht erhalten.",
        usefulProof:
          "Trackingverlauf, Bestellbestätigung, Nachbarschaftsnachfrage und Händlerkommunikation.",
        nextMove:
          "Händler schriftlich zur Klärung auffordern und Zahlungsdienstleister mit vollständiger Chronologie einbinden.",
      },
      {
        title: "Fake-Shop nimmt Zahlung, liefert aber nicht",
        situation: "Nach Zahlung gibt es keine echte Versandbewegung oder der Shop verschwindet.",
        usefulProof:
          "Shop-Screenshots, Impressum, Zahlungsnachweis, Bestellmail und Kontaktversuche.",
        nextMove:
          "Belege sichern und je nach Zahlung PayPal, Kreditkarte, Klarna oder Bank kontaktieren.",
      },
    ];
  }

  if (lowerCategory.includes("abo")) {
    return [
      {
        title: "Kündigung wurde ignoriert",
        situation:
          "Du hast gekündigt, aber der Anbieter bucht weiter ab oder behauptet, keine Kündigung erhalten zu haben.",
        usefulProof:
          "Kündigungs-E-Mail, Eingangsbestätigung, weitere Abbuchungen und Vertragsdaten.",
        nextMove:
          "Abbuchung schriftlich widersprechen und Zahlungsdienstleister mit Kündigungsnachweis kontaktieren.",
      },
      {
        title: "Testphase wird plötzlich kostenpflichtig",
        situation:
          "Eine Probephase oder Anmeldung führt zu wiederkehrenden Kosten, die beim Abschluss nicht klar waren.",
        usefulProof: "Screenshot der Bestellseite, Vertragsmail, Umsatz und Anbieterkommunikation.",
        nextMove:
          "Vertragsgrundlage anfordern, vorsorglich kündigen und Rückgabemöglichkeiten prüfen.",
      },
    ];
  }

  return [
    {
      title: "Unklarer Fall mit mehreren Beteiligten",
      situation:
        "Händler, Zahlungsdienstleister und Plattform verweisen aufeinander, ohne eine Lösung anzubieten.",
      usefulProof:
        "Zahlungsnachweis, Bestellnummer, bisherige Antworten und eine kurze Chronologie.",
      nextMove:
        "Zuständigkeit sortieren, Hauptforderung klar benennen und den passenden Zahlungsweg prüfen.",
    },
    {
      title: "Vorlage soll an Bank oder Händler gehen",
      situation:
        "Du brauchst keinen langen Streittext, sondern eine sachliche, prüfbare Zusammenfassung.",
      usefulProof: "Datum, Betrag, Problem, Kontaktversuch, gewünschte Lösung und Anlagenliste.",
      nextMove:
        "Vorlage an Empfänger und Zahlungsart anpassen, nicht blind als Standardtext versenden.",
    },
  ];
}

function contextualLinks(
  canonicalPath: string,
  category: string
): { href: string; label: string }[] {
  const lowerCategory = category.toLowerCase();
  const links = [
    { href: "/vergleich/paypal-vs-kreditkarte-vs-klarna", label: "Käuferschutz-Vergleich" },
  ];

  if (lowerCategory.includes("paypal")) {
    links.push(
      { href: "/paypal-kaeuferschutz-vorlage", label: "PayPal Käuferschutz Vorlage" },
      { href: "/ware-nicht-erhalten", label: "Ware nicht erhalten" }
    );
  } else if (
    lowerCategory.includes("kreditkarte") ||
    lowerCategory.includes("amex") ||
    lowerCategory.includes("reason")
  ) {
    links.push(
      { href: "/chargeback-antrag-vorlage", label: "Chargeback Antrag Vorlage" },
      { href: "/visa-reason-code-13-1", label: "Visa Reason Code 13.1" },
      { href: "/mastercard-chargeback-reason-code", label: "Mastercard Reason Codes" }
    );
  } else if (lowerCategory.includes("klarna")) {
    links.push(
      { href: "/klarna-reklamation-vorlage", label: "Klarna Reklamation Vorlage" },
      { href: "/ware-nicht-erhalten-musterbrief", label: "Ware nicht erhalten Musterbrief" }
    );
  } else if (lowerCategory.includes("flug")) {
    links.push(
      { href: "/flug-chargeback", label: "Flug Chargeback" },
      { href: "/kiwi-rueckerstattung", label: "Kiwi.com Erstattung" },
      { href: "/chargeback-antrag-vorlage", label: "Chargeback Antrag Vorlage" }
    );
  } else if (lowerCategory.includes("lieferdienst")) {
    links.push(
      { href: "/lieferando-rueckerstattung", label: "Lieferando Rückerstattung" },
      { href: "/wolt-rueckerstattung", label: "Wolt Erstattung" },
      { href: "/ubereats-rueckerstattung", label: "Uber Eats Erstattung" }
    );
  } else if (lowerCategory.includes("online")) {
    links.push(
      { href: "/ware-nicht-erhalten-musterbrief", label: "Ware nicht erhalten Musterbrief" },
      { href: "/scam-shops-2026", label: "Fake-Shops erkennen" },
      { href: "/paypal-chargeback", label: "PayPal Käuferschutz" }
    );
  } else if (lowerCategory.includes("abo")) {
    links.push(
      { href: "/abo-falle-musterbrief", label: "Abo-Falle Musterbrief" },
      { href: "/visa-mastercard-chargeback", label: "Kreditkarten-Chargeback" }
    );
  } else {
    links.push(
      { href: "/chargeback-antrag-vorlage", label: "Chargeback Antrag Vorlage" },
      { href: "/ware-nicht-erhalten", label: "Ware nicht erhalten" }
    );
  }

  return links.filter((link, index, all) => {
    if (link.href === canonicalPath) return false;
    return all.findIndex((other) => other.href === link.href) === index;
  });
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
  const examples = guideExamples(category, title);
  const inlineLinks = contextualLinks(canonicalPath, category);
  const shortAnswer = snippetAnswer(title, category, context);

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
          <section className="rounded-2xl border bg-slate-50 p-6 shadow-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
              Kurzantwort
            </p>
            <p className="text-base leading-relaxed text-foreground/90">{shortAnswer}</p>
          </section>

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

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">
              Typische Konstellationen aus der Praxis
            </h2>
            <div className="grid gap-4">
              {examples.map((example) => (
                <div key={example.title} className="rounded-xl border bg-background p-5">
                  <h3 className="mb-2 font-bold">{example.title}</h3>
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {example.situation}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                        Hilfreiche Belege
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {example.usefulProof}
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/5 p-3">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">
                        Nächster Schritt
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {example.nextMove}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Zuletzt redaktionell geprüft: {DISPLAY_UPDATED_AT}. Mehr zur Arbeitsweise findest du
              in unserer{" "}
              <Link
                href="/methodik"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Methodik
              </Link>
              .
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

          <section className="rounded-2xl border p-6">
            <h2 className="mb-3 text-lg font-bold">Passende Vertiefungen</h2>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Wenn dein Fall in eine andere Richtung kippt, helfen diese ergänzenden Guides beim
              Sortieren des richtigen Zahlungswegs.
            </p>
            <div className="flex flex-wrap gap-2">
              {inlineLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary"
                >
                  {link.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
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
