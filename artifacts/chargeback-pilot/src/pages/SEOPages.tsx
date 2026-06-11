import { SEOArticleLayout } from "@/components/layout/SEOArticleLayout";

export function PayPalSEO() {
  return (
    <SEOArticleLayout
      title="PayPal Chargeback / Käuferschutz erfolgreich nutzen"
      category="PayPal"
      whenApplies={[
        "Ware wurde nicht geliefert (Item Not Received)",
        "Ware weicht erheblich von der Beschreibung ab (Significantly Not As Described)",
        "Unautorisierte Kontozugriffe",
      ]}
      evidence={[
        "Bestellbestätigung",
        "Link zur Artikelbeschreibung",
        "Kommunikationsverlauf mit dem Händler",
        "Sendungsnummer (Tracking)",
        "Fotos des defekten Artikels",
      ]}
      steps={[
        "Händler kontaktieren: Versuche zunächst eine direkte Klärung.",
        "Problem bei PayPal melden: Logge dich ein und öffne das Konfliktlösungen-Center.",
        "Fall eröffnen: Klicke auf 'Problem melden' und wähle die entsprechende Transaktion.",
        "Antrag auf Käuferschutz stellen: Eskaliere den Konflikt innerhalb von 20 Tagen an PayPal zur Klärung.",
        "Beweise einreichen: Lade alle relevanten Dokumente im Center hoch.",
      ]}
      mistakes={[
        "Frist zu spät geprüft: PayPal nennt häufig 180 Tage ab Zahlung. Prüfe außerdem die Eskalationsfrist direkt bei PayPal.",
        "Ohne vorherigen Kontakt vorschnell eskalieren: Ein dokumentierter Lösungsversuch kann hilfreich sein.",
        "Zahlung per 'Geld an Freunde senden': Hier greift der Käuferschutz nicht!",
      ]}
      faq={[
        {
          q: "Wie lange dauert ein PayPal Fall?",
          a: "Die Bearbeitungszeit hängt vom Einzelfall und den eingereichten Belegen ab. Die konkrete Dauer bestimmt PayPal.",
        },
        {
          q: "Greift der Schutz bei digitalen Gütern?",
          a: "Das hängt von den jeweils aktuellen PayPal-Richtlinien und dem Einzelfall ab. Prüfe die geltenden Bedingungen direkt bei PayPal.",
        },
      ]}
    />
  );
}

export function AmexSEO() {
  return (
    <SEOArticleLayout
      title="American Express Chargeback einleiten"
      category="Amex"
      whenApplies={[
        "Betrügerische Abbuchungen",
        "Leistung nicht erbracht (z.B. Insolvenz des Anbieters)",
        "Ware nicht erhalten oder defekt",
        "Doppelte Abbuchung",
      ]}
      evidence={[
        "Kopie der Rechnung/Reisebestätigung",
        "Nachweis über die Stornierung/Nicht-Erbringung",
        "E-Mail-Verlauf mit dem Händler",
        "Kopie der AGB des Händlers",
      ]}
      steps={[
        "Versuche das Problem direkt mit dem Händler zu lösen (und dokumentiere dies).",
        "Logge dich in dein Amex Online-Konto ein.",
        "Wähle die betreffende Buchung aus und klicke auf 'Umsatz reklamieren'.",
        "Fülle das Formular aus und beschreibe den Fall präzise.",
        "Lade die geforderten Beweisdokumente hoch.",
      ]}
      mistakes={[
        "Warten auf Rückbuchung ohne zu reklamieren: Fristen sind oft knapp und sollten direkt bei Amex geprüft werden.",
        "Zu wenig Beweise geliefert: Amex prüft streng. Ohne vorherigen Kontakt zum Händler wird oft direkt abgelehnt.",
      ]}
      faq={[
        {
          q: "Ist Amex bei Reklamationen oft kulant?",
          a: "Das hängt vom Einzelfall und der Dokumentation ab. Eine präzise und vollständige Schilderung ist regelmäßig hilfreich.",
        },
      ]}
    />
  );
}

