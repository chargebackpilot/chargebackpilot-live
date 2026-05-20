import { SEOArticleLayout } from "@/components/layout/SEOArticleLayout";

export function PayPalSEO() {
  return <SEOArticleLayout 
    title="PayPal Chargeback / Käuferschutz erfolgreich nutzen"
    category="PayPal"
    whenApplies={[
      "Ware wurde nicht geliefert (Item Not Received)",
      "Ware weicht erheblich von der Beschreibung ab (Significantly Not As Described)",
      "Unautorisierte Kontozugriffe"
    ]}
    evidence={[
      "Bestellbestätigung",
      "Link zur Artikelbeschreibung",
      "Kommunikationsverlauf mit dem Händler",
      "Sendungsnummer (Tracking)",
      "Fotos des defekten Artikels"
    ]}
    steps={[
      "Händler kontaktieren: Versuche zunächst eine direkte Klärung.",
      "Problem bei PayPal melden: Logge dich ein und öffne das Konfliktlösungen-Center.",
      "Fall eröffnen: Klicke auf 'Problem melden' und wähle die entsprechende Transaktion.",
      "Antrag auf Käuferschutz stellen: Eskaliere den Konflikt innerhalb von 20 Tagen an PayPal zur Klärung.",
      "Beweise einreichen: Lade alle relevanten Dokumente im Center hoch."
    ]}
    mistakes={[
      "Frist verpasst: Der Käuferschutz greift nur bis 180 Tage nach der Zahlung. Ein Konflikt muss innerhalb von 20 Tagen eskaliert werden.",
      "Sofort eskalieren ohne vorherigen Kontakt: PayPal verlangt oft einen vorherigen Lösungsversuch.",
      "Zahlung per 'Geld an Freunde senden': Hier greift der Käuferschutz nicht!"
    ]}
    faq={[
      { q: "Wie lange dauert ein PayPal Fall?", a: "Meistens entscheidet PayPal innerhalb von 14 bis 30 Tagen, sofern alle Beweise vorliegen." },
      { q: "Greift der Schutz bei digitalen Gütern?", a: "Teilweise. Seit einer Richtlinienänderung sind viele immaterielle Güter abgedeckt, aber es gelten strenge Vorgaben bezüglich des Nachweises der Nicht-Lieferung." }
    ]}
  />;
}

export function AmexSEO() {
  return <SEOArticleLayout 
    title="American Express Chargeback einleiten"
    category="Amex"
    whenApplies={[
      "Betrügerische Abbuchungen",
      "Leistung nicht erbracht (z.B. Insolvenz des Anbieters)",
      "Ware nicht erhalten oder defekt",
      "Doppelte Abbuchung"
    ]}
    evidence={[
      "Kopie der Rechnung/Reisebestätigung",
      "Nachweis über die Stornierung/Nicht-Erbringung",
      "E-Mail-Verlauf mit dem Händler",
      "Kopie der AGB des Händlers"
    ]}
    steps={[
      "Versuche das Problem direkt mit dem Händler zu lösen (und dokumentiere dies).",
      "Logge dich in dein Amex Online-Konto ein.",
      "Wähle die betreffende Buchung aus und klicke auf 'Umsatz reklamieren'.",
      "Fülle das Formular aus und beschreibe den Fall präzise.",
      "Lade die geforderten Beweisdokumente hoch."
    ]}
    mistakes={[
      "Warten auf Rückbuchung ohne zu reklamieren: Fristen (meist 120 Tage) müssen zwingend eingehalten werden.",
      "Zu wenig Beweise geliefert: Amex prüft streng. Ohne vorherigen Kontakt zum Händler wird oft direkt abgelehnt."
    ]}
    faq={[
      { q: "Ist Amex kundenfreundlich bei Chargebacks?", a: "Ja, Amex gilt im Vergleich als sehr kundenorientiert, fordert aber präzise Dokumentation." }
    ]}
  />;
}

export function VisaMastercardSEO() {
  return <SEOArticleLayout 
    title="Visa / Mastercard Chargeback: Geld zurück"
    category="Kreditkarte"
    whenApplies={[
      "Insolvenz der Fluggesellschaft oder des Reiseveranstalters",
      "Abo-Fallen (ungewollte wiederkehrende Abbuchungen)",
      "Ware nicht geliefert",
      "Betrug (Kreditkartenmissbrauch)"
    ]}
    evidence={[
      "Stornierungsbestätigung",
      "Beweis des Klärungsversuchs",
      "Nachweis über die Insolvenz (falls zutreffend)",
      "Kontoauszug mit der Fehlbuchung"
    ]}
    steps={[
      "Händler kontaktieren (schriftlich).",
      "Umsatzreklamations-Formular deiner Hausbank ausfüllen (Visa/Mastercard verweisen an die kartenausgebende Bank).",
      "Beweise anhängen (E-Mails, Screenshots).",
      "Formular fristgerecht (meist innerhalb von 120 Tagen) bei der Bank einreichen."
    ]}
    mistakes={[
      "Die Bank abwimmeln lassen: Banken behaupten oft fälschlicherweise, sie seien nicht zuständig. Bleib hartnäckig.",
      "Nur telefonisch kontaktieren: Ohne schriftliche Beweise hast du beim Chargeback schlechte Karten."
    ]}
    faq={[
      { q: "Muss meine Bank den Chargeback durchführen?", a: "Ja. Wenn die Voraussetzungen (Reason Codes) des Kreditkartennetzwerks erfüllt sind, ist die Bank verpflichtet, den Prozess einzuleiten." }
    ]}
  />;
}

