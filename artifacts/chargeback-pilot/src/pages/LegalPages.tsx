import { MainLayout } from "@/components/layout/MainLayout";

export function Impressum() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>
        <div className="prose prose-slate max-w-none">
          <p>Angaben gemäß § 5 TMG</p>
          <p>
            <strong>Till Pfeiffer</strong><br />
            Am Dammgraben 100<br />
            60486 Frankfurt am Main
          </p>

          <p>
            <strong>Kontakt:</strong><br />
            E-Mail: kontakt@chargebackpilot.de
          </p>

          <p>
            <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
            Till Pfeiffer<br />
            Am Dammgraben 100<br />
            60486 Frankfurt am Main
          </p>

          <p>
            <strong>Umsatzsteuer-ID:</strong><br />
            Derzeit liegt keine Umsatzsteuer-Identifikationsnummer vor.
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
          <h2>1. Datenschutz auf einen Blick</h2>
          <p>Diese Datenschutzerklärung informiert Sie darüber, welche personenbezogenen Daten wir verarbeiten, warum dies geschieht und welche Rechte Sie haben.</p>

          <h2>2. Verantwortlicher</h2>
          <p>
            Verantwortlich im Sinne der DSGVO ist:<br />
            <strong>Till Pfeiffer</strong><br />
            Am Dammgraben 100<br />
            60486 Frankfurt am Main<br />
            E-Mail: kontakt@chargebackpilot.de
          </p>

          <h2>3. Allgemeine Hinweise</h2>
          <p>Der Schutz Ihrer Daten ist uns wichtig. Wir verarbeiten personenbezogene Daten daher nur im Rahmen der gesetzlichen Regelungen.</p>
          <p>Die Übertragung von Daten im Internet ist nie vollständig risikofrei. Wir nutzen branchenübliche Sicherheitsmaßnahmen, um Ihre Informationen zu schützen.</p>

          <h2>4. Hosting und Infrastruktur</h2>
          <p>ChargebackPilot wird bei <strong>Render Inc.</strong> (Serverstandort: Frankfurt am Main, EU) gehostet. Zur Speicherung notwendiger Falldaten verwenden wir <strong>Neon DB</strong> (Serverstandort: EU). Diese Dienste verarbeiten technische Verbindungsdaten (wie IP-Adresse, Browsertyp) sowie die eingegebenen Daten in unserem Auftrag und auf Grundlage unseres berechtigten Interesses an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f DSGVO) sowie zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).</p>

          <h2>5. Erhobene Daten</h2>
          <p>Wir verarbeiten alle Daten, die Sie uns freiwillig im Formular übermitteln, z. B. Fallbeschreibung, Händlername, Betrag, Zahlungsart, Versandstatus und Hinweise aus dem Kommunikationsverlauf.</p>

          <h2>6. Nutzung der Gemini API von Google LLC</h2>
          <p>Zur Strukturierung Ihrer Angaben und zur Generierung von Textvorlagen nutzen wir die Gemini API von Google LLC. Die übermittelten Daten (Fallbeschreibungen ohne unmittelbaren Personenbezug) werden an Server von Google LLC übertragen und dort als Auftragsverarbeiter verarbeitet.</p>
          <p>Google LLC hat seinen Sitz in den USA. Die Übermittlung in ein Drittland erfolgt auf Basis der von Google bereitgestellten Standardvertragsklauseln. Vor der Nutzung dieses Dienstes holen wir im Formular Ihre ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) ein.</p>

          <h2>7. Rechtsgrundlagen</h2>
          <p>Die Verarbeitung Ihrer Eingaben zur KI-Textgenerierung erfolgt auf Grundlage Ihrer freiwilligen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Die Verarbeitung technischer Verbindungsdaten erfolgt auf Grundlage unseres berechtigten Interesses an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).</p>

          <h2>8. Speicherdauer</h2>
          <p>Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Sie können die Löschung Ihrer Daten verlangen, soweit keine gesetzlichen Aufbewahrungsfristen entgegenstehen.</p>

          <h2>9. Weitergabe von Daten</h2>
          <p>Eine Weitergabe an Dritte erfolgt nur, soweit dies zur Bereitstellung des Dienstes notwendig ist, z. B. an Render Inc., Neon und Google LLC. Zur Abwicklung von Zahlungen nutzen wir den Zahlungsdienstleister Stripe. Eine darüber hinausgehende Weitergabe, insbesondere für Werbezwecke, findet nicht statt.</p>

          <h2>10. Rechte der betroffenen Person</h2>
          <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Sie können Ihre Einwilligung jederzeit widerrufen.</p>
          <p>Richten Sie Ihre Anfrage bitte an kontakt@chargebackpilot.de.</p>

          <h2>11. Beschwerderecht</h2>
          <p>Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt, können Sie eine Beschwerde bei einer Datenschutzaufsichtsbehörde einreichen.</p>

          <h2>12. Änderungen der Datenschutzerklärung</h2>
          <p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die jeweils aktuelle Fassung ist auf dieser Website verfügbar.</p>

          <h2>13. Cookies und lokale Speicherung</h2>
          <p>Es werden keine Analyse- oder Tracking-Dienste eingesetzt. Es werden ausschließlich funktionale Daten lokal gespeichert, z. B. zur Vorhaltung von Anzeige- oder Navigationszuständen. Diese Speicherung dient der Bedienbarkeit der Anwendung und nicht der Erstellung von Nutzerprofilen.</p>
        </div>
      </div>
    </MainLayout>
  );
}