export function VisaMastercardSEO() {
  return (
    <SEOArticleLayout
      title="Visa / Mastercard Chargeback: Geld zurück"
      category="Kreditkarte"
      whenApplies={[
        "Insolvenz der Fluggesellschaft oder des Reiseveranstalters",
        "Abo-Fallen (ungewollte wiederkehrende Abbuchungen)",
        "Ware nicht geliefert",
        "Betrug (Kreditkartenmissbrauch)",
      ]}
      evidence={[
        "Stornierungsbestätigung",
        "Beweis des Klärungsversuchs",
        "Nachweis über die Insolvenz (falls zutreffend)",
        "Kontoauszug mit der Fehlbuchung",
      ]}
      steps={[
        "Händler kontaktieren (schriftlich).",
        "Umsatzreklamations-Formular deiner Hausbank ausfüllen (Visa/Mastercard verweisen an die kartenausgebende Bank).",
        "Beweise anhängen (E-Mails, Screenshots).",
        "Formular innerhalb der von deiner Bank genannten Frist einreichen.",
      ]}
      mistakes={[
        "Die Bank vorschnell abwimmeln lassen: Banken verweisen teils auf interne Prozesse. Bitte um schriftliche Begründung und bleibe sachlich dran.",
        "Nur telefonisch kontaktieren: Ohne schriftliche Beweise hast du beim Chargeback schlechte Karten.",
      ]}
      faq={[
        {
          q: "Kann meine Bank ein Chargeback-Verfahren prüfen?",
          a: "Ob ein Chargeback-Verfahren eingeleitet wird, hängt von den Regeln des Kartennetzwerks, der Bank und dem Einzelfall ab.",
        },
      ]}
    />
  );
}

export function KlarnaSEO() {
  return (
    <SEOArticleLayout
      title="Klarna Reklamation & Käuferschutz"
      category="Klarna"
      whenApplies={[
        "Rücksendung wurde nicht verbucht",
        "Ware nicht angekommen",
        "Ware beschädigt oder fehlerhaft",
      ]}
      evidence={[
        "Einlieferungsbeleg der Retoure (sehr wichtig!)",
        "Fotos der beschädigten Ware",
        "Kommunikation mit dem Shop",
      ]}
      steps={[
        "Logge dich in die Klarna App ein.",
        "Wähle den entsprechenden Einkauf aus.",
        "Klicke auf 'Problem melden' (Zahlungspause wird aktiviert).",
        "Wähle den Grund (z.B. 'Retoure', 'Ware nicht erhalten').",
        "Lade ggf. den Retourenbeleg hoch, falls Klarna danach fragt.",
      ]}
      mistakes={[
        "Zahlungspause nicht aktiviert: Wenn du die Rechnung nicht pausierst, gerätst du in den Mahnprozess.",
        "Retourenbeleg weggeworfen: Ohne Nachweis der Rücksendung bist du zahlungspflichtig.",
      ]}
      faq={[
        {
          q: "Was passiert, wenn der Händler sich nicht meldet?",
          a: "Dann prüft Klarna den Fall nach den eigenen Regeln und anhand der eingereichten Belege.",
        },
      ]}
    />
  );
}

export function FlugSEO() {
  return (
    <SEOArticleLayout
      title="Flug Chargeback / Reiserückerstattung"
      category="Flug/Reise"
      whenApplies={[
        "Flug wurde von der Airline annulliert",
        "Airline ist insolvent",
        "Erstattungszusage der Airline wird nicht eingehalten",
      ]}
      evidence={[
        "Buchungsbestätigung",
        "Nachweis über die Annullierung (z.B. E-Mail der Airline)",
        "Schriftliche Aufforderung zur Erstattung mit Fristsetzung (meist 7-14 Tage)",
      ]}
      steps={[
        "Fordere die Airline schriftlich zur Rückmeldung bzw. Rückzahlung auf und setze eine angemessene Frist.",
        "Nach Fristablauf: Kontaktiere deine Bank oder deinen Kreditkartenherausgeber.",
        "Fülle das Reklamationsformular aus (Grund: 'Leistung nicht erbracht').",
        "Hänge die Flugtickets und den E-Mail-Verlauf an.",
      ]}
      mistakes={[
        "Gutschein akzeptieren: Wenn du einen Voucher akzeptierst, kann ein Chargeback schwieriger werden.",
        "Selbst stornieren: Wenn DU stornierst (nicht die Airline), greift das Chargeback-Recht in der Regel nicht.",
      ]}
      faq={[
        {
          q: "Kann ich Chargeback nutzen, wenn der Flug verspätet war?",
          a: "Bei reinen Verspätungen kommen häufig andere Ansprüche als bei einer Annullierung in Betracht. Prüfe die passende Grundlage je nach Einzelfall.",
        },
      ]}
    />
  );
}