export function KlarnaSEO() {
  return <SEOArticleLayout 
    title="Klarna Reklamation & Käuferschutz"
    category="Klarna"
    whenApplies={[
      "Rücksendung wurde nicht verbucht",
      "Ware nicht angekommen",
      "Ware beschädigt oder fehlerhaft"
    ]}
    evidence={[
      "Einlieferungsbeleg der Retoure (sehr wichtig!)",
      "Fotos der beschädigten Ware",
      "Kommunikation mit dem Shop"
    ]}
    steps={[
      "Logge dich in die Klarna App ein.",
      "Wähle den entsprechenden Einkauf aus.",
      "Klicke auf 'Problem melden' (Zahlungspause wird aktiviert).",
      "Wähle den Grund (z.B. 'Retoure', 'Ware nicht erhalten').",
      "Lade ggf. den Retourenbeleg hoch, falls Klarna danach fragt."
    ]}
    mistakes={[
      "Zahlungspause nicht aktiviert: Wenn du die Rechnung nicht pausierst, gerätst du in den Mahnprozess.",
      "Retourenbeleg weggeworfen: Ohne Nachweis der Rücksendung bist du zahlungspflichtig."
    ]}
    faq={[
      { q: "Was passiert, wenn der Händler sich nicht meldet?", a: "Klarna entscheidet nach Ablauf einer Frist meist zugunsten des Käufers, wenn du Beweise geliefert hast." }
    ]}
  />;
}

export function FlugSEO() {
  return <SEOArticleLayout 
    title="Flug Chargeback / Reiserückerstattung"
    category="Flug/Reise"
    whenApplies={[
      "Flug wurde von der Airline annulliert",
      "Airline ist insolvent",
      "Erstattungszusage der Airline wird nicht eingehalten"
    ]}
    evidence={[
      "Buchungsbestätigung",
      "Nachweis über die Annullierung (z.B. E-Mail der Airline)",
      "Schriftliche Aufforderung zur Erstattung mit Fristsetzung (meist 7-14 Tage)"
    ]}
    steps={[
      "Fordere die Airline schriftlich zur Rückzahlung auf und setze eine Frist.",
      "Nach Fristablauf: Kontaktiere deine Bank oder deinen Kreditkartenherausgeber.",
      "Fülle das Reklamationsformular aus (Grund: 'Leistung nicht erbracht').",
      "Hänge die Flugtickets und den E-Mail-Verlauf an."
    ]}
    mistakes={[
      "Gutschein akzeptieren: Wenn du einen Voucher akzeptierst, verlierst du das Recht auf einen Chargeback.",
      "Selbst stornieren: Wenn DU stornierst (nicht die Airline), greift das Chargeback-Recht in der Regel nicht."
    ]}
    faq={[
      { q: "Kann ich Chargeback nutzen, wenn der Flug verspätet war?", a: "Nein. Ein Chargeback gilt für NICHT erbrachte Leistungen (Annullierung). Bei Verspätungen musst du eine Entschädigung nach EU-Fluggastrechteverordnung fordern." }
    ]}
  />;
}

