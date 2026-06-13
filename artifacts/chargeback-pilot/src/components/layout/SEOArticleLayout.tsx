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
  Sparkles,
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
import { getRouteMeta } from "@/seo-routes";

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

interface EditorialInsight {
  title: string;
  paragraphs: string[];
  checkpoints: string[];
}

interface GlossaryItem {
  term: string;
  definition: string;
}

interface WordingPreview {
  title: string;
  intro: string;
  lines: string[];
  note: string;
}

interface MoneyPageProfile {
  primaryKeyword: string;
  headline: string;
  metaDescription: string;
  intent: string;
  immediateAnswer: string;
  proofPriority: string[];
  decisionSignals: string[];
  nextAction: string;
  avoid: string;
  keywords: string[];
  nextLinks: { href: string; label: string }[];
}

const SITE = "https://chargebackpilot.de";
const DISPLAY_UPDATED_AT = "11. Juni 2026";
const SCHEMA_UPDATED_AT = "2026-06-11";

const MONEY_PAGE_PROFILES: Record<string, MoneyPageProfile> = {
  "/chargeback-antrag-vorlage": {
    primaryKeyword: "Chargeback Antrag Vorlage",
    headline: "Chargeback Antrag Vorlage: was diese Seite sofort klärt",
    metaDescription:
      "Chargeback Antrag Vorlage für Bank und Kreditkarte: Sachverhalt, Belege, Händlerkontakt und Umsatzreklamation strukturiert vorbereiten.",
    intent:
      "Du suchst vermutlich keinen langen Ratgeber, sondern einen prüfbaren Aufbau für deine Bank: Was ist passiert, welcher Kartenumsatz ist betroffen und welche Belege zeigen die Nichterfüllung?",
    immediateAnswer:
      "Der stärkste Einstieg ist eine kurze Umsatzreklamation mit Datum, Betrag, Händlername, Problemtyp, Kontaktversuch und Anlagenliste.",
    proofPriority: [
      "Kartenumsatz mit Datum, Betrag und Händlername",
      "Bestell- oder Buchungsbestätigung",
      "Nachweis zum Problem, z. B. Tracking, Stornierung, Fotos oder Erstattungszusage",
    ],
    decisionSignals: [
      "Du hast mit Visa, Mastercard oder Amex gezahlt.",
      "Der Händler reagiert nicht oder verweigert eine nachvollziehbare Lösung.",
      "Du willst keinen Rechtsstreit beginnen, sondern eine bankinterne Prüfung anstoßen.",
    ],
    nextAction:
      "Sortiere zuerst Belege und Chronologie, dann bereite den Antrag als sachliche Umsatzreklamation vor.",
    avoid:
      "Vermeide harte Rechtsbehauptungen oder interne Reason Codes als Garantie. Banken ordnen den Fall selbst ein.",
    keywords: [
      "chargeback antrag vorlage",
      "kreditkarten chargeback muster",
      "umsatzreklamation vorlage",
      "chargeback bank anschreiben",
    ],
    nextLinks: [
      { href: "/visa-mastercard-chargeback", label: "Visa & Mastercard Ablauf" },
      { href: "/visa-reason-code-13-1", label: "Visa 13.1 einordnen" },
      { href: "/ware-nicht-erhalten-musterbrief", label: "Ware fehlt Musterbrief" },
    ],
  },
  "/paypal-kaeuferschutz-vorlage": {
    primaryKeyword: "PayPal Käuferschutz Vorlage",
    headline: "PayPal Käuferschutz Vorlage: schnell zum passenden Textaufbau",
    metaDescription:
      "PayPal Käuferschutz Vorlage: Konflikt sachlich formulieren, Belege ordnen und Eskalation im PayPal-Konto nachvollziehbar vorbereiten.",
    intent:
      "Du möchtest im PayPal-Konfliktcenter klar erklären, warum Ware fehlt oder deutlich abweicht, ohne dich in langen Beschwerdetexten zu verlieren.",
    immediateAnswer:
      "Nenne Transaktion, Artikel, Problem, bisherigen Händlerkontakt und gewünschte Lösung in genau dieser Reihenfolge.",
    proofPriority: [
      "PayPal-Transaktionsnummer und Zahlungsdatum",
      "Artikelbeschreibung, Bestellbestätigung und Händlerchat",
      "Tracking, Fotos oder sonstiger Nachweis zur Abweichung",
    ],
    decisionSignals: [
      "Die Zahlung lief als käuferschutzfähige PayPal-Zahlung.",
      "Der Händler hat nicht geliefert oder die Ware weicht erheblich ab.",
      "Die Eskalationsfrist im PayPal-Konto ist noch nicht abgelaufen.",
    ],
    nextAction:
      "Eröffne den Konflikt im PayPal-Konto und nutze eine knappe Chronologie statt pauschaler Vorwürfe.",
    avoid:
      "Freunde-und-Familie-Zahlungen und normale Händlerbeschwerden solltest du nicht wie Käuferschutzfälle darstellen.",
    keywords: [
      "paypal käuferschutz vorlage",
      "paypal konflikt text",
      "paypal käuferschutz formulierung",
      "paypal fall eskalieren vorlage",
    ],
    nextLinks: [
      { href: "/paypal-chargeback", label: "PayPal Käuferschutz Ablauf" },
      { href: "/ware-nicht-erhalten", label: "Ware nicht erhalten" },
      { href: "/vergleich/paypal-vs-kreditkarte-vs-klarna", label: "Zahlungswege vergleichen" },
    ],
  },
  "/klarna-reklamation-vorlage": {
    primaryKeyword: "Klarna Reklamation Vorlage",
    headline: "Klarna Reklamation Vorlage: Forderung und Problem sauber trennen",
    metaDescription:
      "Klarna Reklamation Vorlage: Problem im Klarna-Konto melden, Rechnung oder Retoure klären und Händlerkommunikation strukturiert dokumentieren.",
    intent:
      "Du willst verhindern, dass eine strittige Rechnung ungeprüft weiterläuft, und brauchst dafür eine klare Meldung an Klarna und den Händler.",
    immediateAnswer:
      "Benenne Rechnungsnummer, Bestellung, Problemgrund, Beleglage und gewünschten Status der Forderung.",
    proofPriority: [
      "Klarna-Rechnungsnummer und Bestellnummer",
      "Retourenbeleg, Tracking oder Fotos der mangelhaften Ware",
      "Nachricht an den Händler und Antwortstand",
    ],
    decisionSignals: [
      "Eine Klarna-Rechnung ist offen oder es droht Mahnprozess.",
      "Ware wurde nicht geliefert, falsch geliefert oder retourniert.",
      "Du kannst Belege der Retoure oder des Lieferproblems vorlegen.",
    ],
    nextAction:
      "Melde das Problem im Klarna-Konto und kontaktiere den Händler parallel mit denselben Belegen.",
    avoid:
      "Ignoriere die Rechnung nicht. Ohne offizielle Problemmeldung wirkt der Fall später schwächer.",
    keywords: [
      "klarna reklamation vorlage",
      "klarna problem melden text",
      "klarna rechnung pausieren",
      "klarna retoure nicht verbucht",
    ],
    nextLinks: [
      { href: "/klarna-reklamation", label: "Klarna Ablauf" },
      { href: "/ware-nicht-erhalten-musterbrief", label: "Ware fehlt Musterbrief" },
      { href: "/vergleich/paypal-vs-kreditkarte-vs-klarna", label: "Käuferschutz vergleichen" },
    ],
  },
  "/ware-nicht-erhalten-musterbrief": {
    primaryKeyword: "Ware nicht erhalten Musterbrief",
    headline: "Ware nicht erhalten Musterbrief: Händler, PayPal oder Bank richtig adressieren",
    metaDescription:
      "Ware nicht erhalten Musterbrief: Händlerkontakt, Tracking, Zahlungsnachweis und Käuferschutz oder Chargeback strukturiert vorbereiten.",
    intent:
      "Du brauchst einen sachlichen Text, weil ein Paket fehlt, nur angeblich zugestellt wurde oder der Händler dich an den Versanddienstleister verweist.",
    immediateAnswer:
      "Der Musterbrief sollte Bestellnummer, Lieferstatus, Zahlungsweg, bisherigen Kontakt und die gewünschte Klärung enthalten.",
    proofPriority: [
      "Bestellbestätigung und Zahlungsnachweis",
      "Trackingverlauf inklusive Zustellstatus",
      "Screenshots der Händlerantwort oder fehlenden Rückmeldung",
    ],
    decisionSignals: [
      "Die Ware ist nicht angekommen oder wurde nur angeblich zugestellt.",
      "Der Händler bietet keine nachvollziehbare Lösung an.",
      "Du willst den Fall später bei PayPal, Klarna oder Bank belegen können.",
    ],
    nextAction:
      "Fordere zuerst den Händler schriftlich zur Klärung auf und sichere danach die Fristen beim Zahlungsdienstleister.",
    avoid: "Reklamiere nicht nur beim Paketdienst, wenn der Händler dein Vertragspartner ist.",
    keywords: [
      "ware nicht erhalten musterbrief",
      "paket nicht angekommen vorlage",
      "händler liefert nicht anschreiben",
      "nicht gelieferte ware käuferschutz",
    ],
    nextLinks: [
      { href: "/ware-nicht-erhalten", label: "Chargeback bei Ware fehlt" },
      { href: "/paypal-kaeuferschutz-vorlage", label: "PayPal Text" },
      { href: "/chargeback-antrag-vorlage", label: "Bank-Antrag" },
    ],
  },
  "/visa-mastercard-chargeback": {
    primaryKeyword: "Visa Mastercard Chargeback",
    headline: "Visa & Mastercard Chargeback: wann der Kartenweg sinnvoll ist",
    metaDescription:
      "Visa und Mastercard Chargeback vorbereiten: Kartenumsatz, Händlerkontakt, Reason-Code-Einordnung und Belege für die Bank strukturieren.",
    intent:
      "Du willst wissen, ob eine Kreditkartenreklamation bei deiner Bank der richtige Weg ist und wie du sie nachvollziehbar vorbereitest.",
    immediateAnswer:
      "Relevant ist meist eine klare Umsatzreklamation über die kartenausgebende Bank, nicht eine direkte Nachricht an Visa oder Mastercard.",
    proofPriority: [
      "Kartenumsatz, Händlername und Zahlungsdatum",
      "Nachweis der nicht erbrachten Leistung oder nicht erhaltenen Ware",
      "Schriftlicher Händlerkontakt oder Erstattungszusage",
    ],
    decisionSignals: [
      "Du hast direkt oder indirekt mit Kreditkarte gezahlt.",
      "PayPal oder Klarna sind nicht der bessere primäre Konfliktweg.",
      "Du kannst belegen, warum die Belastung geprüft werden soll.",
    ],
    nextAction:
      "Bitte deine Bank schriftlich um Prüfung nach den geltenden Kartenregeln und hänge die Belege geordnet an.",
    avoid:
      "Visa oder Mastercard selbst sind für Verbraucher meist nicht der erste Ansprechpartner; zuständig ist die kartenausgebende Bank.",
    keywords: [
      "visa mastercard chargeback",
      "kreditkarten chargeback",
      "umsatzreklamation kreditkarte",
      "chargeback kreditkarte frist",
    ],
    nextLinks: [
      { href: "/chargeback-antrag-vorlage", label: "Antrag vorbereiten" },
      { href: "/visa-reason-code-13-1", label: "Visa 13.1" },
      { href: "/mastercard-chargeback-reason-code", label: "Mastercard Codes" },
    ],
  },
  "/paypal-chargeback": {
    primaryKeyword: "PayPal Chargeback",
    headline: "PayPal Chargeback oder Käuferschutz: den richtigen Begriff wählen",
    metaDescription:
      "PayPal Chargeback und Käuferschutz verständlich erklärt: Konfliktcenter, Eskalation, Belege und mögliche Kreditkartenwege sauber unterscheiden.",
    intent:
      "Du suchst nach PayPal Chargeback, meinst aber häufig den PayPal-Käuferschutz oder eine Reklamation über die hinterlegte Karte.",
    immediateAnswer:
      "Starte in der Regel im PayPal-Konfliktcenter; prüfe den Kartenweg nur, wenn PayPal nicht der passende oder abschließende Kanal ist.",
    proofPriority: [
      "PayPal-Transaktion und Zahlungsquelle",
      "Bestelldaten, Tracking und Artikelbeschreibung",
      "Händlerkontakt und Stand des PayPal-Konflikts",
    ],
    decisionSignals: [
      "Du hast mit PayPal gezahlt und Ware fehlt oder weicht erheblich ab.",
      "Du willst Konfliktcenter, Eskalation und Kartenweg nicht vermischen.",
      "Du kannst Fristen und Belege im PayPal-Konto prüfen.",
    ],
    nextAction:
      "Dokumentiere den PayPal-Konflikt sauber und entscheide erst danach, ob ein weiterer Zahlungsweg überhaupt sinnvoll ist.",
    avoid: "Nutze nicht gleichzeitig widersprüchliche Begründungen bei PayPal und Bank.",
    keywords: [
      "paypal chargeback",
      "paypal käuferschutz",
      "paypal konfliktcenter",
      "paypal fall eskalieren",
    ],
    nextLinks: [
      { href: "/paypal-kaeuferschutz-vorlage", label: "PayPal Vorlage" },
      { href: "/vergleich/paypal-vs-kreditkarte-vs-klarna", label: "PayPal vs. Kreditkarte" },
      { href: "/ware-nicht-erhalten", label: "Ware fehlt" },
    ],
  },
  "/lieferando-rueckerstattung": {
    primaryKeyword: "Lieferando Rückerstattung",
    headline: "Lieferando Rückerstattung: schnell dokumentieren, bevor Belege schwach werden",
    metaDescription:
      "Lieferando Rückerstattung bei kaltem, falschem oder fehlendem Essen: Fotos, Zeitstempel, Supportverlauf und Zahlungsweg strukturiert vorbereiten.",
    intent:
      "Du möchtest wissen, wie du kaltes, falsches oder fehlendes Essen so dokumentierst, dass Support oder Zahlungsdienstleister den Fall prüfen können.",
    immediateAnswer:
      "Mache sofort Fotos, sichere Bestellstatus und Support-Chat und formuliere konkret, welche Position betroffen ist.",
    proofPriority: [
      "Fotos unmittelbar nach Lieferung",
      "Bestellübersicht mit Uhrzeit und Preis",
      "Supportverlauf in App oder E-Mail",
    ],
    decisionSignals: [
      "Die Lieferung kam falsch, unvollständig, kalt oder gar nicht an.",
      "Der Support bietet nur Guthaben oder lehnt pauschal ab.",
      "Du willst den Zahlungsweg zusätzlich nachvollziehbar prüfen.",
    ],
    nextAction:
      "Melde den Fall zuerst bei Lieferando und prüfe bei Ablehnung den genutzten Zahlungsweg.",
    avoid:
      "Warte nicht bis zum nächsten Tag und entsorge Belege nicht, bevor du Fotos gemacht hast.",
    keywords: [
      "lieferando rückerstattung",
      "lieferando essen kalt",
      "lieferando falsche lieferung",
      "lieferando chargeback",
    ],
    nextLinks: [
      { href: "/wolt-rueckerstattung", label: "Wolt Vergleich" },
      { href: "/ubereats-rueckerstattung", label: "Uber Eats" },
      { href: "/paypal-kaeuferschutz-vorlage", label: "PayPal Text" },
    ],
  },
  "/kiwi-rueckerstattung": {
    primaryKeyword: "Kiwi.com Rückerstattung",
    headline: "Kiwi.com Rückerstattung: Steuern, Gebühren und Zahlungsweg trennen",
    metaDescription:
      "Kiwi.com Rückerstattung prüfen: Steuern, Gebühren, Serviceentgelt, Gutschein und Kreditkartenreklamation sauber auseinanderhalten.",
    intent:
      "Du willst verstehen, welche Beträge bei Kiwi.com noch offen sein könnten und wie du Gebührenabzüge nachvollziehbar hinterfragst.",
    immediateAnswer:
      "Stelle zuerst die Zahlung, Ticketbestandteile, Stornierung und bereits angebotene Erstattung nebeneinander.",
    proofPriority: [
      "Kiwi.com-Buchungsbestätigung und Zahlungsbeleg",
      "Stornierungs- oder No-Show-Nachweis",
      "Aufschlüsselung von Steuern, Gebühren, Gutschein und Serviceentgelt",
    ],
    decisionSignals: [
      "Kiwi.com behält eine Gebühr ein oder zahlt nur einen Restbetrag aus.",
      "Du willst keine pauschale Forderung, sondern eine nachvollziehbare Aufstellung.",
      "Du hast per Karte oder PayPal gezahlt und willst den Zahlungsweg prüfen.",
    ],
    nextAction:
      "Fordere eine transparente Aufstellung an und prüfe danach den passenden Zahlungsdienstleister.",
    avoid:
      "Vermische nicht Ticketpreis, Steuern, Gebühren, Serviceentgelt und Gutschein in einer einzigen Forderung.",
    keywords: [
      "kiwi rückerstattung",
      "kiwi steuern gebühren",
      "kiwi.com erstattung",
      "kiwi chargeback",
    ],
    nextLinks: [
      { href: "/flug-chargeback", label: "Flug Chargeback" },
      { href: "/chargeback-antrag-vorlage", label: "Bank-Antrag" },
      { href: "/visa-mastercard-chargeback", label: "Kreditkarte" },
    ],
  },
};

function textContainsAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

function moneyPageProfile(canonicalPath: string): MoneyPageProfile | null {
  return MONEY_PAGE_PROFILES[canonicalPath] ?? null;
}

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

function editorialInsight(title: string, category: string, ctx: GuideContext): EditorialInsight {
  const lower = `${title} ${category}`.toLowerCase();

  if (textContainsAny(lower, ["paypal"])) {
    return {
      title: "Worauf PayPal bei der Fallbeschreibung typischerweise achtet",
      paragraphs: [
        "Bei PayPal ist oft nicht die längste Beschwerde entscheidend, sondern eine klare Zuordnung: Ging es um nicht erhaltene Ware, deutlich abweichende Ware oder ein anderes Zahlungsproblem? Je sauberer du Transaktion, Artikel und bisherigen Händlerkontakt trennst, desto leichter lässt sich der Fall im Konfliktcenter nachvollziehen.",
        "Praktisch wichtig ist auch die Eskalationslogik. Ein eröffneter Konflikt ist noch nicht dasselbe wie ein Käuferschutzantrag. Prüfe deshalb im Konto, welche Schritte PayPal konkret anzeigt und welche Frist für die Eskalation läuft.",
      ],
      checkpoints: [
        "Transaktionsnummer, Zahlungsdatum und Händlername stimmen mit der Bestellung überein.",
        "Der konkrete Mangel ist mit Fotos, Tracking oder Chatverlauf belegbar.",
        "Die gewünschte Lösung ist eindeutig: Lieferung, Ersatz, Teilbetrag oder Erstattung.",
      ],
    };
  }

  if (textContainsAny(lower, ["klarna"])) {
    return {
      title: "Warum bei Klarna Forderung und Lieferproblem getrennt werden sollten",
      paragraphs: [
        "Klarna-Fälle werden schnell unübersichtlich, weil Lieferproblem, Rechnung, Mahnung und Händlerantwort parallel laufen können. Für eine starke Darstellung solltest du deshalb nicht nur schreiben, dass etwas falsch ist, sondern zeigen, welche Rechnung betroffen ist und warum die Forderung aus deiner Sicht gerade nicht ungeprüft weiterlaufen sollte.",
        "Wenn Ware fehlt, retourniert wurde oder falsch geliefert wurde, hilft eine knappe Chronologie: Bestellung, Lieferstatus, Retoure oder Mangel, Meldung an Händler, Meldung in Klarna. Dadurch ist klarer, ob es um eine Zahlungspause, eine Korrektur der Forderung oder eine Prüfung durch den Händler geht.",
      ],
      checkpoints: [
        "Rechnungsnummer und Bestellnummer sind eindeutig genannt.",
        "Retouren- oder Lieferbelege sind dem richtigen Artikel zugeordnet.",
        "Du hast das Problem nicht nur beim Händler, sondern auch im Klarna-Konto sichtbar gemacht.",
      ],
    };
  }

  if (textContainsAny(lower, ["lieferdienst", "lieferando", "wolt", "uber eats", "essen"])) {
    return {
      title: "Warum bei Lieferdiensten die ersten Minuten zählen",
      paragraphs: [
        "Bei Essenslieferungen ist der Beweiswert oft zeitabhängig. Ein Foto direkt nach Übergabe, ein Screenshot der Bestellübersicht und der Support-Chat aus der App sind deutlich hilfreicher als eine allgemeine Beschwerde am nächsten Tag.",
        "Unterscheide außerdem zwischen falsch geliefert, unvollständig geliefert, gar nicht geliefert und qualitativ mangelhaft. Je konkreter du die Abweichung beschreibst, desto weniger wirkt der Antrag wie eine pauschale Unzufriedenheit.",
      ],
      checkpoints: [
        "Fotos zeigen Zustand, fehlende Artikel oder falsche Lieferung unmittelbar nach Erhalt.",
        "Der Supportverlauf enthält Datum, Uhrzeit und Antwort der Plattform.",
        "Der Zahlungsweg ist klar: App-Guthaben, Karte, PayPal, Apple Pay, Google Pay oder Klarna.",
      ],
    };
  }

  if (textContainsAny(lower, ["flug", "reise", "kiwi", "ryanair"])) {
    return {
      title: "Warum Reise-Fälle eine saubere Betragsaufteilung brauchen",
      paragraphs: [
        "Bei Flügen und Reisebuchungen ist der strittige Betrag häufig nicht nur ein einzelner Ticketpreis. Vermittlungsgebühren, Serviceentgelte, Steuern, Flughafengebühren, Gutscheine und Teilgutschriften können durcheinanderlaufen.",
        "Eine nachvollziehbare Aufstellung ist deshalb wichtiger als eine harte Behauptung. Zeige, was ursprünglich gezahlt wurde, welche Leistung weggefallen ist, was bereits angeboten oder erstattet wurde und welcher Restbetrag noch offen ist.",
      ],
      checkpoints: [
        "Buchungscode, Ticketnummer und Zahlungsbeleg sind vorhanden.",
        "Stornierung, Umbuchung oder Nichtbeförderung sind schriftlich dokumentiert.",
        "Gutscheine, Teilgutschriften und Gebührenabzüge werden offen genannt.",
      ],
    };
  }

  if (textContainsAny(lower, ["abo", "abonnement", "abbuchung", "ungewollt"])) {
    return {
      title: "Warum Abo-Fälle nicht nur über die Karte gelöst werden sollten",
      paragraphs: [
        "Bei ungewollten Abbuchungen reicht es oft nicht, nur den Zahlungsweg zu sperren oder eine einzelne Zahlung zu reklamieren. Wenn ein Anbieter sich auf ein laufendes Vertragsverhältnis beruft, brauchst du zusätzlich eine klare Nachricht zur Vertragsgrundlage, Kündigung oder zum Widerspruch.",
        "Sauber ist eine zweigleisige Struktur: gegenüber dem Anbieter klärst du Vertrag, Kündigung und weitere Forderungen; gegenüber Bank, Karte oder PayPal erklärst du die konkrete Zahlung und warum sie geprüft werden soll.",
      ],
      checkpoints: [
        "Du kannst zeigen, ob und wann du zugestimmt oder gekündigt hast.",
        "Weitere Abbuchungen sind mit Datum, Betrag und Empfänger sortiert.",
        "Die Nachricht enthält keine vorschnellen Betrugsvorwürfe, sondern bestreitet konkret Autorisierung oder Vertragsgrundlage.",
      ],
    };
  }

  if (textContainsAny(lower, ["online-shopping", "ware nicht erhalten", "fake-shop"])) {
    return {
      title: "Warum Tracking allein den Fall selten vollständig erklärt",
      paragraphs: [
        "Bei nicht erhaltener Ware reicht ein einzelner Zustellstatus oft nicht aus. Entscheidend ist, ob Tracking, Bestellbestätigung, Lieferadresse, Händlerantwort und tatsächlicher Empfang zusammenpassen.",
        "Besonders bei Fake-Shop-Verdacht solltest du zusätzlich die Shop-Seite sichern: Impressum, Produktseite, Bestellmail, Zahlungsdaten und Kontaktversuche. Diese Belege zeigen nicht nur, dass Ware fehlt, sondern auch, warum der Zahlungsdienstleister den Vorgang prüfen sollte.",
      ],
      checkpoints: [
        "Trackingverlauf und Bestelladresse sind vollständig gesichert.",
        "Händlerantworten oder fehlende Antworten sind mit Datum dokumentiert.",
        "Bei Fake-Shop-Verdacht liegen Screenshots von Shop, Impressum und Produktseite vor.",
      ],
    };
  }

  if (
    textContainsAny(lower, [
      "kreditkarte",
      "chargeback",
      "amex",
      "visa",
      "mastercard",
      "reason code",
    ])
  ) {
    return {
      title: "Warum Banken eine prüfbare Umsatzreklamation brauchen",
      paragraphs: [
        "Bei Kreditkartenfällen geht es nicht darum, möglichst viele juristische Begriffe zu verwenden. Banken brauchen eine belastbare Verbindung zwischen Kartenumsatz, Bestellung oder Buchung und dem konkreten Problem.",
        "Reason Codes können bei der Einordnung helfen, sind für Verbraucher aber keine Erfolgsgarantie. Formuliere deshalb den Sachverhalt zuerst normal verständlich und überlasse die endgültige interne Kategorie der Bank oder dem Kartenausgeber.",
      ],
      checkpoints: [
        "Kartenumsatz, Händlername, Datum und Betrag sind eindeutig genannt.",
        "Nichterfüllung, Falschlieferung, Stornierung oder Erstattungszusage sind belegt.",
        "Der vorherige Kontaktversuch beim Händler ist nachvollziehbar dokumentiert.",
      ],
    };
  }

  if (textContainsAny(lower, ["musterbrief", "vorlage"])) {
    return {
      title: "Warum ein guter Musterbrief immer konkret angepasst werden muss",
      paragraphs: [
        "Ein Musterbrief ist nur dann stark, wenn er nicht wie ein kopierter Standardtext wirkt. Zahlungsdienstleister und Händler müssen erkennen können, welcher Vorgang betroffen ist und welche Belege deine Darstellung stützen.",
        "Nutze Vorlagen deshalb als Struktur: Betreff, kurzer Ablauf, konkrete Forderung, Anlagenliste und Frist. Die entscheidenden Details müssen aus deinem Fall kommen.",
      ],
      checkpoints: [
        "Betreff, Betrag, Datum und Bestellnummer sind konkret ausgefüllt.",
        "Die Forderung ist klar: Erstattung, Prüfung, Korrektur oder Zahlungspause.",
        "Die Anlagenliste passt wirklich zu den erwähnten Tatsachen.",
      ],
    };
  }

  return {
    title: "Warum Struktur wichtiger ist als ein langer Beschwerdetext",
    paragraphs: [
      "Viele Fälle scheitern nicht an fehlender Empörung, sondern an fehlender Ordnung. Wer Zahlung, Problem, Kontaktversuch und gewünschte Lösung sauber trennt, macht es dem zuständigen Anbieter leichter, den Vorgang zu prüfen.",
      `Für diesen Ratgeber ist der sinnvollste Ausgangspunkt: ${ctx.primaryPath}. Danach kommt es darauf an, Belege vollständig und widerspruchsfrei vorzulegen.`,
    ],
    checkpoints: [
      "Der Zahlungsweg ist eindeutig geklärt.",
      "Die wichtigsten Belege sind vor der Eskalation gesichert.",
      "Die Forderung ist konkret und nicht nur allgemein formuliert.",
    ],
  };
}