export function LieferandoSEO() {
  return (
    <SEOArticleLayout
      title="Lieferando / Essen Rückerstattung"
      category="Lieferdienst"
      whenApplies={[
        "Essen wurde nie geliefert",
        "Essen eiskalt geliefert (z.B. Fahrer hat Umweg gemacht)",
        "Falsches Gericht geliefert",
        "Essen ungenießbar/verdorbene Zutaten",
      ]}
      evidence={[
        "Fotos des falschen oder ungenießbaren Essens möglichst zeitnah erstellen",
        "Screenshot des Bestellstatus in der App (insb. wenn der Fahrer einen Umweg macht)",
        "Bestellbestätigung",
      ]}
      steps={[
        "Mache möglichst zeitnah Fotos von Fehlern oder dem kalten Essen.",
        "Kontaktiere den Lieferando-Support über die App oder Website.",
        "Falls keine Einigung erfolgt oder man dir nur einen 5€ Gutschein anbietet: Kontaktiere PayPal oder dein Kreditkartenunternehmen für einen Chargeback.",
      ]}
      mistakes={[
        "Keine Beweisfotos gemacht: Essen direkt weggeworfen oder aufgegessen – ohne Foto keine Erstattung.",
        "Zu lange gewartet: Reklamationen bei Lebensmitteln sollten möglichst zeitnah erfolgen.",
        "Sich mit einem 3€ Gutschein abspeisen lassen, wenn das 30€ Essen kalt und ungenießbar war.",
      ]}
      faq={[
        {
          q: "Muss das Restaurant oder Lieferando erstatten?",
          a: "Bei Plattformbestellungen läuft die Erstattung häufig über den Plattform-Support. Maßgeblich sind die konkreten Vertragsbedingungen und der Einzelfall.",
        },
        {
          q: "Essen war kalt, weil der Fahrer einen Umweg gemacht hat - Geld zurück?",
          a: "Wenn das Essen dadurch nicht mehr vertragsgemäß nutzbar ist, kann eine (Teil-)Erstattung in Betracht kommen. Fotos, Zeitstempel und Supportverlauf helfen bei der Prüfung.",
        },
      ]}
    />
  );
}

export function WoltSEO() {
  return (
    <SEOArticleLayout
      title="Wolt Rückerstattung (Essen kalt / nicht geliefert)"
      category="Lieferdienst"
      whenApplies={[
        "Essen komplett kalt angekommen",
        "Fehlende Artikel in der Lieferung",
        "Bestellung wurde storniert aber trotzdem abgebucht",
      ]}
      evidence={[
        "Beweisfotos vom Zustand des Essens",
        "Chat-Verlauf mit dem Wolt-Support",
        "GPS-Screenshot der Fahrer-Route (falls Umweg ersichtlich)",
      ]}
      steps={[
        "Schreibe dem Wolt In-App-Support.",
        "Mache deutlich, dass das Essen aufgrund der Lieferzeit / des Zustands mangelhaft ist.",
        "Wenn Wolt nur Guthaben anbietet, prüfe, ob du stattdessen eine Auszahlung auf das Zahlungsmittel anfragen möchtest.",
        "Wenn keine Einigung erreicht wird, prüfe zusätzlich die Reklamationsmöglichkeiten bei Bank oder PayPal.",
      ]}
      mistakes={[
        "Wolt-Credits akzeptieren, wenn man eigentlich das Geld zurück will.",
        "Die Frist für eine Reklamation (meist 24h) verstreichen lassen.",
      ]}
      faq={[
        {
          q: "Kann ich Chargeback machen, wenn Wolt mein Konto danach sperrt?",
          a: "Ein Chargeback kann bei Nichterfüllung ein zulässiger Weg sein. Mögliche Folgen auf Kontenebene hängen vom Einzelfall und den Plattformbedingungen ab.",
        },
      ]}
    />
  );
}

