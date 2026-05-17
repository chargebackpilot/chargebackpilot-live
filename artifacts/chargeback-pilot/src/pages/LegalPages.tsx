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
          <p><em>(Hinweis für Betreiber: Setze hier deinen echten Namen ein. Um deine Privatadresse zu schützen, buche einen Impressum-Service wie Autorenschild oder Block Services und trage deren "c/o" Adresse hier ein.)</em></p>
          
          <p>
            <strong>Kontakt:</strong><br />
            Telefon: +49 (0) 30 12345678 (Optional / Service-Nummer)<br />
            E-Mail: kontakt@chargebackpilot.de
          </p>

          <p>
            <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
            Max Mustermann<br />
            c/o Musterstraße 123<br />
            10115 Berlin
          </p>
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
          <p>Allgemeine Hinweise: Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
          
          <h3>2. Hosting</h3>
          <p>Wir hosten unsere Website bei Vercel Inc. (bzw. Render). Der Anbieter speichert typischerweise Verbindungsdaten, einschließlich IP-Adressen, in Server-Logfiles. Dies geschieht auf Grundlage unseres berechtigten Interesses an einer zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO).</p>

          <h3>3. Datenerfassung auf dieser Website (Generierung durch Künstliche Intelligenz)</h3>
          <p>Wir nutzen zur Auswertung von Fallbeschreibungen und zur Generierung von Texten die API von Google LLC (Gemini API). Wenn Sie unser Formular nutzen, werden die von Ihnen eingegebenen Texte (Fallbeschreibung, Händlername, Betrag) an Server von Google (möglicherweise auch in den USA) übertragen.</p>
          <p><strong>Rechtsgrundlage:</strong> Die Verarbeitung erfolgt ausschließlich auf Grundlage Ihrer ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie durch das Bestätigen der Checkbox vor der Analyse erteilen.</p>
          <p><strong>Datenvermeidung:</strong> Wir fordern Sie ausdrücklich dazu auf, im Textfeld keine sensiblen personenbezogenen Daten (wie Passwörter, vollständige IBANs, Ausweisnummern oder Gesundheitsdaten) einzugeben. Laden Sie keine personenbezogenen Anhänge hoch.</p>

          <h3>4. Rechte der betroffenen Person</h3>
          <p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer bei uns gespeicherten personenbezogenen Daten. Da wir Ihre Daten jedoch (insbesondere die Fallanalysen) nicht dauerhaft an Ihr Profil gebunden speichern (sofern kein Nutzerkonto angelegt wird), können wir Anfragen nur bedingt ausführen, wenn uns keine Identifikation möglich ist.</p>
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
          <p className="font-bold text-red-900 text-xl">
            Wir leisten keine Rechtsberatung!
          </p>
          <p>
            ChargebackPilot ist ein reines Software- und Textgenerierungs-Werkzeug. Wir bieten <strong>keine Rechtsberatung, keine Rechtsdienstleistung (nach RDG) und vertreten Sie nicht</strong> gegenüber Banken, Zahlungsdienstleistern oder Händlern. 
          </p>
          <p>
            Die Inhalte auf dieser Website und die Ergebnisse der KI-Analyse (einschließlich aller generierten Anschreiben) dienen ausschließlich der allgemeinen Information und als unverbindliche Formulierungshilfe. Die Auswertung von "starken" oder "schwachen" Fallkonstellationen basiert rein auf technischen Algorithmen (Künstliche Intelligenz) und stellt keine verbindliche juristische Prüfung dar.
          </p>
          <p>
            Wir übernehmen keine Gewähr für die Richtigkeit, Vollständigkeit oder juristische Verwendbarkeit der bereitgestellten Textvorlagen. Die Nutzung unserer Tools garantiert keinen Erfolg bei einer Zahlungsreklamation (Chargeback).
          </p>
          <p>
            <strong>Fristen:</strong> Wir überwachen keine gesetzlichen oder vertraglichen Fristen. Das Versäumen von Fristen kann zum Verlust von Rechten führen. Die Überwachung obliegt allein dem Nutzer.
          </p>
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
          <p>Diese Nutzungsbedingungen gelten für die Nutzung der von ChargebackPilot zur Verfügung gestellten Software und Informationsinhalte.</p>

          <h3>2. Leistungsbeschreibung & Keine Rechtsberatung</h3>
          <p>ChargebackPilot stellt einen Text-Generator auf Basis Künstlicher Intelligenz zur Verfügung. Das Tool hilft Nutzern, Sachverhalte zu strukturieren und Entwürfe für den Kontakt mit Banken oder Händlern zu erstellen. <strong>Es findet keine rechtliche Prüfung des Einzelfalls durch juristisches Personal statt. Die Plattform betreibt keine Rechtsberatung im Sinne des Rechtsdienstleistungsgesetzes (RDG).</strong></p>

          <h3>3. Haftungsausschluss (KI-Halluzinationen & Fehler)</h3>
          <p>Die generierten Texte werden durch maschinelles Lernen erstellt. Die Software kann ungenaue, veraltete oder falsche Informationen (sog. Halluzinationen) erzeugen. Der Nutzer ist verpflichtet, die generierten Dokumente vor der Verwendung sorgfältig auf Richtigkeit und Plausibilität zu prüfen. Wir haften nicht für Schäden, die aus der Nutzung der generierten Vorlagen entstehen (z.B. abgelehnte Chargebacks, rechtliche Nachteile, verpasste Fristen).</p>

          <h3>4. Fristen</h3>
          <p>Die Software dient nicht der Fristenüberwachung. Der Nutzer ist für die Wahrung jeglicher Fristen der Zahlungsdienstleister oder der gesetzlichen Gewährleistung selbst verantwortlich.</p>

          <h3>5. Markenrechtlicher Hinweis</h3>
          <p>Alle genannten Marken, Bezeichnungen (z.B. PayPal, Klarna, Visa, Mastercard, American Express) sind eingetragene Warenzeichen der jeweiligen Eigentümer. ChargebackPilot ist kein Partner dieser Unternehmen und handelt völlig unabhängig.</p>

          <h3>6. Verfügbarkeit</h3>
          <p>Wir bemühen uns um eine ständige Verfügbarkeit des Dienstes, übernehmen hierfür jedoch keine Garantie. Wir behalten uns vor, den Dienst jederzeit einzuschränken oder einzustellen.</p>
        </div>
      </div>
    </MainLayout>
  );
}