function glossaryForGuide(title: string, category: string): GlossaryItem[] {
  const lower = `${title} ${category}`.toLowerCase();

  if (textContainsAny(lower, ["paypal"])) {
    return [
      {
        term: "Konflikt",
        definition:
          "Erste Problemmeldung im PayPal-Konto. Sie dient der Klärung mit dem Händler und ist noch nicht automatisch eine Entscheidung durch PayPal.",
      },
      {
        term: "Eskalation",
        definition:
          "Schritt, mit dem PayPal stärker in die Prüfung einbezogen wird. Die konkrete Frist steht im jeweiligen Fall im PayPal-Konto.",
      },
      {
        term: "Nicht erhalten",
        definition:
          "Fallgruppe, bei der du Zahlung und Bestellung belegen kannst, aber keine Ware oder Leistung erhalten hast.",
      },
      {
        term: "Deutlich abweichend",
        definition:
          "Fallgruppe, bei der gelieferte Ware wesentlich von Beschreibung, Zustand oder zugesicherter Eigenschaft abweicht.",
      },
    ];
  }

  if (textContainsAny(lower, ["klarna"])) {
    return [
      {
        term: "Zahlung pausieren",
        definition:
          "Möglicher Schritt im Klarna-Konto, damit eine strittige Rechnung nicht ungeprüft weiterläuft. Ob und wie das geht, zeigt Klarna im Einzelfall.",
      },
      {
        term: "Forderung",
        definition:
          "Der Betrag, den Klarna oder der Händler verlangt. Bei Reklamationen sollte klar sein, welche Rechnung oder Rate betroffen ist.",
      },
      {
        term: "Retoure",
        definition:
          "Rücksendung an den Händler. Wichtig sind Einlieferungsbeleg, Tracking und Zuordnung zur richtigen Bestellung.",
      },
      {
        term: "Händlerklärung",
        definition:
          "Kommunikation mit dem Shop, weil Klarna viele Sachverhalte nur mit Händlerdaten abschließend prüfen kann.",
      },
    ];
  }

  if (textContainsAny(lower, ["lieferdienst", "lieferando", "wolt", "uber eats", "essen"])) {
    return [
      {
        term: "Support-Ticket",
        definition:
          "Nachricht oder Vorgang in der Liefer-App. Sichere Screenshots, weil spätere Ansichten nicht immer den ursprünglichen Ablauf zeigen.",
      },
      {
        term: "Zeitstempel",
        definition:
          "Uhrzeit von Bestellung, Lieferung, Foto und Supportmeldung. Bei Essen kann diese Reihenfolge entscheidend sein.",
      },
      {
        term: "Teilbetrag",
        definition:
          "Manchmal geht es nicht um die ganze Bestellung, sondern um fehlende Artikel, falsche Positionen oder Liefergebühren.",
      },
      {
        term: "App-Guthaben",
        definition:
          "Von Plattformen angebotene Kulanzlösung. Prüfe, ob du stattdessen eine Erstattung auf den ursprünglichen Zahlungsweg verlangst.",
      },
    ];
  }

  if (textContainsAny(lower, ["flug", "reise", "kiwi", "ryanair"])) {
    return [
      {
        term: "Annullierung",
        definition:
          "Streichung des Fluges durch Airline oder Anbieter. Sichere die Benachrichtigung und jede angebotene Ersatzlösung.",
      },
      {
        term: "Vermittler",
        definition:
          "Plattform, über die gebucht wurde. Bei Reiseportalen muss oft geklärt werden, wer Zahlung erhalten und wer Leistung geschuldet hat.",
      },
      {
        term: "Steuern und Gebühren",
        definition:
          "Betragsbestandteile eines Tickets, die bei nicht genutzten Flügen gesondert diskutiert werden können.",
      },
      {
        term: "Gutschein",
        definition:
          "Alternative zur Auszahlung. Dokumentiere, ob du ihn verlangt, angenommen oder nur angeboten bekommen hast.",
      },
    ];
  }

  if (textContainsAny(lower, ["abo", "abonnement", "abbuchung", "ungewollt"])) {
    return [
      {
        term: "Autorisierung",
        definition:
          "Nachweisbare Zustimmung zur Zahlung oder zum Vertrag. Bei Streitfällen ist wichtig, was beim Abschluss sichtbar war.",
      },
      {
        term: "Kündigungsnachweis",
        definition:
          "E-Mail, Formularbestätigung oder Einschreiben, das zeigt, wann und gegenüber wem du gekündigt hast.",
      },
      {
        term: "Wiederkehrende Zahlung",
        definition:
          "Regelmäßige Abbuchung. Prüfe jede Abbuchung einzeln und dokumentiere Betrag, Datum und Empfänger.",
      },
      {
        term: "Einzugsermächtigung",
        definition:
          "Erlaubnis für Abbuchungen, etwa per Lastschrift oder über einen Zahlungsdienstleister. Der Widerruf ersetzt nicht automatisch jede Vertragsklärung.",
      },
    ];
  }

  if (textContainsAny(lower, ["online-shopping", "ware nicht erhalten", "fake-shop"])) {
    return [
      {
        term: "Tracking",
        definition:
          "Sendungsverlauf des Paketdienstes. Ein Zustellscan sollte mit Adresse, Zeit und tatsächlichem Empfang abgeglichen werden.",
      },
      {
        term: "Zustellnachweis",
        definition:
          "Angabe, die zeigen soll, dass Ware übergeben wurde. Frage nach Details, wenn der Nachweis nicht zu deinem Ablauf passt.",
      },
      {
        term: "Fake-Shop",
        definition:
          "Shop mit Verdachtsmerkmalen wie fehlendem Impressum, kopierten Produktbildern, unrealistischen Preisen oder verschwundener Kontaktmöglichkeit.",
      },
      {
        term: "Händlerkontakt",
        definition:
          "Nachweisbare Anfrage an den Shop. Eine kurze, sachliche Fristsetzung kann für spätere Prüfungen hilfreich sein.",
      },
    ];
  }

  return [
    {
      term: "Chargeback",
      definition:
        "Umsatzreklamation über Kartenausgeber oder Bank. Ob sie möglich ist, hängt von Kartenregeln, Zahlungsweg und Belegen ab.",
    },
    {
      term: "Reason Code",
      definition:
        "Interne Fallkategorie im Kartensystem. Verbraucher sollten den Sachverhalt sauber erklären; die genaue Zuordnung nimmt die Bank vor.",
    },
    {
      term: "Anlagenliste",
      definition:
        "Kurze Liste der beigefügten Nachweise. Sie hilft, Fotos, Screenshots, Rechnungen und Nachrichten prüfbar zu machen.",
    },
    {
      term: "Chronologie",
      definition:
        "Zeitliche Reihenfolge der wichtigsten Ereignisse: Zahlung, Bestellung, Problem, Kontaktversuch und aktueller Stand.",
    },
  ];
}