export function LieferandoSEO() {
  return <SEOArticleLayout 
    title="Lieferando / Essen Rückerstattung"
    category="Lieferdienst"
    whenApplies={[
      "Essen wurde nie geliefert",
      "Essen eiskalt geliefert (z.B. Fahrer hat Umweg gemacht)",
      "Falsches Gericht geliefert",
      "Essen ungenießbar/verdorbene Zutaten"
    ]}
    evidence={[
      "Fotos des falschen oder ungenießbaren Essens (sofort machen!)",
      "Screenshot des Bestellstatus in der App (insb. wenn der Fahrer einen Umweg macht)",
      "Bestellbestätigung"
    ]}
    steps={[
      "Mache umgehend Fotos von Fehlern oder dem kalten Essen.",
      "Kontaktiere den Lieferando-Support über die App oder Website.",
      "Falls keine Einigung erfolgt oder man dir nur einen 5€ Gutschein anbietet: Kontaktiere PayPal oder dein Kreditkartenunternehmen für einen Chargeback."
    ]}
    mistakes={[
      "Keine Beweisfotos gemacht: Essen direkt weggeworfen oder aufgegessen – ohne Foto keine Erstattung.",
      "Zu lange gewartet: Reklamationen bei Lebensmitteln müssen sofort erfolgen.",
      "Sich mit einem 3€ Gutschein abspeisen lassen, wenn das 30€ Essen kalt und ungenießbar war."
    ]}
    faq={[
      { q: "Muss das Restaurant oder Lieferando erstatten?", a: "Dein Vertragspartner für die Zahlung ist meist Lieferando, daher erfolgt die Erstattung über sie." },
      { q: "Essen war kalt, weil der Fahrer einen Umweg gemacht hat - Geld zurück?", a: "Ja, wenn das Essen dadurch ungenießbar ist (z.B. kalte Pommes), ist das ein klarer Mangel. Lieferando wehrt sich oft, aber über PayPal oder Kreditkarte (Chargeback) hast du gute Chancen auf eine Voll- oder Teilerstattung." }
    ]}
  />;
}

export function WoltSEO() {
  return <SEOArticleLayout 
    title="Wolt Rückerstattung (Essen kalt / nicht geliefert)"
    category="Lieferdienst"
    whenApplies={[
      "Essen komplett kalt angekommen",
      "Fehlende Artikel in der Lieferung",
      "Bestellung wurde storniert aber trotzdem abgebucht"
    ]}
    evidence={[
      "Beweisfotos vom Zustand des Essens",
      "Chat-Verlauf mit dem Wolt-Support",
      "GPS-Screenshot der Fahrer-Route (falls Umweg ersichtlich)"
    ]}
    steps={[
      "Schreibe dem Wolt In-App-Support.",
      "Mache deutlich, dass das Essen aufgrund der Lieferzeit / des Zustands mangelhaft ist.",
      "Bietet Wolt nur Wolt-Credits, bestehe auf einer Rückerstattung auf dein Zahlungsmittel.",
      "Verweigert Wolt die Rückerstattung, nutze den Chargeback-Prozess bei deiner Bank/PayPal."
    ]}
    mistakes={[
      "Wolt-Credits akzeptieren, wenn man eigentlich das Geld zurück will.",
      "Die Frist für eine Reklamation (meist 24h) verstreichen lassen."
    ]}
    faq={[
      { q: "Kann ich Chargeback machen, wenn Wolt mein Konto danach sperrt?", a: "Ja. Ein Chargeback ist dein gutes Recht bei Nichterfüllung. Wolt könnte theoretisch dein Konto sperren, was aber eher selten passiert, wenn es sich um einen berechtigten Einzelfall handelt." }
    ]}
  />;
}

export function UberEatsSEO() {
  return <SEOArticleLayout 
    title="Uber Eats Erstattung & Chargeback"
    category="Lieferdienst"
    whenApplies={[
      "Fahrer hat das Essen an die falsche Adresse geliefert",
      "Essen kalt wegen Mehrfach-Lieferungen (Stacked Orders)",
      "Bestellung nie angekommen"
    ]}
    evidence={[
      "Screenshots von der App-Tracking-Karte",
      "Fotos der Lieferung (oder Foto des Ortes, wo es fälschlicherweise abgestellt wurde)",
      "Support-Tickets in der Uber-App"
    ]}
    steps={[
      "Problem direkt in der Uber Eats App unter 'Hilfe' melden.",
      "Problem genau beschreiben (z.B. 'Bestellung nicht erhalten' oder 'Lebensmittelsicherheitsproblem').",
      "Uber Eats Support entscheidet oft automatisiert. Wenn abgelehnt: Chargeback über PayPal/Apple Pay/Kreditkarte einleiten."
    ]}
    mistakes={[
      "Sich vom Bot-Support abspeisen lassen.",
      "Die Lieferung nicht sofort bei Ankunft überprüfen."
    ]}
    faq={[
      { q: "Uber Eats Support lehnt ab, was nun?", a: "Der automatisierte Support lehnt oft erst einmal ab. Eskaliere den Fall über deinen Zahlungsdienstleister (PayPal Käuferschutz oder Kreditkarten-Chargeback)." }
    ]}
  />;
}