export function UberEatsSEO() {
  return (
    <SEOArticleLayout
      title="Uber Eats Erstattung & Chargeback"
      category="Lieferdienst"
      whenApplies={[
        "Fahrer hat das Essen an die falsche Adresse geliefert",
        "Essen kalt wegen Mehrfach-Lieferungen (Stacked Orders)",
        "Bestellung nie angekommen",
      ]}
      evidence={[
        "Screenshots von der App-Tracking-Karte",
        "Fotos der Lieferung (oder Foto des Ortes, wo es fälschlicherweise abgestellt wurde)",
        "Support-Tickets in der Uber-App",
      ]}
      steps={[
        "Problem direkt in der Uber Eats App unter 'Hilfe' melden.",
        "Problem genau beschreiben (z.B. 'Bestellung nicht erhalten' oder 'Lebensmittelsicherheitsproblem').",
        "Uber Eats Support entscheidet oft automatisiert. Wenn abgelehnt, prüfe zusätzlich die Reklamationsmöglichkeiten über den Zahlungsdienstleister.",
      ]}
      mistakes={[
        "Sich vom Bot-Support abspeisen lassen.",
        "Die Lieferung nicht sofort bei Ankunft überprüfen.",
      ]}
      faq={[
        {
          q: "Uber Eats Support lehnt ab, was nun?",
          a: "Der automatisierte Support lehnt oft erst einmal ab. Eskaliere den Fall über deinen Zahlungsdienstleister (PayPal Käuferschutz oder Kreditkarten-Chargeback).",
        },
      ]}
    />
  );
}

export function KiwiSEO() {
  return (
    <SEOArticleLayout
      title="Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen"
      category="Flug/Reise"
      whenApplies={[
        "Du hast den Flug selbst storniert (nicht-erstattbares Ticket)",
        "Flug wurde verpasst (No-Show)",
        "Du willst Flughafensteuern und Gebühren zurückfordern",
      ]}
      evidence={[
        "Buchungsbestätigung",
        "Nachweis über Stornierung / No-Show",
        "Kiwi.com AGB (die eine Bearbeitungsgebühr von 59€ fordern)",
      ]}
      steps={[
        "Fordere Kiwi.com formlos auf, dir die personenbezogenen Steuern und Gebühren nachvollziehbar zu erstatten.",
        "Wenn Kiwi.com antwortet, dass sie eine Bearbeitungsgebühr (oft 59€) einbehalten: Widerspreche! Solche Gebühren können je nach anwendbarem Recht und Vertragslage angreifbar sein.",
        "Reagiert Kiwi.com nicht oder verweigert die volle Auszahlung, prüfe eine Reklamation bei der Kreditkarte (z. B. wegen nicht verarbeiteter Gutschrift).",
      ]}
      mistakes={[
        "Den geringen Restbetrag (nach Abzug der 59€) akzeptieren.",
        "Glauben, dass man bei nicht-erstattbaren Tickets kein Geld zurückbekommt.",
      ]}
      faq={[
        {
          q: "Warum verlangt Kiwi.com 59€?",
          a: "Plattformen arbeiten teils mit Bearbeitungsgebühren. Ob und in welcher Höhe das im Einzelfall wirksam ist, hängt von den jeweiligen Vertragsbedingungen und der anwendbaren Rechtslage ab.",
        },
        {
          q: "Wie hole ich mir die vollen Steuern zurück?",
          a: "Fordere die Positionen nachvollziehbar und schriftlich an. Falls keine Einigung erfolgt, kann je nach Zahlungsart eine Reklamation über den Zahlungsdienstleister geprüft werden.",
        },
      ]}
    />
  );
}

