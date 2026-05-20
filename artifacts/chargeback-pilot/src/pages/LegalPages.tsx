import { MainLayout } from "@/components/layout/MainLayout";

export function Impressum() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>
        <div className="prose prose-slate max-w-none">
          <p>Angaben gemäß § 5 TMG</p>
          <p>
            <strong>Max Mustermann</strong><br />
            (Einzelunternehmen)<br />
            c/o Mustermann Impressum-Service GmbH<br />
            Musterstraße 123<br />
            10115 Berlin
          </p>
          <p><em>Bitte ersetzen Sie diese Musterdaten durch die tatsächlichen Betreiberinformationen Ihres Angebots. Bei Privatpersonen ohne Geschäftsadresse ist eine erworbene c/o-Adresse eines Impressum-Services rechtlich üblich, sofern diese korrekt beauftragt wurde.</em></p>

          <p>
            <strong>Kontakt:</strong><br />
            Telefon: +49 (0) 30 12345678<br />
            E-Mail: kontakt@chargebackpilot.de
          </p>

          <p>
            <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
            Max Mustermann<br />
            c/o Musterstraße 123<br />
            10115 Berlin
          </p>

          <p>
            <strong>Hinweis:</strong> ChargebackPilot ist ein unabhängiges Projekt und steht in keiner Partnerschaft oder Verbindung mit den genannten Zahlungsdienstleistern, Plattformen oder Marken.</p>
        </div>
      </div>
    </MainLayout>
  );
}

export function Datenschutz() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
        <div className="prose prose-slate max-w-none">
          <h3>1. Datenschutz auf einen Blick</h3>
          <p>Diese Datenschutzerklärung informiert Sie darüber, welche personenbezogenen Daten wir verarbeiten, warum dies geschieht und welche Rechte Sie haben.</p>

          <h3>2. Verantwortlicher</h3>
          <p>
            Verantwortlich im Sinne der DSGVO ist:<br />
            <strong>Max Mustermann</strong><br />
            Musterstraße 123<br />
            10115 Berlin<br />
            E-Mail: kontakt@chargebackpilot.de
          </p>

          <h3>3. Allgemeine Hinweise</h3>
          <p>Der Schutz Ihrer Daten ist uns wichtig. Wir verarbeiten personenbezogene Daten daher nur im Rahmen der gesetzlichen Regelungen.</p>
          <p>Die Übertragung von Daten im Internet ist nie vollständig risikofrei. Wir nutzen branchenübliche Sicherheitsmaßnahmen, um Ihre Informationen zu schützen.</p>

          <h3>4. Hosting und Infrastruktur</h3>
          <p>ChargebackPilot wird bei Render Inc. betrieben. Render verarbeitet technische Verbindungsdaten, wie IP-Adresse, Browsertyp und Zugriffszeitpunkte, in Server-Logfiles. Diese Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f DSGVO).</p>
          <p>Für die Anzeige und Bedienbarkeit der Website werden ausschließlich notwendige lokale Speichermethoden eingesetzt. Es werden keine Analyse- oder Marketing-Cookies gesetzt.</p>

          <h3>5. Erhobene Daten</h3>
          <p>Wir verarbeiten alle Daten, die Sie uns freiwillig im Formular übermitteln, z. B. Fallbeschreibung, Händlername, Betrag, Zahlungsart, Versandstatus und Hinweise aus dem Kommunikationsverlauf.</p>
          <p>Darüber hinaus können technisch erforderliche Daten erfasst werden, wie IP-Adresse, Browsertyp und Zugriffszeitpunkt, um den Dienst sicher und stabil bereitzustellen.</p>

          <h3>6. Nutzung der Gemini API von Google LLC</h3>
          <p>Zur Analyse Ihrer Angaben und zur Generierung von Textvorlagen nutzen wir die Gemini API von Google LLC. Die übermittelten Daten werden an Server von Google LLC übertragen und dort als Auftragsverarbeiter verarbeitet.</p>
          <p>Google LLC hat seinen Sitz in den USA. Die Übermittlung in ein Drittland erfolgt auf Basis der von Google bereitgestellten vertraglichen Garantien. Eine Nutzung Ihrer Daten zu eigenen Werbezwecken durch uns findet nicht statt.</p>

          <h3>7. Rechtsgrundlagen</h3>
          <p>Die Verarbeitung Ihrer Eingaben zur KI-Analyse erfolgt auf Grundlage Ihrer freiwilligen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Die Verarbeitung technischer Verbindungsdaten erfolgt auf Grundlage unseres berechtigten Interesses an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).</p>

          <h3>8. Speicherdauer</h3>
          <p>Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Sie können die Löschung Ihrer Daten verlangen, soweit keine gesetzlichen Aufbewahrungsfristen entgegenstehen.</p>

          <h3>9. Weitergabe von Daten</h3>
          <p>Eine Weitergabe an Dritte erfolgt nur, soweit dies zur Bereitstellung des Dienstes notwendig ist, z. B. an Render Inc. und Google LLC. Eine darüber hinausgehende Weitergabe, insbesondere für Werbezwecke, findet nicht statt.</p>

          <h3>10. Rechte der betroffenen Person</h3>
          <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Sie können Ihre Einwilligung jederzeit widerrufen.</p>
          <p>Richten Sie Ihre Anfrage bitte an kontakt@chargebackpilot.de.</p>

          <h3>11. Beschwerderecht</h3>
          <p>Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt, können Sie eine Beschwerde bei einer Datenschutzaufsichtsbehörde einreichen.</p>

          <h3>12. Änderungen der Datenschutzerklärung</h3>
          <p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die jeweils aktuelle Fassung ist auf dieser Website verfügbar.</p>

          <h3>13. Cookies und lokale Speicherung</h3>
          <p>Es werden keine Analyse- oder Tracking-Dienste eingesetzt. Es werden ausschließlich funktionale Daten lokal gespeichert, z. B. zur Vorhaltung von Anzeige- oder Navigationszuständen. Diese Speicherung dient der Bedienbarkeit der Anwendung und nicht der Erstellung von Nutzerprofilen.</p>
        </div>
      </div>
    </MainLayout>
  );
}

