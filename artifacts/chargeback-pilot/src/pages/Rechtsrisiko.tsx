import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AlertTriangle, ShieldCheck, FileWarning, Scale, Building2, FileText, CheckCircle2, Shield, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLogin, getAdminPassword } from "@/lib/admin-api";

const RISK_CATEGORIES = [
  {
    icon: Scale,
    title: "Rechtsdienstleistungsgesetz (RDG)",
    risk: "HOCH",
    riskColor: "bg-red-50 text-red-700 border-red-300",
    summary:
      "Wer in Deutschland gegen Entgelt Rechtsdienstleistungen für fremde Angelegenheiten erbringt, braucht eine Registrierung. Verstoß = nichtige Verträge + Abmahnung durch Verbraucherverbände + Bußgeld.",
    mitigations: [
      "Strikte Positionierung als reine Formulierungshilfe / Informationsangebot — keine individuelle Rechtsberatung",
      "KEINE Aussagen wie 'Wir setzen Ihre Ansprüche durch' oder 'Erfolgsgarantie'",
      "Immer im Konjunktiv formulieren ('könnte', 'möglicherweise') — auch in KI-Outputs",
      "Disclaimer prominent auf jeder Seite + in jedem Dokument/PDF",
      "Keine Vertretung gegenüber Banken, Händlern oder PayPal — Nutzer handelt selbst",
      "Im Zweifel anwaltliche Prüfung des Geschäftsmodells (Kostenpunkt 300–800 €)",
    ],
  },
  {
    icon: FileWarning,
    title: "UWG (Wettbewerbsrecht) — Abmahnungen",
    risk: "HOCH",
    riskColor: "bg-red-50 text-red-700 border-red-300",
    summary:
      "Verbraucherschutzverbände (vzbv), Wettbewerbszentrale und Konkurrenten mahnen unzulässige Werbung ab. Kosten pro Abmahnung: 500–2.500 € + Unterlassungserklärung mit Vertragsstrafe.",
    mitigations: [
      "KEINE unbelegten Erfolgs-Statistiken ('Über 2.400 Fälle erfolgreich' — nur wenn beweisbar)",
      "KEINE fake Live-Counter ('Bereits 47 Nutzer …') — Trick gilt als irreführend",
      "KEINE 'Geld-zurück-Garantie bei Ablehnung' — wenn nicht haltbar = Irreführung",
      "Sterne / Bewertungen nur mit echten verifizierbaren Quellen",
      "Preisangaben transparent, Gesamtbetrag inkl. MwSt. (auch bei Kleinunternehmer mit Hinweis §19 UStG)",
      "Vorher-Nachher-Beispiele nur mit Einverständnis der Originalnutzer",
    ],
  },
  {
    icon: ShieldCheck,
    title: "DSGVO / Datenschutz",
    risk: "MITTEL-HOCH",
    riskColor: "bg-orange-50 text-orange-700 border-orange-300",
    summary:
      "Übermittlung personenbezogener Daten an Google LLC (USA) für KI-Analyse ist erlaubnispflichtig (Art. 44 ff. DSGVO). Verstöße: bis 20 Mio. € oder 4 % Jahresumsatz.",
    mitigations: [
      "Klare Einwilligung des Nutzers VOR jeder KI-Verarbeitung (Checkbox, opt-in)",
      "Datenschutzerklärung beschreibt explizit Gemini API + USA-Transfer + Datenkategorien",
      "Auftragsverarbeitungsvertrag (AVV) mit Google Cloud / Vertex AI dokumentieren",
      "Nur die für Analyse zwingend nötigen Daten übermitteln (Datenminimierung)",
      "Löschkonzept: Falldaten nach z.B. 90 Tagen automatisch löschen",
      "Recht auf Auskunft + Löschung umsetzen (technisches API-Endpoint anbieten)",
      "Eigene IP-Adressen-Logs auf das gesetzliche Minimum (max. 7 Tage)",
    ],
  },
  {
    icon: Building2,
    title: "Gewerbe- und Steuerrecht",
    risk: "HOCH",
    riskColor: "bg-red-50 text-red-700 border-red-300",
    summary:
      "Sobald regelmäßig Einnahmen erzielt werden, liegt ein Gewerbe vor — auch als 'Privatperson'. Anmeldepflicht. Verstöße: Bußgeld bis 1.000 €, ggf. Steuerstrafverfahren.",
    mitigations: [
      "Gewerbeanmeldung beim Gewerbeamt (15–60 € einmalig) vor erster Einnahme",
      "Steuerliche Erfassung beim Finanzamt — Kleinunternehmer §19 UStG (bis 22.000 €/Jahr) prüfen",
      "Einnahmen-Überschuss-Rechnung (EÜR) jährlich, ggf. mit Steuerberater (200–600 €)",
      "Steuer-IDs auf Impressum, USt-IdNr. wenn umsatzsteuerpflichtig",
      "Buchhaltung sauber führen — Stripe-Reports + monatliche Rechnungen archivieren",
      "Achtung: ab Tag 1 Gewerbesteuer-Pflicht wenn Gewinn > 24.500 €/Jahr",
    ],
  },
  {
    icon: FileText,
    title: "Impressums- und TMG-Pflicht / DSA",
    risk: "HOCH",
    riskColor: "bg-red-50 text-red-700 border-red-300",
    summary:
      "Vollständiges Impressum mit Klarname + ladungsfähiger Anschrift Pflicht. Fehler = sofort abmahnfähig. Postfach reicht NICHT. Digital Services Act (DSA) erweitert Pflichten.",
    mitigations: [
      "Klarname + vollständige Anschrift (keine Briefkastenadresse)",
      "Telefonnummer ODER schnelles Kontaktformular mit garantierter Antwortzeit",
      "Aufsichtsbehörden, sofern relevant; Berufsverband (entfällt meist)",
      "OS-Plattform-Link der EU (https://ec.europa.eu/consumers/odr) bei B2C-Verkauf",
      "Verbraucherstreitschlichtung-Hinweis nach §36 VSBG (Teilnahme NEIN, mit Begründung)",
      "Cookie-Banner mit echtem Opt-In bei nicht-essentiellen Cookies (TTDSG)",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Haftung für KI-generierte Inhalte",
    risk: "MITTEL",
    riskColor: "bg-amber-50 text-amber-700 border-amber-300",
    summary:
      "Wenn die KI falsche Rechtsangaben oder Drohgebärden gegen Händler generiert, kann der Anbieter mithaften (Störerhaftung, ab 2024 EU-AI-Act).",
    mitigations: [
      "Disclaimer in jedem KI-Output (Header + PDF-Fußnote)",
      "KI-Prompt enthält ausdrücklich: 'KEINE rechtsverbindlichen Drohungen', 'KEINE harten Fristbehauptungen'",
      "Nutzer muss vor Anzeige der Ergebnisse Disclaimer aktiv akzeptieren",
      "Logging: gespeichert wird, dass Nutzer Disclaimer akzeptiert hat (mit Zeitstempel)",
      "Keine konkrete Schadenersatz- oder Strafanzeigen-Texte für Nutzer generieren",
    ],
  },
  {
    icon: Scale,
    title: "AGB-Recht (BGB §305 ff.)",
    risk: "MITTEL",
    riskColor: "bg-amber-50 text-amber-700 border-amber-300",
    summary:
      "Unwirksame AGB-Klauseln werden ersatzlos gestrichen. Überraschende Klauseln gelten nicht. Salvatorische Klausel ist nichtig. Abmahnfähig.",
    mitigations: [
      "AGB von einem auf E-Commerce spezialisierten Anwalt prüfen lassen (300–800 €)",
      "Widerrufsrecht bei digitalem Inhalt: Verzicht nur mit ausdrücklicher Bestätigung + Hinweis vor Kauf",
      "Klare Leistungsbeschreibung — was bekommt der Nutzer für 0,99 €?",
      "Salvatorische Klausel ENTFERNEN — wird in DE-AGB nicht akzeptiert",
      "Haftungsausschluss nur für leichte Fahrlässigkeit, nicht für Vorsatz / grobe Fahrlässigkeit / Personenschäden",
    ],
  },
];

const PROBABILITY_TABLE = [
  { szenario: "Abmahnung wegen unbelegter Erfolgsversprechen", wahrscheinlichkeit: "HOCH ohne Fix", kosten: "500 – 2.500 €" },
  { szenario: "Abmahnung wegen fehlerhaftem Impressum", wahrscheinlichkeit: "Sehr hoch", kosten: "200 – 800 €" },
  { szenario: "DSGVO-Beschwerde durch Nutzer", wahrscheinlichkeit: "Mittel", kosten: "Auflagen + ggf. Bußgeld" },
  { szenario: "RDG-Verfahren bei aktiver Rechtsvertretung", wahrscheinlichkeit: "Bei klarer Trennung niedrig", kosten: "Bußgeld + Untersagung" },
  { szenario: "Steuerstrafverfahren wegen fehlender Gewerbeanmeldung", wahrscheinlichkeit: "Bei höherem Umsatz mittel", kosten: "Nachzahlung + Strafe" },
  { szenario: "Schadensersatz wegen falscher KI-Vorlage", wahrscheinlichkeit: "Niedrig (mit Disclaimer)", kosten: "Streitwert-abhängig" },
];

export default function Rechtsrisiko() {
  const [authed, setAuthed] = useState(() => !!getAdminPassword());
  useEffect(() => {
    document.title = "Rechtsrisiko · ChargebackPilot (intern)";
    // discourage indexing even if accidentally crawled
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
  if (!authed) return <RechtsrisikoLogin onSuccess={() => setAuthed(true)} />;
  return <RechtsrisikoContent />;
}

function RechtsrisikoLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const ok = await adminLogin(pw);
      if (ok) onSuccess(); else setError("Falsches Passwort.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen.");
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/20 items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Interner Bereich</h1>
          <p className="text-slate-400 text-sm mt-1">Rechtsrisiko-Analyse</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
          <Input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Admin-Passwort" disabled={loading} />
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading || !pw}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Zugang freischalten"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function RechtsrisikoContent() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            Interne Risiko-Analyse für Betreiber
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            Rechtsrisiko-Prognose: Betrieb von ChargebackPilot
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-3xl">
            Strukturierte Übersicht der wichtigsten Rechtsrisiken beim Betrieb dieses Dienstes als
            Privatperson / Kleingewerbe in Deutschland — inklusive konkreter Maßnahmen zur Risikominimierung.
            Dies ist <strong>keine Rechtsberatung</strong>, sondern eine Vorbereitungs-Checkliste für ein
            späteres Gespräch mit einem Fachanwalt.
          </p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 mb-10">
          <h2 className="font-bold text-red-800 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" /> Sofort umsetzen — höchste Priorität
          </h2>
          <ol className="space-y-1.5 text-sm text-red-900 list-decimal list-inside">
            <li>Vollständiges Impressum mit Klarname + ladungsfähiger Anschrift (kein Postfach)</li>
            <li>Gewerbeanmeldung beim Gewerbeamt — vor erster Einnahme</li>
            <li>AGB + Datenschutzerklärung von Fachanwalt prüfen lassen (300–800 € einmalig)</li>
            <li>Alle Erfolgs-Statistiken/Live-Counter entfernen, sofern nicht belegbar</li>
            <li>Stripe-Konto auf den korrekten Rechtsträger (Privatperson / UG / GbR) einrichten</li>
            <li>Steuerliche Erfassung beim Finanzamt + ggf. Kleinunternehmer §19 UStG</li>
          </ol>
        </div>

        <h2 className="text-2xl font-bold mb-6">Risikokategorien im Detail</h2>
        <div className="space-y-5 mb-12">
          {RISK_CATEGORIES.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="border rounded-xl p-5 bg-card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <h3 className="font-bold text-lg leading-tight">{r.title}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${r.riskColor} whitespace-nowrap`}>
                    Risiko: {r.risk}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{r.summary}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                  Maßnahmen zur Risikominimierung
                </p>
                <ul className="space-y-1.5">
                  {r.mitigations.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-1" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold mb-4">Wahrscheinlichkeits- und Kostenüberblick</h2>
        <div className="border rounded-xl overflow-hidden mb-12">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-bold">Szenario</th>
                <th className="text-left p-3 font-bold">Eintritts­wahrscheinlich­keit</th>
                <th className="text-left p-3 font-bold">Kosten (geschätzt)</th>
              </tr>
            </thead>
            <tbody>
              {PROBABILITY_TABLE.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{row.szenario}</td>
                  <td className="p-3 text-muted-foreground">{row.wahrscheinlichkeit}</td>
                  <td className="p-3 font-semibold">{row.kosten}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <h2 className="font-bold text-emerald-900 flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5" /> Empfohlene Rechtsform für späteren Ausbau
          </h2>
          <p className="text-sm text-emerald-900 leading-relaxed mb-3">
            Solange Einnahmen unter ~10.000 €/Jahr bleiben, reicht <strong>Privatperson + Kleingewerbe</strong>.
            Ab dieser Schwelle oder spätestens bei erster Beschwerde lohnt eine{" "}
            <strong>UG (haftungsbeschränkt)</strong> mit Stammkapital 1 € — kostet ca. 300–500 € Gründung,
            schützt aber privates Vermögen vor Abmahnungen, Bußgeldern und Schadenersatz.
          </p>
          <p className="text-xs text-emerald-800">
            Versicherungen prüfen: Berufshaftpflicht (Vermögensschäden, ca. 200–400 €/Jahr) und
            Rechtsschutz mit Internet-Klausel.
          </p>
        </div>

        <p className="text-xs text-muted-foreground mt-10 text-center border-t pt-6">
          Diese Seite ist <strong>nur über direkten Link</strong> erreichbar und nicht für Endnutzer bestimmt.
          Letzte Aktualisierung: {new Date().toLocaleDateString("de-DE")}
        </p>
      </div>
    </MainLayout>
  );
}
