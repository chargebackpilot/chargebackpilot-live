import { MainLayout } from "@/components/layout/MainLayout";
import { SeoHead } from "@/components/SeoHead";

export function Impressum() {
  return (
    <MainLayout>
      <SeoHead
        title="Impressum · ChargebackPilot"
        description="Impressum von ChargebackPilot gemäß den geltenden Informationspflichten für Online-Angebote in Deutschland."
        canonical="/impressum"
      />
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</p>
          <p>
            <strong>Till Pfeiffer</strong>
            <br />
            Am Dammgraben 100
            <br />
            60486 Frankfurt am Main
          </p>

          <p>
            <strong>Kontakt:</strong>
            <br />
            E-Mail: kontakt@chargebackpilot.de
          </p>

          <p>
            <strong>
              Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 MStV:
            </strong>
            <br />
            Till Pfeiffer
            <br />
            Am Dammgraben 100
            <br />
            60486 Frankfurt am Main
          </p>

          <p>
            <strong>Umsatzsteuer-ID:</strong>
            <br />
            Es wird derzeit die Kleinunternehmerregelung gemäß § 19 UStG angewendet. Es wird keine
            Umsatzsteuer ausgewiesen. Eine Umsatzsteuer-Identifikationsnummer liegt derzeit nicht
            vor.
          </p>

          <p>
            <strong>Verbraucherstreitbeilegung:</strong>
            <br />
            Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <p>
            <strong>Hinweis:</strong> ChargebackPilot ist ein unabhängiges Software-Angebot und
            steht in keiner Partnerschaft oder Verbindung mit den genannten Zahlungsdienstleistern,
            Plattformen oder Marken. Genannte Marken dienen ausschließlich der beschreibenden
            Einordnung.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export function Datenschutz() {
  return (
    <MainLayout>
      <SeoHead
        title="Datenschutzerklärung · ChargebackPilot"
        description="Datenschutzerklärung von ChargebackPilot mit Informationen zur Datenverarbeitung, Rechtsgrundlagen und Betroffenenrechten."
        canonical="/datenschutz"
      />
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground">Stand: 26. Juni 2026</p>

          <h2>1. Datenschutz auf einen Blick</h2>
          <p>
            Diese Datenschutzerklärung informiert Sie darüber, welche personenbezogenen Daten wir
            verarbeiten, warum dies geschieht und welche Rechte Sie haben.
          </p>

          <h2>2. Verantwortlicher</h2>
          <p>
            Verantwortlich im Sinne der DSGVO ist:
            <br />
            <strong>Till Pfeiffer</strong>
            <br />
            Am Dammgraben 100
            <br />
            60486 Frankfurt am Main
            <br />
            E-Mail: kontakt@chargebackpilot.de
          </p>

          <h2>3. Allgemeine Hinweise</h2>
          <p>
            Der Schutz Ihrer Daten ist uns wichtig. Wir verarbeiten personenbezogene Daten daher nur
            im Rahmen der gesetzlichen Regelungen.
          </p>
          <p>
            Die Übertragung von Daten im Internet ist nie vollständig risikofrei. Wir nutzen
            branchenübliche Sicherheitsmaßnahmen, um Ihre Informationen zu schützen.
          </p>

          <h2>4. Hosting und Infrastruktur</h2>
          <p>
            ChargebackPilot wird bei <strong>Render Inc.</strong> gehostet. Zur Speicherung
            notwendiger Falldaten verwenden wir <strong>Neon DB</strong>. Diese Anbieter verarbeiten
            technische Verbindungsdaten (z. B. IP-Adresse, Browsertyp, Zeitstempel) sowie die
            eingegebenen Falldaten in unserem Auftrag bzw. als technische Infrastruktur.
            Rechtsgrundlagen sind unser berechtigtes Interesse an einem sicheren und stabilen
            Betrieb (Art. 6 Abs. 1 lit. f DSGVO) sowie, bei Nutzung kostenpflichtiger Funktionen,
            die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
          </p>
          <p>
            Soweit Anbieter außerhalb der EU/des EWR eingebunden sind oder ein Zugriff aus
            Drittländern nicht ausgeschlossen werden kann, erfolgt dies auf Grundlage geeigneter
            Garantien, insbesondere EU-Standardvertragsklauseln, soweit erforderlich. Wir schließen
            mit eingesetzten Auftragsverarbeitern die jeweils erforderlichen
            Datenschutzvereinbarungen, soweit der Anbieter als Auftragsverarbeiter tätig wird.
          </p>

          <h2>4a. Bot-Schutz mit Cloudflare Turnstile</h2>
          <p>
            Zum Schutz vor automatisierten Masseneingaben kann ChargebackPilot Cloudflare Turnstile
            einsetzen. Dabei können technische Daten wie IP-Adresse, Browserinformationen,
            Interaktionsdaten und ein Prüf-Token an Cloudflare übermittelt werden. Die Verarbeitung
            dient ausschließlich der Sicherheitsprüfung und Missbrauchsabwehr. Rechtsgrundlage ist
            unser berechtigtes Interesse an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit.
            f DSGVO).
          </p>

          <h2>5. Erhobene Daten</h2>
          <p>
            Wir verarbeiten alle Daten, die Sie uns freiwillig im Formular übermitteln, z. B.
            Fallbeschreibung, Händlername, Betrag, Zahlungsart, Zahlungsdatum, Versandstatus,
            Belege-Auswahl und Hinweise aus dem Kommunikationsverlauf. Bitte geben Sie keine
            sensiblen Daten ein, die für die Erstellung der Formulierungshilfe nicht erforderlich
            sind.
          </p>

          <h2>6. Nutzung der Gemini API von Google LLC</h2>
          <p>
            Zur Strukturierung Ihrer Angaben und zur Generierung unverbindlicher Textentwürfe nutzen
            wir die Gemini API von Google LLC bzw. verbundene Google-Dienste als externen
            technischen Dienst. Dabei werden die von Ihnen eingegebenen Falldaten an Google
            übermittelt und dort zur Bearbeitung der Anfrage verarbeitet.
          </p>
          <p>
            Google LLC hat seinen Sitz in den USA. Eine Drittlandübermittlung kann daher nicht
            ausgeschlossen werden. Sie erfolgt, soweit erforderlich, auf Grundlage geeigneter
            Garantien, insbesondere EU-Standardvertragsklauseln. Vor der Nutzung der KI-Funktion
            holen wir im Formular Ihre ausdrückliche Einwilligung zur Übermittlung und Verarbeitung
            Ihrer Eingaben durch Google ein (Art. 6 Abs. 1 lit. a DSGVO). Sie können diese
            Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
          </p>

          <h2>7. Interne Nutzungsstatistik</h2>
          <p>
            Zur Verbesserung von Produkt, Stabilität und Auffindbarkeit erfassen wir eine
            datensparsame interne Nutzungsstatistik. Dabei können insbesondere aufgerufener
            Seitenpfad, Seitentitel, Zeitpunkt, eine pseudonyme Besucherkennung sowie technische
            Ereignisse wie Wizard-Schritt, Analyse-Start oder Analyse-Erfolg gespeichert werden.
            Wenn Sie im Wizard Eingaben beginnen, können zusätzlich strukturierte Angaben wie
            Zahlungsart, Problemtyp, Händlername, Betrag, Zahlungsdatum, Händlerkontakt,
            Antwortkategorie und Anzahl ausgewählter Belege als Metadaten gespeichert werden.
          </p>
          <p>
            Längere Freitexte aus der Fallbeschreibung oder aus freien Antwortfeldern werden für
            diese Nutzungsstatistik nicht gespeichert. Die Auswertung erfolgt first-party auf
            unserer eigenen Infrastruktur und wird nicht an externe Analyse- oder Werbenetzwerke
            weitergegeben. Wenn im selben Browser eine Admin-Sitzung aktiv ist, werden öffentliche
            Seitenaufrufe nicht als normale Besucheraufrufe gezählt.
          </p>

          <h2>8. Rechtsgrundlagen</h2>
          <p>
            Die Verarbeitung Ihrer Eingaben zur KI-Textgenerierung erfolgt auf Grundlage Ihrer
            freiwilligen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Die Verarbeitung zur
            Bereitstellung kostenpflichtiger digitaler Inhalte und zur Zahlungsabwicklung erfolgt
            zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO). Technische Verbindungsdaten,
            Sicherheitsprotokolle und interne Nutzungsstatistiken verarbeiten wir auf Grundlage
            unseres berechtigten Interesses an einem sicheren Betrieb, der Fehleranalyse und der
            Verbesserung unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO). Gesetzliche
            Aufbewahrungspflichten, insbesondere steuerliche Nachweise, beruhen auf Art. 6 Abs. 1
            lit. c DSGVO.
          </p>

          <h2>9. Speicherdauer</h2>
          <p>
            Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck
            erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Falldaten werden in der
            Regel nach spätestens 12 Monaten gelöscht oder anonymisiert, sofern keine gesetzlichen
            Aufbewahrungspflichten entgegenstehen. Zahlungs- und Einwilligungsnachweise können im
            Rahmen gesetzlicher Nachweis- und Aufbewahrungspflichten länger gespeichert werden.
            Interne Nutzungsstatistiken werden spätestens nach 12 Monaten gelöscht, aggregiert oder
            anonymisiert. Technische Protokolldaten können aus Sicherheitsgründen für bis zu 30 Tage
            gespeichert werden.
          </p>
          <p>
            Sie können die Löschung Ihrer Daten verlangen, soweit keine gesetzlichen
            Aufbewahrungsfristen entgegenstehen.
          </p>

          <h2>10. Weitergabe von Daten</h2>
          <p>
            Eine Weitergabe an Dritte erfolgt nur, soweit dies zur Bereitstellung des Dienstes
            notwendig ist, z. B. an Render Inc. (Hosting), Neon (Datenbank), Google LLC/Gemini
            (KI-Verarbeitung) und Stripe Payments Europe bzw. Stripe-Unternehmen
            (Zahlungsabwicklung). Stripe verarbeitet Zahlungsdaten grundsätzlich eigenverantwortlich
            nach den Stripe-Datenschutzbedingungen. Eine darüber hinausgehende Weitergabe,
            insbesondere für eigene Werbezwecke von ChargebackPilot oder an externe
            Analytics-Netzwerke, findet nicht statt.
          </p>

          <h2>11. Rechte der betroffenen Person</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Verarbeitung, Datenübertragbarkeit und Widerspruch. Sie können Ihre Einwilligung
            jederzeit widerrufen.
          </p>
          <p>Richten Sie Ihre Anfrage bitte an kontakt@chargebackpilot.de.</p>

          <h2>12. Beschwerderecht</h2>
          <p>
            Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die
            DSGVO verstößt, können Sie eine Beschwerde bei einer Datenschutzaufsichtsbehörde
            einreichen.
          </p>

          <h2>13. Änderungen der Datenschutzerklärung</h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die jeweils
            aktuelle Fassung ist auf dieser Website verfügbar.
          </p>

          <h2>14. Cookies und lokale Speicherung</h2>
          <p>
            ChargebackPilot verwendet lokale Speicherung im Browser, z. B. für Anzeige-,
            Navigations-, Zahlungsrückkehr-, Theme-, Besucherkennungs- oder Fallzustände. Diese
            Speicherung dient der Bedienbarkeit, der internen Produktstatistik und der
            Wiederherstellung begonnener Fälle. Es werden keine externen Werbe-Cookies und keine
            externen Tracking-Pixel eingesetzt.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export function UeberUns() {
  return (
    <MainLayout>
      <SeoHead
        title="Über ChargebackPilot · Verbraucherhilfe mit KI"
        description="Was ChargebackPilot ist, für wen das Tool gedacht ist und warum es keine Rechtsberatung, sondern strukturierte Verbraucherhilfe mit KI bietet."
        canonical="/ueber-uns"
      />
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Über ChargebackPilot</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            ChargebackPilot ist ein unabhängiges Software-Tool für Verbraucher, die bei
            Online-Käufen, Reisen, Lieferdiensten oder Abos strukturiert reklamieren möchten.
          </p>
          <p>
            Das Ziel ist nicht, Rechtsberatung zu ersetzen, sondern die häufig chaotische erste
            Beschwerde in eine klare, nachvollziehbare und sachliche Darstellung zu überführen.
            Nutzer sollen schneller erkennen, welche Belege relevant sein könnten, welche nächsten
            Schritte typischerweise in Betracht kommen und wie ein erstes Anschreiben formuliert
            werden kann.
          </p>
          <h2>Für wen das Tool gedacht ist</h2>
          <p>
            ChargebackPilot richtet sich an Privatpersonen in Deutschland, die eine verständliche
            Orientierung für Käuferschutz, Chargeback oder Reklamationen suchen — insbesondere bei
            typischen Verbraucherproblemen wie nicht gelieferter Ware, stornierten Flügen, falschen
            Essenslieferungen oder ungewollten Abbuchungen.
          </p>
          <h2>Was ChargebackPilot konkret verbessert</h2>
          <p>
            Viele Verbraucherfälle starten chaotisch: Screenshots liegen verstreut, Beträge sind
            unklar, Fristen werden nur ungefähr erinnert und Nachrichten an Händler klingen schnell
            emotional. ChargebackPilot hilft, diese Informationen in eine prüfbare Reihenfolge zu
            bringen: Zahlung, Bestellung, Problem, Kontaktversuch, Belege und gewünschter nächster
            Schritt.
          </p>
          <p>
            Das Tool ist besonders dann nützlich, wenn du deinen Fall gegenüber Händler, Bank,
            PayPal, Klarna oder einem anderen Zahlungsdienstleister sachlich erklären möchtest. Es
            ersetzt keine Entscheidung dieser Stellen, kann aber die Verständlichkeit deiner
            Unterlagen verbessern.
          </p>
          <h2>Unsere Leitlinien</h2>
          <ul>
            <li>Keine Erfolgsgarantien und keine erfundenen Quoten.</li>
            <li>Keine Rechtsberatung und keine Vertretung gegenüber Dritten.</li>
            <li>Klare Trennung zwischen Fakten, Vermutungen und gewünschter Prüfung.</li>
            <li>Hinweise auf Belege, Fristen und Anbieterregeln immer als Orientierung.</li>
            <li>Transparenter Umgang mit KI, Datenschutz und kostenpflichtigen Funktionen.</li>
          </ul>
          <h2>Wofür ChargebackPilot nicht gedacht ist</h2>
          <p>
            ChargebackPilot ist keine Kanzlei, keine Schlichtungsstelle und kein Vertreter gegenüber
            Banken oder Händlern. Bei komplexen Sachverhalten, hohem Streitwert oder rechtlich
            schwierigen Fällen sollte zusätzlich eine Verbraucherzentrale oder anwaltliche Beratung
            einbezogen werden.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export function Methodik() {
  return (
    <MainLayout>
      <SeoHead
        title="So funktioniert die Einschätzung · ChargebackPilot"
        description="Transparente Methodik von ChargebackPilot: Wie die KI-Einschätzung entsteht, welche Daten verwendet werden und wo die Grenzen der automatischen Orientierung liegen."
        canonical="/methodik"
      />
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">So funktioniert die Einschätzung</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            ChargebackPilot nutzt die von Nutzern eingegebenen Informationen — etwa Zahlungsart,
            Problemtyp, Händlername, Belege und Chronologie — um daraus eine strukturierte,
            indikative Einschätzung zu erzeugen.
          </p>
          <h2>Welche Daten fließen ein?</h2>
          <p>
            Berücksichtigt werden insbesondere Problemkategorie, Zahlungsweg, Beleglage, bisherige
            Kommunikation mit dem Händler und typische Fristenhinweise aus gängigen
            Verbraucherfällen.
          </p>
          <h2>Wie entsteht das Ergebnis?</h2>
          <p>
            Aus den Eingaben werden eine Fallzusammenfassung, Beweis-Checkliste, mögliche nächste
            Schritte und Textentwürfe für Händler oder Zahlungsdienstleister erzeugt. Die Ausgaben
            sollen helfen, den eigenen Fall klarer aufzubereiten.
          </p>
          <h2>Redaktionelle Qualitätslogik</h2>
          <p>
            Die Ratgeber und Vorlagen sind auf typische Such- und Nutzungssituationen ausgerichtet:
            Ware nicht erhalten, PayPal-Käuferschutz, Kreditkarten-Chargeback, Klarna-Reklamation,
            Lieferdienst-Probleme, Reiseerstattung und ungewollte Abbuchungen. Jede Seite soll
            mindestens einen konkreten nächsten Schritt, eine Beleglogik und eine klare Grenze der
            Einschätzung enthalten.
          </p>
          <p>
            Programmatic-Seiten werden nicht pauschal für Google freigegeben. Sie erhalten nur dann
            Indexierungspriorität, wenn sie genügend anbieter- und problembezogene Qualitätssignale
            enthalten. Seiten ohne ausreichenden Mehrwert bleiben noindex und werden nicht aktiv in
            der Sitemap priorisiert.
          </p>
          <h2>Wie Kurzantworten verwendet werden</h2>
          <p>
            Die Kurzantworten auf Ratgeberseiten sind als schnelle Orientierung gedacht. Sie fassen
            den Kern der Seite zusammen, ersetzen aber nicht die ausführlicheren Abschnitte,
            Beleglisten und Hinweise darunter. Der Text steht serverseitig im HTML, damit Nutzer und
            Suchmaschinen dieselbe sichtbare Information erhalten.
          </p>
          <h2>Was wir bewusst nicht machen</h2>
          <ul>
            <li>Wir behaupten nicht, dass ein Chargeback garantiert erfolgreich ist.</li>
            <li>Wir geben keine festen Fristen als verbindliche Einzelfallprüfung aus.</li>
            <li>Wir ersetzen keine Prüfung durch Bank, PayPal, Klarna, Händler oder Anwalt.</li>
            <li>Wir verwenden keine versteckten SEO-Texte, die Nutzer nicht sehen.</li>
          </ul>
          <h2>Wo liegen die Grenzen?</h2>
          <p>
            Die Einschätzung ist nicht verbindlich. Sie ersetzt keine anwaltliche Prüfung, keine
            bankinterne Bewertung und keine Entscheidung eines Zahlungsdienstleisters. Fristen,
            Anbieterregeln und Einzelfaktoren müssen immer zusätzlich geprüft werden.
          </p>
          <h2>Transparenz zur KI-Nutzung</h2>
          <p>
            Die Textgenerierung erfolgt über die Gemini API von Google LLC. Vor der Nutzung wird die
            erforderliche Einwilligung im Formular abgefragt. Weitere Details findest du in der
            Datenschutzerklärung.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export function Disclaimer() {
  return (
    <MainLayout>
      <SeoHead
        title="Disclaimer · Keine Rechtsberatung · ChargebackPilot"
        description="Wichtige Hinweise zum Leistungsumfang von ChargebackPilot: keine Rechtsberatung, keine Vertretung und keine Erfolgsgarantie."
        canonical="/disclaimer"
      />
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Disclaimer</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Keine Rechtsberatung</h2>
          <p>
            ChargebackPilot ist ein Software-Tool zur strukturierten Formulierungshilfe. Wir bieten
            keine Rechtsberatung, keine Rechtsdienstleistung und keine anwaltliche Prüfung an.
          </p>

          <h2>Keine Vertretung gegenüber Dritten</h2>
          <p>
            Wir vertreten Nutzer nicht gegenüber Händlern, Banken, Zahlungsdienstleistern,
            Plattformen oder Behörden. Alle generierten Texte müssen von Nutzern selbst geprüft,
            angepasst und eigenständig versendet werden.
          </p>

          <h2>Keine Erfolgsgarantie</h2>
          <p>
            Ob eine Rückerstattung, ein Chargeback, ein Käuferschutzantrag oder eine Reklamation
            erfolgreich ist, hängt vom Einzelfall sowie von den Regeln des jeweiligen Händlers,
            Zahlungsdienstleisters oder Kartenherausgebers ab. ChargebackPilot gibt keine Garantie
            für ein bestimmtes Ergebnis.
          </p>

          <h2>Fristen und Anbieterregeln selbst prüfen</h2>
          <p>
            Hinweise zu Fristen, Belegen und möglichen nächsten Schritten sind allgemeine
            Orientierung. Nutzer bleiben selbst dafür verantwortlich, aktuelle Fristen und
            Anforderungen direkt beim jeweiligen Anbieter zu prüfen und einzuhalten.
          </p>

          <h2>KI-gestützte Inhalte</h2>
          <p>
            Die Textentwürfe werden mithilfe künstlicher Intelligenz erstellt. Sie können
            unvollständig, ungenau oder im Einzelfall unpassend sein. Bitte prüfe jeden Entwurf
            sorgfältig, bevor du ihn verwendest.
          </p>

          <h2>Markenhinweis</h2>
          <p>
            Genannte Marken wie PayPal, Klarna, Visa, Mastercard, American Express, Lieferando,
            Wolt, Uber Eats oder andere Anbieter sind Marken der jeweiligen Rechteinhaber.
            ChargebackPilot ist unabhängig und steht in keiner Partnerschaft oder Kooperation mit
            diesen Unternehmen.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export function Widerruf() {
  return (
    <MainLayout>
      <SeoHead
        title="Widerrufsbelehrung · ChargebackPilot"
        description="Widerrufsbelehrung von ChargebackPilot mit Fristen, Voraussetzungen und Musterinformationen für Verbraucher."
        canonical="/widerruf"
      />
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Widerrufsbelehrung</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Widerrufsrecht</h2>
          <p>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
            widerrufen.
          </p>
          <p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
          <p>
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Till Pfeiffer, Am Dammgraben 100, 60486
            Frankfurt am Main, E-Mail: kontakt@chargebackpilot.de) mittels einer eindeutigen
            Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss,
            diesen Vertrag zu widerrufen, informieren.
          </p>

          <h2>Folgen des Widerrufs</h2>
          <p>
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
            erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
            zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist. Für
            diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen
            Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes
            vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
          </p>

          <div className="bg-muted/50 p-4 rounded-lg mt-6 border">
            <h3 className="font-bold mb-2">Vorzeitiges Erlöschen des Widerrufsrechts</h3>
            <p>
              Ihr Widerrufsrecht kann bei einem Vertrag über die Lieferung von nicht auf einem
              körperlichen Datenträger befindlichen digitalen Inhalten (z. B. generierte
              Textentwürfe und PDFs) vorzeitig erlöschen, wenn Sie ausdrücklich zugestimmt haben,
              dass wir mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnen, und
              Sie Ihre Kenntnis davon bestätigt haben, dass Sie dadurch bei vollständiger
              Vertragserfüllung Ihr Widerrufsrecht verlieren. Die hierfür erforderlichen Erklärungen
              werden vor Abschluss des kostenpflichtigen Vorgangs über die Pflicht-Zustimmung im
              Stripe-Checkout abgefragt und protokolliert.
            </p>
          </div>

          <h2>Muster-Widerrufstext</h2>
          <p>
            Wenn Sie den Vertrag widerrufen wollen, können Sie folgende Formulierung verwenden:
            „Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über die Nutzung von
            ChargebackPilot. Name, E-Mail-Adresse, Datum.“
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export function AGB() {
  return (
    <MainLayout>
      <SeoHead
        title="Allgemeine Geschäftsbedingungen (AGB) · ChargebackPilot"
        description="Allgemeine Geschäftsbedingungen von ChargebackPilot für Nutzung, Leistungsumfang, Vergütung und Haftung."
        canonical="/agb"
      />
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Allgemeine Nutzungsbedingungen (AGB)</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der von ChargebackPilot
            bereitgestellten Anwendung und die damit verbundenen Services.
          </p>

          <h2>2. Leistungsbeschreibung</h2>
          <p>
            ChargebackPilot stellt einen KI-basierten Assistenten zur Verfügung, der Nutzer beim
            Strukturieren ihres Sachverhalts und beim Erstellen unverbindlicher Textentwürfe
            unterstützt. Die Inhalte werden automatisch erzeugt und dienen ausschließlich als
            allgemeine Formulierungshilfe.
          </p>
          <p>
            Die KI-Generierung erfolgt über die Gemini API von Google LLC. Wir sind kein Partner
            oder Vertreter von Google LLC und bieten keinen anwaltlichen Service, keine
            Rechtsberatung, keine Rechtsprüfung und keine Vertretung gegenüber Händlern, Banken oder
            Zahlungsdienstleistern.
          </p>

          <h2>3. Anbieterstatus und Preise</h2>
          <p>
            Anbieter ist Till Pfeiffer als Diensteanbieter und Kleinunternehmer im Sinne von § 19
            UStG. Die Preise sind Endpreise; Umsatzsteuer wird nicht ausgewiesen.
          </p>

          <h2>4. Vertragsabschluss</h2>
          <p>
            Mit der Nutzung des Dienstes erklären Sie sich mit diesen Bedingungen einverstanden. Ein
            separater schriftlicher Vertrag ist nicht erforderlich.
          </p>
          <p>
            Bei kostenpflichtigen digitalen Inhalten kommt der Vertrag zustande, wenn Sie die
            erforderlichen rechtlichen Hinweise bestätigen, den Stripe-Checkout abschließen und die
            Zahlung bestätigt wird. Der Zugang zu den digitalen Inhalten wird danach technisch
            freigeschaltet.
          </p>

          <h2>5. Nutzung</h2>
          <p>
            Der Nutzer ist verpflichtet, die generierten Inhalte vor der Weiterverwendung auf
            Richtigkeit, Vollständigkeit und Angemessenheit zu prüfen. ChargebackPilot darf nicht
            als Ersatz für eine anwaltliche Beratung genutzt werden.
          </p>

          <h2>6. Leistungsumfang und Verfügbarkeit</h2>
          <p>
            Die Einzelfall-Freischaltung umfasst den Zugriff auf die für den konkreten Fall
            erzeugten digitalen Textentwürfe und Exportfunktionen. Die 12-Monats-Flatrate ermöglicht
            Freischaltungen für mehrere Fälle innerhalb des angegebenen Zeitraums, ohne dass ein
            Abonnement oder eine automatische Verlängerung entsteht. Wir bemühen uns um eine stabile
            Verfügbarkeit, übernehmen aber keine Garantie für eine jederzeit unterbrechungsfreie
            Erreichbarkeit.
          </p>

          <h2>7. Haftung</h2>
          <p>
            Die bereitgestellten Inhalte sind unverbindliche Formulierungshilfen und keine
            Rechtsberatung. Eine Haftung für Vorsatz und grobe Fahrlässigkeit bleibt unberührt. Bei
            leicht fahrlässiger Verletzung wesentlicher Vertragspflichten haften wir nur auf den
            vertragstypischen, vorhersehbaren Schaden. Im Übrigen ist die Haftung, soweit gesetzlich
            zulässig, ausgeschlossen.
          </p>

          <h2>8. Widerrufsrecht bei digitalen Inhalten</h2>
          <p>
            Dem Nutzer steht grundsätzlich ein gesetzliches Widerrufsrecht zu. Bei Verträgen über
            die Lieferung von nicht auf einem körperlichen Datenträger befindlichen digitalen
            Inhalten (wie generierte PDFs und Textentwürfe) kann dieses Widerrufsrecht vorzeitig
            erlöschen, wenn der Nutzer ausdrücklich zustimmt, dass mit der Ausführung des Vertrags
            vor Ablauf der Widerrufsfrist begonnen wird, und seine Kenntnis davon bestätigt, dass er
            dadurch bei vollständiger Vertragserfüllung sein Widerrufsrecht verliert. Die
            erforderlichen Erklärungen werden über die Pflicht-Zustimmung im Stripe-Checkout
            abgefragt und protokolliert.
          </p>

          <h2>9. Fristen und Eigenverantwortung</h2>
          <p>
            ChargebackPilot überwacht keine gesetzlichen, vertraglichen oder anbieterspezifischen
            Fristen. Hinweise zu Fristen sind allgemeine Orientierung und können je nach Anbieter,
            Land, Zahlungsart und Einzelfall abweichen. Der Nutzer bleibt selbst verantwortlich,
            Fristen direkt bei Händler, Bank oder Zahlungsdienstleister zu prüfen und einzuhalten.
          </p>

          <h2>10. Datenschutz</h2>
          <p>
            Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{" "}
            <a href="/datenschutz" className="underline hover:text-foreground">
              Datenschutzerklärung
            </a>
            .
          </p>

          <h2>11. Markenrechte</h2>
          <p>
            Alle genannten Markennamen, wie z. B. PayPal, Klarna, Visa, Mastercard, American Express
            oder Lieferando, sind geschützte Marken der jeweiligen Eigentümer. ChargebackPilot ist
            nicht mit diesen Unternehmen verbunden.
          </p>

          <h2>12. Änderungen der AGB</h2>
          <p>
            Wir können diese AGB anpassen, wenn dies aufgrund technischer, rechtlicher oder
            organisatorischer Änderungen erforderlich ist. Für bereits abgeschlossene Einmalkäufe
            gelten die zum Zeitpunkt des Kaufs einbezogenen Bedingungen, soweit gesetzlich nichts
            anderes gilt.
          </p>

          <h2>13. Schlussbestimmungen</h2>
          <p>
            Sofern gesetzlich zulässig, gilt deutsches Recht. Sollten einzelne Bestimmungen dieser
            AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