export function Widerruf() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Widerrufsbelehrung</h1>
        <div className="prose prose-slate max-w-none">
          <h2>Widerrufsrecht</h2>
          <p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
          <p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
          <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Till Pfeiffer, Am Dammgraben 100, 60486 Frankfurt am Main, E-Mail: kontakt@chargebackpilot.de) mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.</p>

          <h2>Folgen des Widerrufs</h2>
          <p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.</p>

          <div className="bg-muted/50 p-4 rounded-lg mt-6 border">
            <h3 className="font-bold mb-2">Vorzeitiges Erlöschen des Widerrufsrechts</h3>
            <p>Ihr Widerrufsrecht erlischt bei einem Vertrag über die Lieferung von nicht auf einem körperlichen Datenträger befindlichen digitalen Inhalten (z. B. den sofort generierten Textvorlagen und PDFs) vorzeitig, wenn Sie ausdrücklich zugestimmt haben, dass wir mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnen und Sie Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre Zustimmung mit Beginn der Ausführung des Vertrags Ihr Widerrufsrecht verlieren. Diese Zustimmung erfragen wir vor dem Kaufabschluss.</p>
          </div>
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
          <h2>1. Geltungsbereich</h2>
          <p>Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der von ChargebackPilot bereitgestellten Anwendung und die damit verbundenen Services.</p>

          <h2>2. Leistungsbeschreibung</h2>
          <p>ChargebackPilot stellt einen KI-basierten Assistenten zur Verfügung, der Nutzern beim Erstellen von Textvorlagen unterstützt. Die Inhalte werden automatisch erzeugt und dienen als unverbindliche Formulierungshilfe.</p>
          <p>Die KI-Generierung erfolgt über die Gemini API von Google LLC. Wir sind kein Partner oder Vertreter von Google LLC und bieten keinen anwaltlichen Service.</p>

          <h2>3. Vertragsabschluss</h2>
          <p>Mit der Nutzung des Dienstes erklären Sie sich mit diesen Bedingungen einverstanden. Ein separater schriftlicher Vertrag ist nicht erforderlich.</p>

          <h2>4. Nutzung</h2>
          <p>Der Nutzer ist verpflichtet, die generierten Inhalte vor der Weiterverwendung auf Richtigkeit, Vollständigkeit und Angemessenheit zu prüfen. ChargebackPilot darf nicht als Ersatz für eine anwaltliche Beratung genutzt werden.</p>

          <h2>5. Haftung</h2>
          <p>Die Nutzung der Anwendung erfolgt auf eigene Verantwortung. Wir haften nicht für Schäden, die aus der Verwendung der bereitgestellten Informationen oder Vorlagen entstehen, insbesondere nicht für entgangene Gewinne, Rechtsnachteile oder verpasste Fristen.</p>
          
          <h2>6. Widerrufsrecht bei digitalen Inhalten</h2>
          <p>Dem Nutzer steht grundsätzlich ein gesetzliches Widerrufsrecht zu. Bei Verträgen über die Lieferung von nicht auf einem körperlichen Datenträger befindlichen digitalen Inhalten (wie generierte PDFs und Textvorlagen) erlischt dieses Widerrufsrecht jedoch vorzeitig, wenn der Nutzer ausdrücklich zustimmt, dass mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist begonnen wird, und seine Kenntnis davon bestätigt, dass er durch diese Zustimmung mit Beginn der Vertragsausführung sein Widerrufsrecht verliert. Diese Zustimmung wird im Bezahlvorgang eingeholt.</p>

          <h2>7. Fristen</h2>
          <p>ChargebackPilot überwacht keine gesetzlichen oder vertraglichen Fristen. Der Nutzer ist selbst verantwortlich für die Einhaltung aller Fristen, insbesondere bei Zahlungsdienstleistern und Banken.</p>

          <h2>8. Datenschutz</h2>
          <p>Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer <a href="/datenschutz" className="underline hover:text-foreground">Datenschutzerklärung</a>.</p>

          <h2>9. Markenrechte</h2>
          <p>Alle genannten Markennamen, wie z. B. PayPal, Klarna, Visa, Mastercard, American Express oder Lieferando, sind geschützte Marken der jeweiligen Eigentümer. ChargebackPilot ist nicht mit diesen Unternehmen verbunden.</p>

          <h2>10. Verfügbarkeit</h2>
          <p>Wir bemühen uns um die bestmögliche Verfügbarkeit des Dienstes, übernehmen jedoch keine Garantie für eine ununterbrochene Verfügbarkeit.</p>

          <h2>11. Änderungsvorbehalt</h2>
          <p>Wir behalten uns das Recht vor, diese AGB jederzeit anzupassen. Für wiederkehrende Nutzer gelten die jeweils aktuellen Bedingungen.</p>

          <h2>12. Schlussbestimmungen</h2>
          <p>Sofern gesetzlich zulässig, gilt deutsches Recht. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
        </div>
      </div>
    </MainLayout>
  );
}