export function WareNichtErhaltenSEO() {
  return (
    <SEOArticleLayout
      title="Chargeback: Ware nicht erhalten"
      category="Online-Shopping"
      whenApplies={[
        "Fake-Shops",
        "Paket ging auf dem Postweg verloren",
        "Händler liefert trotz Zahlung nicht",
      ]}
      evidence={[
        "Trackingnummer zeigt, dass das Paket nicht angekommen ist",
        "E-Mails an den Händler mit Bitte um Klärung",
        "Bestellbestätigung",
      ]}
      steps={[
        "Händler kontaktieren und um Nachforschung bitten.",
        "Nach angemessener Wartezeit: Bei PayPal 'Käuferschutz' oder bei der Bank 'Chargeback' beantragen.",
        "Als Grund 'Ware nicht erhalten' (Item Not Received) angeben.",
        "Kommunikationsverlauf beifügen.",
      ]}
      mistakes={[
        "Nur selbst einen Nachforschungsauftrag stellen: Häufig sollte zusätzlich der Händler als Vertragspartner eingebunden werden.",
        "Die Frist des Zahlungsdienstleisters (z.B. 180 Tage bei PayPal, 120 bei Kreditkarte) verpassen.",
      ]}
      faq={[
        {
          q: "Was, wenn laut Tracking geliefert wurde, ich aber nichts habe?",
          a: "Dann ist der Fall häufig schwieriger. Zusätzliche Belege wie Nachbarschaftsnachfragen, Händlerkommunikation oder ggf. eine Anzeige können je nach Fall hilfreich sein.",
        },
      ]}
    />
  );
}

export function AboFalleSEO() {
  return (
    <SEOArticleLayout
      title="Abo-Falle Chargeback"
      category="Abonnements"
      whenApplies={[
        "Kostenlose Probephase wurde unerlaubt kostenpflichtig",
        "Versteckte Kosten (kein klarer Hinweis auf ein Abo beim Kauf)",
        "Kündigung wird vom Anbieter ignoriert",
      ]}
      evidence={[
        "Screenshot der Bestellseite (falls noch möglich)",
        "E-Mail mit deiner Kündigung",
        "AGB des Anbieters",
      ]}
      steps={[
        "Kündige das Abo möglichst zeitnah schriftlich (E-Mail aufbewahren).",
        "Kontaktiere deine Bank oder PayPal und melde unautorisierte / ungewollte wiederkehrende Zahlungen.",
        "Lasse die Karte für diesen speziellen Händler sperren oder entziehe das SEPA-Mandat / die PayPal-Einzugsermächtigung.",
        "Beantrage Chargeback für die bereits abgebuchten Beiträge.",
      ]}
      mistakes={[
        "Nur die Karte sperren: Das kündigt das Abo nicht. Du musst auch beim Händler kündigen, sonst können Inkassoforderungen kommen.",
        "Kündigung nicht beweisen können: Nutze immer schriftliche Wege, niemals nur telefonisch.",
      ]}
      faq={[
        {
          q: "Kann ich rückwirkend für Monate Geld zurückholen?",
          a: "Das hängt von Zahlungsart, Frist und Einzelfall ab. Prüfe die konkreten Möglichkeiten möglichst früh direkt bei Bank, PayPal oder Kartenausgeber.",
        },
      ]}
    />
  );
}

export function ChargebackAntragVorlageSEO() {
  return (
    <SEOArticleLayout
      title="Chargeback Antrag Vorlage für Bank & Kreditkarte"
      category="Musterbrief"
      whenApplies={[
        "Du willst eine Kreditkarten-Reklamation bei deiner Bank strukturiert einreichen",
        "Ware wurde nicht geliefert, eine Leistung nicht erbracht oder eine Abbuchung wirkt unberechtigt",
        "Du brauchst eine sachliche Vorlage mit Fallzusammenfassung, Betrag, Datum und Belegen",
      ]}
      evidence={[
        "Konto- oder Kartenumsatz mit Datum und Betrag",
        "Bestellbestätigung oder Vertrag",
        "Kommunikation mit Händler oder Anbieter",
        "Tracking, Fotos, Screenshots oder Stornierungsnachweis",
      ]}
      steps={[
        "Fasse den Sachverhalt chronologisch zusammen: Zahlung, Problem, Kontaktversuch und aktueller Stand.",
        "Benenne die gewünschte Prüfung sachlich als Umsatzreklamation oder Chargeback-Anfrage.",
        "Füge Belege geordnet bei und verweise im Text kurz auf die wichtigsten Nachweise.",
        "Bitte deine Bank um Prüfung nach den geltenden Kartenregeln und um schriftliche Rückmeldung.",
      ]}
      mistakes={[
        "Zu emotional formulieren oder Betrug unterstellen, ohne Belege zu nennen.",
        "Nur telefonisch reklamieren und keinen schriftlichen Nachweis behalten.",
        "Fristen bei Bank oder Kartenausgeber nicht direkt prüfen.",
      ]}
      faq={[
        {
          q: "Ist eine Chargeback Antrag Vorlage verbindlich?",
          a: "Nein. Eine Vorlage ist eine Formulierungshilfe. Ob ein Chargeback geprüft oder akzeptiert wird, entscheidet die Bank bzw. der Kartenausgeber nach den jeweiligen Regeln.",
        },
        {
          q: "Muss ich einen Reason Code selbst kennen?",
          a: "In der Regel reicht eine klare Sachverhaltsschilderung. Die Bank ordnet den Fall intern ein; eine passende Kategorie kann aber die Nachvollziehbarkeit verbessern.",
        },
      ]}
    />
  );
}

