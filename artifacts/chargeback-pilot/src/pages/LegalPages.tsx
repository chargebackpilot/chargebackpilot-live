import { MainLayout } from "@/components/layout/MainLayout";

export function Impressum() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>
        <div className="prose prose-slate max-w-none">
          <p>Angaben gemäß § 5 TMG</p>
          <p>
            <strong>ChargebackPilot GmbH (Placeholder)</strong><br />
            Musterstraße 123<br />
            10115 Berlin
          </p>
          <p>
            Handelsregister: HRB 123456<br />
            Registergericht: Amtsgericht Berlin (Charlottenburg)
          </p>
          <p>
            <strong>Vertreten durch:</strong><br />
            Max Mustermann
          </p>
          <p>
            <strong>Kontakt:</strong><br />
            Telefon: +49 (0) 30 12345678<br />
            E-Mail: kontakt@chargebackpilot.de
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
          <p>Allgemeine Hinweise. Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
          <h3>2. Hosting</h3>
          <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter...</p>
          <h3>3. Datenerfassung auf dieser Website</h3>
          <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber.</p>
          <p><em>(Dies ist ein Platzhalter-Text)</em></p>
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
          <p className="font-bold text-red-900">
            Keine Rechtsberatung. Keine Erfolgsgarantie.
          </p>
          <p>
            ChargebackPilot bietet keine Rechtsberatung, keine Rechtsdienstleistung und keine Vertretung gegenüber Banken, Zahlungsdienstleistern oder Händlern. Die Inhalte auf dieser Website und die Ergebnisse der KI-Analyse dienen ausschließlich der allgemeinen Information und als Formulierungshilfe.
          </p>
          <p>
            Wir übernehmen keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Informationen und Textvorlagen. Die Nutzung unserer Tools garantiert keinen Erfolg bei einer Zahlungsreklamation (Chargeback). Die Entscheidung über eine Rückerstattung obliegt allein der kartenausgebenden Bank bzw. dem Zahlungsdienstleister.
          </p>
          <p>
            Bei komplexen rechtlichen Auseinandersetzungen empfehlen wir dringend, einen qualifizierten Rechtsanwalt zu konsultieren.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