function wordingPreview(title: string, category: string, ctx: GuideContext): WordingPreview {
  const lower = `${title} ${category}`.toLowerCase();
  const baseLines = [
    "Ich bitte um Prüfung der Zahlung vom [Datum] über [Betrag] EUR.",
    "Der bisherige Ablauf ist aus den beigefügten Unterlagen nachvollziehbar.",
    "Als Belege füge ich Zahlungsnachweis, Bestellunterlagen und bisherigen Schriftverkehr bei.",
  ];

  if (textContainsAny(lower, ["paypal"])) {
    return {
      title: "Beispiel für einen sachlichen PayPal-Einstieg",
      intro:
        "Ein guter Einstieg benennt Transaktion, Problem und gewünschte Lösung, ohne den Händler vorschnell zu beschuldigen.",
      lines: [
        "Zu der PayPal-Transaktion [ID] vom [Datum] habe ich die bestellte Ware bislang nicht erhalten.",
        "Der Händler wurde am [Datum] kontaktiert; eine nachvollziehbare Lösung liegt bisher nicht vor.",
        "Ich bitte um Prüfung im Rahmen der im Konto angezeigten Käuferschutzregeln.",
      ],
      note: "Passe diese Struktur an deinen tatsächlichen Fall und die Angaben im PayPal-Konto an.",
    };
  }

  if (textContainsAny(lower, ["klarna"])) {
    return {
      title: "Beispiel für eine klare Klarna-Meldung",
      intro:
        "Bei Klarna sollte sofort erkennbar sein, welche Rechnung betroffen ist und warum die Forderung geprüft werden soll.",
      lines: [
        "Zur Klarna-Rechnung [Nummer] melde ich ein Problem mit der Bestellung [Bestellnummer].",
        "Die Ware wurde [nicht geliefert / retourniert / falsch geliefert]; die Belege füge ich bei.",
        "Ich bitte um Prüfung und, soweit möglich, um Pausierung der Forderung bis zur Klärung.",
      ],
      note: "Wichtig ist, dass du die tatsächliche Option im Klarna-Konto prüfst und keine Zahlung einfach ignorierst.",
    };
  }

  if (textContainsAny(lower, ["lieferdienst", "lieferando", "wolt", "uber eats", "essen"])) {
    return {
      title: "Beispiel für eine Lieferdienst-Reklamation",
      intro:
        "Bei Lieferdiensten hilft eine sehr konkrete Beschreibung der Abweichung direkt nach Lieferung.",
      lines: [
        "Die Bestellung [Nummer] wurde am [Datum/Uhrzeit] geliefert, entsprach aber nicht der Bestellung.",
        "Folgende Positionen waren betroffen: [fehlend/falsch/kalt/beschädigt]. Fotos und Supportverlauf liegen bei.",
        "Ich bitte um Erstattung des betroffenen Betrags auf den ursprünglichen Zahlungsweg.",
      ],
      note: "Nutze konkrete Artikel, Zeiten und Fotos. Allgemeine Aussagen wie 'war schlecht' sind schwächer.",
    };
  }

  if (textContainsAny(lower, ["flug", "reise", "kiwi", "ryanair"])) {
    return {
      title: "Beispiel für eine Reise-Erstattungsstruktur",
      intro: "Bei Flügen sollte der offene Betrag nachvollziehbar aufgeschlüsselt werden.",
      lines: [
        "Zur Buchung [Code] wurde die vereinbarte Leistung am [Datum] nicht wie gebucht erbracht.",
        "Gezahlt wurden [Betrag] EUR; bislang erstattet oder angeboten wurden [Betrag/Gutschein].",
        "Ich bitte um nachvollziehbare Prüfung des offenen Erstattungsbetrags und der abgezogenen Gebühren.",
      ],
      note: "Trenne Ticketpreis, Steuern, Gebühren, Gutscheine und Teilgutschriften, soweit du sie belegen kannst.",
    };
  }

  if (textContainsAny(lower, ["abo", "abonnement", "abbuchung", "ungewollt"])) {
    return {
      title: "Beispiel für eine ungewollte Abbuchung",
      intro:
        "Abo-Fälle werden klarer, wenn du Zahlung, Vertragsgrundlage und Kündigung getrennt formulierst.",
      lines: [
        "Ich widerspreche der Abbuchung vom [Datum] über [Betrag] EUR, da mir keine wirksame Grundlage bekannt ist.",
        "Vorsorglich habe ich den Anbieter am [Datum] zur Klärung und Kündigungsbestätigung aufgefordert.",
        "Ich bitte um Prüfung der Zahlung und füge Umsatz, Bestellseite sowie bisherigen Schriftverkehr bei.",
      ],
      note: "Das ersetzt keine individuelle Rechtsprüfung, hilft aber bei einer nachvollziehbaren Sortierung.",
    };
  }

  if (textContainsAny(lower, ["online-shopping", "ware nicht erhalten", "fake-shop"])) {
    return {
      title: "Beispiel für nicht erhaltene Ware",
      intro:
        "Bei nicht erhaltener Ware sollte die Lücke zwischen Zahlung, Tracking und tatsächlichem Empfang sichtbar werden.",
      lines: [
        "Ich habe am [Datum] bei [Händler] bestellt und per [Zahlungsart] gezahlt.",
        "Die Ware wurde bislang nicht erhalten; der Trackingstatus passt aus meiner Sicht nicht zum tatsächlichen Ablauf.",
        "Ich bitte um Prüfung und füge Bestellbestätigung, Tracking, Zahlungsnachweis und Händlerkontakt bei.",
      ],
      note: "Bei Fake-Shop-Verdacht zusätzlich Shop-Screenshots und Impressum sichern.",
    };
  }

  return {
    title: "Beispiel für eine neutrale Grundstruktur",
    intro:
      "Diese Kurzstruktur zeigt, wie ein prüfbarer Einstieg aussehen kann. Der vollständige Entwurf sollte immer an den Fall angepasst werden.",
    lines: [...baseLines, `Als nächsten Schritt bitte ich um: ${ctx.primaryPath}.`],
    note: "Nutze keine Platzhalter im echten Schreiben; ersetze sie durch deine konkreten Daten und Belege.",
  };
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
  const canonicalPath = pathname || "/ratgeber";
  const moneyProfile = moneyPageProfile(canonicalPath);
  const routeMeta = getRouteMeta(canonicalPath);
  const metaTitle = routeMeta?.title ?? `${title} | ChargebackPilot`;
  const description =
    routeMeta?.description ??
    moneyProfile?.metaDescription ??
    `${title}: typische Fristenhinweise, Belege und strukturierte Orientierung bei ${category}. Mit unverbindlichen Textentwürfen.`;
  const context = guideContext(title, category);
  const enrichedFaq = enrichFaq(faq, title, category, context);
  const examples = guideExamples(category, title);
  const inlineLinks = contextualLinks(canonicalPath, category);
  const shortAnswer = snippetAnswer(title, category, context);
  const insight = editorialInsight(title, category, context);
  const glossary = glossaryForGuide(title, category);
  const preview = wordingPreview(title, category, context);

  const handleNewCaseClick = () => {
    openNewWizardCase();
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    totalTime: "PT15M",
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
    ...(moneyProfile
      ? {
          keywords: moneyProfile.keywords.join(", "),
          about: moneyProfile.keywords.map((keyword) => ({
            "@type": "Thing",
            name: keyword,
          })),
        }
      : {}),
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

  const relatedGuides = (
    moneyProfile?.nextLinks ?? [
      { href: "/paypal-chargeback", label: "PayPal Käuferschutz" },
      { href: "/visa-mastercard-chargeback", label: "Visa & Mastercard" },
      { href: "/klarna-reklamation", label: "Klarna Reklamation" },
      { href: "/vergleich/paypal-vs-kreditkarte-vs-klarna", label: "Vergleich Käuferschutz" },
    ]
  )
    .filter((g) => g.href !== canonicalPath)
    .slice(0, 3);
  const seenFollowUpLinks = new Set<string>();
  const followUpLinks = [...inlineLinks, ...relatedGuides]
    .filter((link) => {
      if (link.href === canonicalPath || seenFollowUpLinks.has(link.href)) return false;
      seenFollowUpLinks.add(link.href);
      return true;
    })
    .slice(0, 6);

  return (
    <MainLayout>
      <SeoHead
        title={metaTitle}
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
          <section className="ai-summary-card rounded-2xl border border-blue-200/70 bg-slate-50 p-6 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
                <Sparkles className="ai-summary-sparkle h-3.5 w-3.5" />
                Kurzantwort
              </span>
            </div>
            <p className="ai-summary-text text-base leading-relaxed text-foreground/90">
              {shortAnswer}
            </p>
          </section>

          {moneyProfile && (
            <section className="rounded-2xl border bg-background p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                    Häufig gesucht
                  </p>
                  <h2 className="text-2xl font-bold">{moneyProfile.headline}</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {moneyProfile.primaryKeyword}
                </span>
              </div>

              <div className="space-y-4 text-foreground/90 leading-relaxed">
                <p>{moneyProfile.intent}</p>
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                  <strong>Kurz gesagt:</strong> {moneyProfile.immediateAnswer}
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <h3 className="mb-2 text-sm font-bold">Du bist hier richtig, wenn</h3>
                  <ul className="space-y-2">
                    {moneyProfile.decisionSignals.map((signal) => (
                      <li key={signal} className="flex gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <h3 className="mb-2 text-sm font-bold">Zuerst bereitlegen</h3>
                  <ul className="space-y-2">
                    {moneyProfile.proofPriority.map((proof) => (
                      <li key={proof} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{proof}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <h3 className="mb-2 text-sm font-bold">So gehst du weiter vor</h3>
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {moneyProfile.nextAction}
                  </p>
                  <p className="text-xs leading-relaxed text-amber-800">
                    <strong>Nicht machen:</strong> {moneyProfile.avoid}
                  </p>
                </div>
              </div>
            </section>
          )}

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

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Redaktionelle Einordnung</h2>
            <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4 text-foreground/90 leading-relaxed">
                <h3 className="text-lg font-bold">{insight.title}</h3>
                {insight.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="rounded-xl border bg-muted/40 p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">
                  Qualitätscheck vor dem Versand
                </p>
                <ul className="space-y-3">
                  {insight.checkpoints.map((checkpoint) => (
                    <li key={checkpoint} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{checkpoint}</span>
                    </li>
                  ))}
                </ul>
              </div>
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

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Begriffe kurz erklärt</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {glossary.map((item) => (
                <div key={item.term} className="rounded-xl border bg-background p-4">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                    {item.term}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.definition}</p>
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

          <section className="rounded-2xl border bg-slate-950 p-6 text-white shadow-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              Formulierungs-Preview
            </p>
            <h2 className="mb-3 text-xl font-bold">{preview.title}</h2>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">{preview.intro}</p>
            <div className="space-y-3">
              {preview.lines.map((line) => (
                <p
                  key={line}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-slate-100"
                >
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">{preview.note}</p>
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
            <h2 className="mb-3 text-lg font-bold">Auch interessant</h2>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Weitere Guides, die gut zu diesem Thema passen und beim Sortieren des nächsten
              Zahlungswegs helfen.
            </p>
            <div className="flex flex-wrap gap-2">
              {followUpLinks.map((link) => (
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