export function PayPalKaeuferschutzVorlageSEO() {
  return (
    <SEOArticleLayout
      title="PayPal Käuferschutz Vorlage: Fall sachlich formulieren"
      category="Musterbrief"
      whenApplies={[
        "Ware wurde nicht geliefert oder weicht deutlich von der Beschreibung ab",
        "Du willst den PayPal-Konflikt mit klarer Chronologie und Belegen eröffnen",
        "Du brauchst einen sachlichen Text für Konfliktcenter oder Eskalation",
      ]}
      evidence={[
        "PayPal-Transaktionsnummer",
        "Bestellbestätigung und Artikelbeschreibung",
        "Tracking oder Zustellnachweis",
        "Chat- oder E-Mail-Verlauf mit dem Händler",
      ]}
      steps={[
        "Öffne den Konflikt rechtzeitig im PayPal-Konto und wähle die passende Transaktion aus.",
        "Beschreibe kurz, was bestellt wurde, was passiert ist und welche Lösung du vom Händler verlangt hast.",
        "Lade Belege hoch und eskaliere innerhalb der bei PayPal angezeigten Frist, falls keine Einigung gelingt.",
      ]}
      mistakes={[
        "Die im PayPal-Konto angezeigte Eskalationsfrist übersehen.",
        "Freunde-und-Familie-Zahlungen wie Käuferschutzfälle behandeln.",
        "Nur allgemeine Vorwürfe ohne konkrete Belege einreichen.",
      ]}
      faq={[
        {
          q: "Wie lange gilt PayPal Käuferschutz?",
          a: "PayPal nennt häufig 180 Tage ab Zahlung. Prüfe die konkrete Frist und Eskalationsfrist immer direkt im PayPal-Konto.",
        },
        {
          q: "Was gehört in die PayPal Käuferschutz Vorlage?",
          a: "Wichtig sind Transaktion, Bestelldatum, Problem, Händlerkontakt, gewünschte Lösung und die wichtigsten Belege.",
        },
      ]}
    />
  );
}

export function KlarnaReklamationVorlageSEO() {
  return (
    <SEOArticleLayout
      title="Klarna Reklamation Vorlage: Problem melden & Zahlung klären"
      category="Musterbrief"
      whenApplies={[
        "Ware fehlt, ist mangelhaft oder eine Retoure wurde nicht verbucht",
        "Du willst eine Klarna-Rechnung pausieren oder ein Problem nachvollziehbar melden",
        "Du brauchst eine sachliche Nachricht an Klarna und den Händler",
      ]}
      evidence={[
        "Klarna-Kauf oder Rechnungsnummer",
        "Bestell- und Zahlungsdaten",
        "Retourenbeleg, Tracking oder Fotos",
        "Kommunikation mit dem Händler",
      ]}
      steps={[
        "Melde das Problem frühzeitig in der Klarna App oder im Klarna-Konto.",
        "Beschreibe knapp, warum die Forderung aus deiner Sicht nicht oder noch nicht fällig ist.",
        "Füge Belege wie Retourenbeleg, Tracking oder Händlerantworten hinzu.",
        "Dokumentiere parallel den Kontakt zum Händler.",
      ]}
      mistakes={[
        "Die Rechnung ignorieren, statt das Problem offiziell zu melden.",
        "Retourenbelege nicht aufbewahren.",
        "Nur an den Händler schreiben und Klarna nicht informieren.",
      ]}
      faq={[
        {
          q: "Kann Klarna eine Rechnung pausieren?",
          a: "Klarna bietet je nach Fall Möglichkeiten, ein Problem zu melden. Ob eine Zahlung pausiert oder geklärt wird, hängt von Klarna, Händler und Belegen ab.",
        },
        {
          q: "Ist die Klarna Vorlage eine Rechtsberatung?",
          a: "Nein. Sie ist eine sachliche Formulierungshilfe zur strukturierten Darstellung deines Falls.",
        },
      ]}
    />
  );
}