export function KiwiSEO() {
  return <SEOArticleLayout 
    title="Kiwi.com Steuern & Gebühren ohne 59€ Servicegebühr zurückholen"
    category="Flug/Reise"
    whenApplies={[
      "Du hast den Flug selbst storniert (nicht-erstattbares Ticket)",
      "Flug wurde verpasst (No-Show)",
      "Du willst Flughafensteuern und Gebühren zurückfordern"
    ]}
    evidence={[
      "Buchungsbestätigung",
      "Nachweis über Stornierung / No-Show",
      "Kiwi.com AGB (die eine Bearbeitungsgebühr von 59€ fordern)"
    ]}
    steps={[
      "Fordere Kiwi.com formlos auf, dir die personenbezogenen Steuern und Gebühren zu erstatten.",
      "Wenn Kiwi.com antwortet, dass sie eine Bearbeitungsgebühr (oft 59€) einbehalten: Widerspreche! Solche Gebühren sind nach gängiger Rechtsprechung (z.B. in Deutschland) für Steuerrückerstattungen unzulässig.",
      "Reagiert Kiwi.com nicht oder verweigert die volle Auszahlung: Reiche einen Chargeback bei deiner Kreditkarte ein (Grund: Guthaben nicht erstattet / Credit not processed)."
    ]}
    mistakes={[
      "Den geringen Restbetrag (nach Abzug der 59€) akzeptieren.",
      "Glauben, dass man bei nicht-erstattbaren Tickets kein Geld zurückbekommt."
    ]}
    faq={[
      { q: "Warum verlangt Kiwi.com 59€?", a: "Es ist ein Geschäftsmodell, um Kunden von der Rückforderung der Steuern abzuhalten oder daran zu verdienen. Du musst das nicht akzeptieren." },
      { q: "Wie hole ich mir die vollen Steuern zurück?", a: "Durch Hartnäckigkeit oder einen Chargeback über dein Zahlungsmittel, da dir die Gebühren gesetzlich zustehen." }
    ]}
  />;
}

export function WareNichtErhaltenSEO() {
  return <SEOArticleLayout 
    title="Chargeback: Ware nicht erhalten"
    category="Online-Shopping"
    whenApplies={[
      "Fake-Shops",
      "Paket ging auf dem Postweg verloren",
      "Händler liefert trotz Zahlung nicht"
    ]}
    evidence={[
      "Trackingnummer zeigt, dass das Paket nicht angekommen ist",
      "E-Mails an den Händler mit Bitte um Klärung",
      "Bestellbestätigung"
    ]}
    steps={[
      "Händler kontaktieren und um Nachforschung bitten.",
      "Nach angemessener Wartezeit: Bei PayPal 'Käuferschutz' oder bei der Bank 'Chargeback' beantragen.",
      "Als Grund 'Ware nicht erhalten' (Item Not Received) angeben.",
      "Kommunikationsverlauf beifügen."
    ]}
    mistakes={[
      "Nachforschungsauftrag selbst stellen: Der Händler ist der Auftraggeber des Paketdienstes und muss sich kümmern.",
      "Die Frist des Zahlungsdienstleisters (z.B. 180 Tage bei PayPal, 120 bei Kreditkarte) verpassen."
    ]}
    faq={[
      { q: "Was, wenn laut Tracking geliefert wurde, ich aber nichts habe?", a: "Das ist schwer. Du musst oft nachweisen, dass die Unterschrift gefälscht ist oder eine Anzeige bei der Polizei wegen Diebstahl erstatten, bevor die Bank / PayPal hilft." }
    ]}
  />;
}

export function AboFalleSEO() {
  return <SEOArticleLayout 
    title="Abo-Falle Chargeback"
    category="Abonnements"
    whenApplies={[
      "Kostenlose Probephase wurde unerlaubt kostenpflichtig",
      "Versteckte Kosten (kein klarer Hinweis auf ein Abo beim Kauf)",
      "Kündigung wird vom Anbieter ignoriert"
    ]}
    evidence={[
      "Screenshot der Bestellseite (falls noch möglich)",
      "E-Mail mit deiner Kündigung",
      "AGB des Anbieters"
    ]}
    steps={[
      "Kündige das Abo sofort schriftlich (E-Mail aufbewahren).",
      "Kontaktiere deine Bank oder PayPal und melde unautorisierte / ungewollte wiederkehrende Zahlungen.",
      "Lasse die Karte für diesen speziellen Händler sperren oder entziehe das SEPA-Mandat / die PayPal-Einzugsermächtigung.",
      "Beantrage Chargeback für die bereits abgebuchten Beiträge."
    ]}
    mistakes={[
      "Nur die Karte sperren: Das kündigt das Abo nicht. Du musst auch beim Händler kündigen, sonst können Inkassoforderungen kommen.",
      "Kündigung nicht beweisen können: Nutze immer schriftliche Wege, niemals nur telefonisch."
    ]}
    faq={[
      { q: "Kann ich rückwirkend für Monate Geld zurückholen?", a: "Oft nur für die letzten 8 Wochen bei SEPA oder bis zu 120 Tage bei Kreditkarten. Je früher du handelst, desto besser." }
    ]}
  />;
}