export function Disclaimer() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8 text-red-600">Rechtlicher Hinweis (Disclaimer)</h1>
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl prose prose-slate max-w-none">
          <p className="font-bold text-red-900 text-xl">Keine Rechtsberatung. Keine Erfolgsgarantie.</p>
          <p>ChargebackPilot ist ein reines Software- und Textgenerierungs-Werkzeug. Wir bieten <strong>keine Rechtsberatung, keine Rechtsdienstleistung (nach RDG) und keine Prozessvertretung</strong> gegenüber Banken, Zahlungsdienstleistern oder Händlern.</p>
          <p>Alle Inhalte auf dieser Website und sämtliche generierten Textvorlagen dienen ausschließlich der allgemeinen Information und als unverbindliche Formulierungshilfe. Die Auswertung basiert auf technischen Algorithmen der Gemini API von Google LLC und ersetzt keine anwaltliche Prüfung.</p>
          <p>Wir übernehmen keine Gewähr für die Richtigkeit, Vollständigkeit oder rechtliche Verwendbarkeit der bereitgestellten Inhalte. Die Nutzung unserer Tools garantiert keinen Erfolg bei einer Zahlungsreklamation (Chargeback) oder einem sonstigen Rechtsverfahren.</p>
          <p>Fristwahrung liegt in Ihrer Verantwortung. Wir überwachen keine gesetzlichen oder vertraglichen Fristen. Das Versäumen von Fristen kann zum Verlust Ihrer Ansprüche führen.</p>
          <p>Prüfen und passen Sie alle generierten Texte vor dem Versenden stets selbstständig an. Eine Verwendung ohne eigene Prüfung erfolgt auf Ihr eigenes Risiko.</p>
        </div>
      </div>
    </MainLayout>
  );
}

export function AGB() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Allgemeine Nutzungsbedingungen (AGB)</h1>
        <div className="prose prose-slate max-w-none">
          <h3>1. Geltungsbereich</h3>
          <p>Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der von ChargebackPilot bereitgestellten Anwendung und die damit verbundenen Services.</p>

          <h3>2. Leistungsbeschreibung</h3>
          <p>ChargebackPilot stellt einen KI-basierten Assistenten zur Verfügung, der Nutzern beim Strukturieren von Fällen und beim Erstellen von Textvorlagen unterstützt. Die Inhalte werden automatisch erzeugt und dienen als unverbindliche Orientierungshilfe.</p>
          <p>Die KI-Analyse erfolgt über die Gemini API von Google LLC. Wir sind kein Partner oder Vertreter von Google LLC und bieten keinen anwaltlichen Service.</p>

          <h3>3. Vertragsabschluss</h3>
          <p>Mit der Nutzung des Dienstes erklären Sie sich mit diesen Bedingungen einverstanden. Ein separater schriftlicher Vertrag ist nicht erforderlich.</p>

          <h3>4. Nutzung</h3>
          <p>Der Nutzer ist verpflichtet, die generierten Inhalte vor der Weiterverwendung auf Richtigkeit, Vollständigkeit und Angemessenheit zu prüfen. ChargebackPilot darf nicht als Ersatz für eine anwaltliche Beratung genutzt werden.</p>

          <h3>5. Haftung</h3>
          <p>Die Nutzung der Anwendung erfolgt auf eigene Verantwortung. Wir haften nicht für Schäden, die aus der Verwendung der bereitgestellten Informationen oder Vorlagen entstehen, insbesondere nicht für entgangene Gewinne, Rechtsnachteile oder verpasste Fristen.</p>

          <h3>6. Fristen</h3>
          <p>ChargebackPilot überwacht keine gesetzlichen oder vertraglichen Fristen. Der Nutzer ist selbst verantwortlich für die Einhaltung aller Fristen, insbesondere bei Zahlungsdienstleistern und Banken.</p>

          <h3>7. Datenschutz</h3>
          <p>Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer <a href="/datenschutz" className="underline hover:text-foreground">Datenschutzerklärung</a>.</p>

          <h3>8. Markenrechte</h3>
          <p>Alle genannten Markennamen, wie z. B. PayPal, Klarna, Visa, Mastercard, American Express oder Lieferando, sind geschützte Marken der jeweiligen Eigentümer. ChargebackPilot ist nicht mit diesen Unternehmen verbunden.</p>

          <h3>9. Verfügbarkeit</h3>
          <p>Wir bemühen uns um die bestmögliche Verfügbarkeit des Dienstes, übernehmen jedoch keine Garantie für eine ununterbrochene Verfügbarkeit.</p>

          <h3>10. Änderungsvorbehalt</h3>
          <p>Wir behalten uns das Recht vor, diese AGB jederzeit anzupassen. Für wiederkehrende Nutzer gelten die jeweils aktuellen Bedingungen.</p>

          <h3>11. Schlussbestimmungen</h3>
          <p>Sofern gesetzlich zulässig, gilt deutsches Recht. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
        </div>
      </div>
    </MainLayout>
  );
}