export function WareNichtErhaltenMusterbriefSEO() {
  return (
    <SEOArticleLayout
      title="Ware nicht erhalten Musterbrief an Händler, PayPal oder Bank"
      category="Musterbrief"
      whenApplies={[
        "Ein Paket ist nicht angekommen oder nur angeblich zugestellt",
        "Der Shop reagiert nicht oder verweist dich an den Versanddienstleister",
        "Du willst den Fall für Händler, PayPal, Klarna oder Bank schriftlich dokumentieren",
      ]}
      evidence={[
        "Bestellbestätigung",
        "Trackingverlauf und Zustellstatus",
        "Kontaktversuche mit Händler oder Versanddienstleister",
        "Zahlungsnachweis",
      ]}
      steps={[
        "Fordere den Händler schriftlich zur Klärung oder Ersatzlieferung bzw. Erstattung auf.",
        "Setze eine angemessene Rückmeldefrist und speichere die Nachricht.",
        "Wenn keine Lösung erfolgt, prüfe Käuferschutz oder Chargeback über den Zahlungsdienstleister.",
      ]}
      mistakes={[
        "Nur beim Paketdienst reklamieren, obwohl der Händler dein Vertragspartner ist.",
        "Keine Screenshots vom Tracking sichern.",
        "Fristen bei PayPal, Klarna oder Bank verstreichen lassen.",
      ]}
      faq={[
        {
          q: "Was schreibe ich, wenn Ware nicht angekommen ist?",
          a: "Nenne Bestellung, Zahlungsdatum, Trackingstatus, bisherigen Kontakt und deine gewünschte Lösung. Bleibe sachlich und füge Belege bei.",
        },
      ]}
    />
  );
}

export function AboFalleMusterbriefSEO() {
  return (
    <SEOArticleLayout
      title="Abo-Falle Musterbrief: ungewollte Abbuchung widersprechen"
      category="Musterbrief"
      whenApplies={[
        "Ein Anbieter bucht weiter ab, obwohl du gekündigt hast",
        "Du hast ein Abo nicht bewusst abgeschlossen",
        "Du willst Abbuchungen stoppen und den Fall schriftlich dokumentieren",
      ]}
      evidence={[
        "Konto- oder Kreditkartenumsatz",
        "Kündigungsnachweis",
        "Screenshots der Bestell- oder Anmeldeseite",
        "E-Mail-Verlauf mit dem Anbieter",
      ]}
      steps={[
        "Widersprich der Abbuchung schriftlich und fordere eine nachvollziehbare Vertragsgrundlage an.",
        "Kündige vorsorglich erneut und entziehe Einzugsermächtigungen, soweit möglich.",
        "Prüfe Rückgabemöglichkeiten bei Bank, Kreditkarte oder PayPal direkt beim Anbieter.",
      ]}
      mistakes={[
        "Nur die Karte sperren, ohne gegenüber dem Anbieter zu reagieren.",
        "Telefonische Kündigungen ohne Nachweis.",
        "Mehrere Abbuchungen abwarten, bevor du Belege sicherst.",
      ]}
      faq={[
        {
          q: "Kann ich Abo-Fallen rückbuchen?",
          a: "Das hängt von Zahlungsart, Frist, Autorisierung und Einzelfall ab. Prüfe die konkreten Möglichkeiten frühzeitig bei Bank oder Zahlungsdienstleister.",
        },
      ]}
    />
  );
}

export function RueckerstattungHaendlerVorlageSEO() {
  return (
    <SEOArticleLayout
      title="Rückerstattung Händler Vorlage: sachlich Geld zurückfordern"
      category="Musterbrief"
      whenApplies={[
        "Der Händler hat eine Rückerstattung zugesagt, aber nicht gezahlt",
        "Eine Retoure wurde nicht verbucht",
        "Eine Leistung wurde nicht oder nur mangelhaft erbracht",
      ]}
      evidence={[
        "Bestell- oder Vertragsnummer",
        "Zahlungsnachweis",
        "Rücksendebeleg oder Stornierungsbestätigung",
        "Bisherige Händlerkommunikation",
      ]}
      steps={[
        "Formuliere, welche Zahlung du wann geleistet hast und warum eine Rückerstattung erwartet wird.",
        "Verweise auf konkrete Belege und bisherige Zusagen.",
        "Setze eine angemessene Rückmeldefrist und kündige sachlich weitere Prüfung über Zahlungsdienstleister an.",
      ]}
      mistakes={[
        "Ohne Beleglage direkt eskalieren.",
        "Unklare Beträge oder fehlende Bestellnummern nennen.",
        "Drohend formulieren statt nachvollziehbar dokumentieren.",
      ]}
      faq={[
        {
          q: "Wann sollte ich dem Händler eine Frist setzen?",
          a: "Wenn du bereits gezahlt hast und der Händler nicht reagiert oder eine zugesagte Erstattung ausbleibt, kann eine schriftliche Rückmeldefrist die Dokumentation verbessern.",
        },
      ]}
    />
  );
}

export function VisaReasonCodeSEO() {
  return (
    <SEOArticleLayout
      title="Visa Reason Code 13.1: Ware oder Leistung nicht erhalten"
      category="Reason Codes"
      whenApplies={[
        "Du hast mit Visa bezahlt und Ware oder Leistung nicht erhalten",
        "Der Händler reagiert nicht oder verweigert eine nachvollziehbare Lösung",
        "Du willst den Fall für deine Bank verständlich vorbereiten",
      ]}
      evidence={[
        "Visa-Umsatz auf dem Konto- oder Kartenumsatz",
        "Bestell- oder Buchungsbestätigung",
        "Tracking, Stornierungsnachweis oder Händlerkommunikation",
      ]}
      steps={[
        "Beschreibe deiner Bank den Sachverhalt als nicht erhaltene Ware oder nicht erbrachte Leistung.",
        "Nenne den Visa-Umsatz, Händler, Datum und Betrag.",
        "Füge Belege und Kontaktversuche bei. Die genaue interne Einordnung nimmt die Bank vor.",
      ]}
      mistakes={[
        "Den Reason Code als garantierten Anspruch verstehen.",
        "Keinen vorherigen Händlerkontakt dokumentieren.",
        "Fristen nicht direkt bei der Bank prüfen.",
      ]}
      faq={[
        {
          q: "Muss ich Visa Reason Code 13.1 selbst angeben?",
          a: "Nicht zwingend. Verbraucher beschreiben meist den Sachverhalt; die Bank ordnet den Fall nach den Kartenregeln ein.",
        },
      ]}
    />
  );
}

export function MastercardReasonCodeSEO() {
  return (
    <SEOArticleLayout
      title="Mastercard Chargeback Reason Codes: Fall richtig einordnen"
      category="Reason Codes"
      whenApplies={[
        "Du hast mit Mastercard bezahlt und willst eine Umsatzreklamation vorbereiten",
        "Ware fehlt, ist falsch oder eine Leistung wurde nicht erbracht",
        "Du möchtest deiner Bank eine klare Sachverhaltsdarstellung liefern",
      ]}
      evidence={[
        "Mastercard-Umsatz mit Datum und Betrag",
        "Bestell- oder Vertragsunterlagen",
        "Belege zum Problem und Händlerkontakt",
      ]}
      steps={[
        "Sortiere deinen Fall nach Problemtyp: nicht erhalten, falsch/defekt, nicht erbracht oder unberechtigt.",
        "Beschreibe den Ablauf sachlich in chronologischer Reihenfolge.",
        "Bitte deine Bank um Prüfung nach den geltenden Mastercard-Regeln.",
      ]}
      mistakes={[
        "Interne Reason Codes mit rechtlichen Ansprüchen verwechseln.",
        "Zu wenig Belege zur Nichterfüllung liefern.",
        "Den Antrag nicht schriftlich dokumentieren.",
      ]}
      faq={[
        {
          q: "Welche Mastercard Reason Codes gibt es?",
          a: "Mastercard nutzt interne Kategorien für unterschiedliche Reklamationsgründe. Entscheidend ist für Verbraucher vor allem eine klare Beschreibung des Falls und vollständige Belege.",
        },
      ]}
    />
  );
}
