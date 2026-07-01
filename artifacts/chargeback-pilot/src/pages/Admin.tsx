import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  LogOut,
  TrendingUp,
  Euro,
  Users,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Filter,
  Calendar,
  Activity,
  UnlockKeyhole,
  XCircle,
  BarChart3,
  FileSearch,
  Archive,
  Trash2,
  DatabaseZap,
  Download,
} from "lucide-react";
import { getAllSeoQualityResults, SEO_QUALITY_CONFIG } from "@/seo-quality";
import {
  activateFlatrate,
  clearFlatrate,
  getFlatrateExpiry,
  isFlatrateActive,
  listSavedCases,
  markCaseIdUnlocked,
} from "@/lib/case-persistence";
import {
  anonymizeAdminCase,
  anonymizeOldAdminCases,
  adminLogin,
  clearAdminPassword,
  deleteAdminCase,
  getAdminPassword,
  getAdminStats,
  getAdminCases,
  type AdminStats,
  type AdminCaseRow,
} from "@/lib/admin-api";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paypal: "PayPal",
  credit_card: "Kreditkarte",
  amex: "Amex",
  klarna: "Klarna",
  apple_google_pay: "Apple/Google Pay",
  sepa: "SEPA-Lastschrift",
  bank_transfer: "Überweisung",
};

const PROBLEM_TYPE_LABELS: Record<string, string> = {
  not_received: "Ware nicht erhalten",
  defective: "Defekte/falsche Ware",
  not_as_described: "Nicht wie beschrieben",
  food_delivery: "Lieferdienst-Problem",
  flight_cancelled: "Flug ausgefallen",
  subscription_trap: "Abo-Falle",
  double_charge: "Doppelte Belastung",
  unauthorized: "Unbekannte Abbuchung",
  fraud: "Shop-/Missbrauchsverdacht",
  other: "Sonstiges",
};

function labelPayment(m: string) {
  return PAYMENT_METHOD_LABELS[m] ?? m;
}
function labelProblem(t: string) {
  return PROBLEM_TYPE_LABELS[t] ?? t;
}

function csvCell(value: unknown) {
  const text =
    value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function exportTopContentCsv(rows: AdminStats["topContentPages"], rangeDays: number) {
  downloadCsv(
    `chargebackpilot-content-${rangeDays}d.csv`,
    ["URL", "Aufrufe", "Besucher", "Zuletzt gesehen"],
    rows.map((row) => [row.path, row.views, row.visitors, row.lastSeen])
  );
}

function exportWizardEventsCsv(rows: AdminStats["latestWizardEvents"]) {
  downloadCsv(
    "chargebackpilot-wizard-events.csv",
    ["Event", "Zeitpunkt", "Schritt", "Zahlungsart", "Problem", "Land", "Kontakt", "Belege"],
    rows.map((row) => {
      const meta = row.metadata ?? {};
      return [
        row.eventType,
        row.createdAt,
        String(meta.step ?? ""),
        String(meta.paymentMethod ?? ""),
        String(meta.problemType ?? ""),
        String(meta.merchantCountry ?? ""),
        meta.merchantContacted === true ? "ja" : meta.merchantContacted === false ? "nein" : "",
        String(meta.evidenceCount ?? ""),
      ];
    })
  );
}

function exportCasesCsv(rows: AdminCaseRow[], onlyPaid: boolean) {
  downloadCsv(
    `chargebackpilot-faelle${onlyPaid ? "-bezahlt" : ""}.csv`,
    ["ID", "Erstellt", "Haendler", "Problem", "Zahlungsart", "Betrag", "Score", "Bezahlt"],
    rows.map((row) => [
      row.id,
      row.createdAt,
      row.merchantName,
      row.problemType,
      row.paymentMethod,
      row.amount,
      row.successProbability,
      row.paid ? "ja" : "nein",
    ])
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => !!getAdminPassword());

  useEffect(() => {
    document.title = "Admin · ChargebackPilot";
  }, []);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }
  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await adminLogin(pw);
      if (ok) onSuccess();
      else setError("Falsches Passwort.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/20 items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin-Bereich</h1>
          <p className="text-slate-400 text-sm mt-1">ChargebackPilot</p>
        </div>
        <form
          onSubmit={submit}
          className="bg-white text-slate-950 rounded-2xl shadow-2xl p-6 space-y-4"
        >
          <div>
            <label className="text-sm font-semibold block mb-2">Passwort</label>
            <Input
              type="password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Admin-Passwort"
              disabled={loading}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading || !pw}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Einloggen"}
          </Button>
        </form>
        <p className="text-center text-xs text-slate-500 mt-4">
          Zugang nur für autorisierte Personen. Passwort konfiguriert via{" "}
          <code>ADMIN_PASSWORD</code>.
        </p>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cases, setCases] = useState<AdminCaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [onlyPaid, setOnlyPaid] = useState(false);
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const seoQualityRows = getAllSeoQualityResults();
  const seoIndexable = seoQualityRows.filter((row) => row.status === "index").length;
  const seoCandidates = seoQualityRows.length - seoIndexable;
  const nextSeoRelease = getNextSeoRelease(seoQualityRows);
  const averageSeoScore =
    seoQualityRows.length > 0
      ? Math.round(seoQualityRows.reduce((sum, row) => sum + row.score, 0) / seoQualityRows.length)
      : 0;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, c] = await Promise.all([getAdminStats(rangeDays), getAdminCases(onlyPaid, 100)]);
      setStats(s);
      setCases(c.cases);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Fehler beim Laden";
      setError(msg);
      if (msg === "Nicht autorisiert") {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [onlyPaid, rangeDays]);

  const logout = () => {
    clearAdminPassword();
    onLogout();
    setLocation("/admin");
  };

  const handleAnonymizeCase = async (id: string) => {
    if (!window.confirm(`Fall #${id} wirklich anonymisieren?`)) return;
    setActionMessage("");
    try {
      await anonymizeAdminCase(id);
      setActionMessage(`Fall #${id} wurde anonymisiert.`);
      await load();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Anonymisieren fehlgeschlagen.");
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (
      !window.confirm(`Fall #${id} dauerhaft löschen? Das kann nicht rückgängig gemacht werden.`)
    ) {
      return;
    }
    setActionMessage("");
    try {
      await deleteAdminCase(id);
      setActionMessage(`Fall #${id} wurde gelöscht.`);
      await load();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* Top bar */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-base">Admin-Dashboard</h1>
              <p className="text-xs text-muted-foreground">ChargebackPilot</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading} className="gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Aktualisieren</span>
            </Button>
            <Button size="sm" variant="outline" onClick={logout} className="gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {actionMessage && (
          <div className="flex items-center gap-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg px-4 py-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            {actionMessage}
          </div>
        )}

        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Kpi
                icon={Users}
                label="Admin-Fälle"
                value={stats.totalCases}
                sub={`+${stats.cases24h} in 24 h`}
                accent="blue"
              />
              <Kpi
                icon={CheckCircle2}
                label="Bezahlt"
                value={stats.paidCases}
                sub={`+${stats.paid24h} in 24 h`}
                accent="emerald"
              />
              <Kpi
                icon={TrendingUp}
                label="Conversion"
                value={`${stats.conversionRate}%`}
                sub="Frei → Bezahlt"
                accent="amber"
              />
              <Kpi
                icon={Euro}
                label="Umsatz"
                value={`${stats.revenueEur.toFixed(2)} €`}
                sub="Brutto, einmalig"
                accent="violet"
              />
            </div>

            {/* Activity summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <StatBlock
                label="Letzte 24 Stunden"
                value={stats.cases24h}
                sub="neue Fälle"
                icon={Activity}
              />
              <StatBlock
                label="Letzte 7 Tage"
                value={stats.cases7d}
                sub="neue Fälle"
                icon={Calendar}
              />
              <StatBlock
                label="Letzte 30 Tage"
                value={stats.cases30d}
                sub="neue Fälle"
                icon={Calendar}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
              <StatBlock
                label={`Content-Aufrufe ${stats.rangeDays} Tage`}
                value={stats.traffic.pageViewsRange}
                sub={`${stats.traffic.visitorsRange} Besucher`}
                icon={BarChart3}
              />
              <StatBlock
                label="Content-Aufrufe 24 Stunden"
                value={stats.traffic.pageViews24h}
                sub="öffentliche Seiten"
                icon={FileSearch}
              />
              <StatBlock
                label="Wizard-Starts 7 Tage"
                value={stats.traffic.wizardStarts7d}
                sub={`${stats.traffic.analysisSubmits7d} Analysen`}
                icon={Activity}
              />
              <StatBlock
                label="Legacy ausgeblendet"
                value={stats.hiddenLegacyCases}
                sub={`seit ${new Date(stats.visibleCasesSince).toLocaleDateString("de-DE")}`}
                icon={Archive}
              />
            </div>

            <div className="flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Admin-Sitzungen in diesem Browser werden nicht als normale Besucher gezählt.
                Analytics-Daten laufen nach {stats.analyticsRetentionMonths} Monaten automatisch
                aus.
              </p>
              <RangeSwitch value={rangeDays} onChange={setRangeDays} />
            </div>

            <SecurityStatusPanel stats={stats} />

            <FunnelPanel stats={stats} />

            {/* Daily chart */}
            <Card title="Tägliches Aufkommen (30 Tage)">
              <DailyChart series={stats.dailySeries} />
            </Card>

            {/* Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card title="Dokumentationslage">
                <DistributionBars
                  data={stats.byStrength.map((s) => ({
                    label:
                      s.strength === "stark"
                        ? "Stark"
                        : s.strength === "mittel"
                          ? "Mittel"
                          : s.strength === "schwach"
                            ? "Schwach"
                            : s.strength,
                    count: s.count,
                    color:
                      s.strength === "stark"
                        ? "bg-emerald-500"
                        : s.strength === "mittel"
                          ? "bg-amber-500"
                          : "bg-red-500",
                  }))}
                />
              </Card>
              <Card title="Zahlungsarten">
                <DistributionBars
                  data={stats.byPaymentMethod.map((p) => ({
                    label: labelPayment(p.method),
                    count: p.count,
                    color: "bg-blue-500",
                  }))}
                />
              </Card>
              <Card title="Problemtypen">
                <DistributionBars
                  data={stats.byProblemType.map((p) => ({
                    label: labelProblem(p.type),
                    count: p.count,
                    color: "bg-violet-500",
                  }))}
                />
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
              <Card
                title={`Besuchte Ratgeber-/SEO-Seiten (${stats.rangeDays} Tage)`}
                right={
                  <AdminIconButton
                    label="CSV"
                    onClick={() => exportTopContentCsv(stats.topContentPages, stats.rangeDays)}
                  />
                }
              >
                <TopContentTable rows={stats.topContentPages} />
              </Card>
              <Card
                title="Wizard-Eingaben"
                right={
                  <AdminIconButton
                    label="CSV"
                    onClick={() => exportWizardEventsCsv(stats.latestWizardEvents)}
                  />
                }
              >
                <WizardEventList rows={stats.latestWizardEvents} />
              </Card>
            </div>

            {/* Cases table */}
            <Card
              title="Fälle"
              right={
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <AdminIconButton label="CSV" onClick={() => exportCasesCsv(cases, onlyPaid)} />
                  <button
                    type="button"
                    onClick={() => setOnlyPaid((v) => !v)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      onlyPaid
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    {onlyPaid ? "Nur bezahlte" : "Alle anzeigen"}
                  </button>
                </div>
              }
            >
              {cases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  Noch keine Fälle vorhanden.
                </p>
              ) : (
                <div className="overflow-x-auto -mx-5 sm:mx-0">
                  <table className="min-w-full text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500 border-b">
                      <tr>
                        <Th>ID</Th>
                        <Th>Erstellt</Th>
                        <Th>Händler</Th>
                        <Th>Problem</Th>
                        <Th>Zahlung</Th>
                        <Th className="text-right">Betrag</Th>
                        <Th className="text-right">Score</Th>
                        <Th>Bezahlt</Th>
                        <Th>Aktion</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {cases.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <Td className="font-mono text-xs text-slate-500">#{c.id}</Td>
                          <Td className="whitespace-nowrap text-xs text-slate-600">
                            {new Date(c.createdAt).toLocaleString("de-DE", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </Td>
                          <Td className="font-semibold">{c.merchantName}</Td>
                          <Td className="text-xs">{labelProblem(c.problemType)}</Td>
                          <Td className="text-xs">{labelPayment(c.paymentMethod)}</Td>
                          <Td className="text-right tabular-nums font-semibold">
                            {c.amount.toFixed(2)} €
                          </Td>
                          <Td className="text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                c.successProbability >= 65
                                  ? "bg-emerald-100 text-emerald-800"
                                  : c.successProbability >= 40
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {c.successProbability}%
                            </span>
                          </Td>
                          <Td>
                            {c.paid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {c.paidAt ? new Date(c.paidAt).toLocaleDateString("de-DE") : "Ja"}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">offen</span>
                            )}
                          </Td>
                          <Td>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAnonymizeCase(c.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                title="Fall anonymisieren"
                              >
                                <Archive className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCase(c.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                                title="Fall dauerhaft löschen"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <SeoQualityDisclosure
              rows={seoQualityRows}
              indexable={seoIndexable}
              candidates={seoCandidates}
              averageScore={averageSeoScore}
              nextRelease={nextSeoRelease}
            />

            <RetentionDisclosure
              retentionMonths={stats.retentionMonths}
              analyticsRetentionMonths={stats.analyticsRetentionMonths}
              onDone={load}
            />

            <BrowserUnlockDisclosure />
          </>
        ) : null}
      </main>
    </div>
  );
}

function readBrowserUnlockState() {
  const expiry = getFlatrateExpiry();
  return {
    active: isFlatrateActive(),
    expiryLabel: expiry
      ? expiry.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
      : null,
  };
}

function SecurityStatusPanel({ stats }: { stats: AdminStats }) {
  const items = [
    {
      label: "Produktionsmodus",
      ok: stats.security.productionMode,
      detail: stats.security.productionMode ? "aktiv" : "lokal/dev",
      advisory: false,
    },
    {
      label: "Stripe Webhook",
      ok: stats.security.stripeWebhookConfigured,
      detail: stats.security.stripeWebhookConfigured ? "whsec_ gesetzt" : "fehlt",
      advisory: false,
    },
    {
      label: "Turnstile",
      ok: !stats.security.turnstileRequired || stats.security.turnstileConfigured,
      detail: stats.security.turnstileRequired
        ? stats.security.turnstileConfigured
          ? "Pflicht aktiv"
          : "Pflicht, Secret fehlt"
        : "optional",
      advisory: false,
    },
    {
      label: "Admin-IP-Filter",
      ok: stats.security.adminIpAllowlistConfigured,
      detail: stats.security.adminIpAllowlistConfigured
        ? "ADMIN_ALLOWED_IPS aktiv"
        : "nicht gesetzt",
      advisory: true,
    },
  ];

  return (
    <Card title="Sicherheit & Betrieb">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              {item.ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : item.advisory ? (
                <Shield className="h-4 w-4 text-slate-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                {item.label}
              </p>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">{item.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Empfehlung: Admin zusätzlich über Cloudflare Access oder <code>ADMIN_ALLOWED_IPS</code>{" "}
        schützen. Das ist optional, erhöht aber die Sicherheit deutlich, ohne den öffentlichen
        Funnel zu beeinflussen.
      </p>
    </Card>
  );
}

function BrowserUnlockDisclosure() {
  const [state, setState] = useState(readBrowserUnlockState);
  const [message, setMessage] = useState("");

  const activate = () => {
    const sessionId = `admin_test_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    activateFlatrate(sessionId, 12);
    const savedCases = listSavedCases();
    savedCases.forEach((entry) => markCaseIdUnlocked(entry.caseId));
    setState(readBrowserUnlockState());
    setMessage(
      savedCases.length > 0
        ? `Testfreischaltung ist aktiv. ${savedCases.length} gespeicherte Fälle wurden markiert.`
        : "Testfreischaltung ist in diesem Browser aktiv."
    );
  };

  const reset = () => {
    clearFlatrate();
    setState(readBrowserUnlockState());
    setMessage("Testfreischaltung wurde in diesem Browser entfernt.");
  };

  return (
    <details className="group bg-white rounded-2xl border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <UnlockKeyhole className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm uppercase tracking-wide text-slate-700">
              Interne Browser-Testfreischaltung
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {state.active && state.expiryLabel
                ? `Aktiv bis ${state.expiryLabel} in diesem Browser.`
                : "Nicht aktiv. Nur fuer lokale Admin-Tests im aktuellen Browser."}
            </p>
          </div>
        </div>
        <span className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors group-open:bg-slate-50">
          <span className="group-open:hidden">Aufklappen</span>
          <span className="hidden group-open:inline">Zuklappen</span>
        </span>
      </summary>
      <div className="border-t px-5 pb-5 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Schaltet die Paywall nur in deinem aktuellen Browser frei, damit PDF-Export und
            Ergebnisansicht intern getestet werden koennen. Es wird keine Stripe-Zahlung simuliert.
            {message && <p className="mt-2 font-semibold text-slate-800">{message}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={activate} className="gap-2 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4" />
              Testfreischaltung aktivieren
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              disabled={!state.active}
              className="gap-2 whitespace-nowrap"
            >
              <XCircle className="h-4 w-4" />
              Entfernen
            </Button>
          </div>
        </div>
      </div>
    </details>
  );
}

function RetentionDisclosure({
  retentionMonths,
  analyticsRetentionMonths,
  onDone,
}: {
  retentionMonths: number;
  analyticsRetentionMonths: number;
  onDone: () => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const dryRun = async () => {
    setLoading(true);
    try {
      const result = await anonymizeOldAdminCases(false);
      setMessage(
        `${result.eligibleCases ?? 0} Fälle älter als ${retentionMonths} Monate wären betroffen.`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Prüfung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const execute = async () => {
    if (!window.confirm("Alte Fälle jetzt anonymisieren?")) return;
    setLoading(true);
    try {
      const result = await anonymizeOldAdminCases(true);
      setMessage(`${result.anonymizedCases ?? 0} alte Fälle wurden anonymisiert.`);
      await onDone();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Anonymisierung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <details className="group bg-white rounded-2xl border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <DatabaseZap className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm uppercase tracking-wide text-slate-700">
              Datenschutz & Aufbewahrung
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Automatische Retention: Fälle älter als {retentionMonths} Monate werden anonymisiert.
              Analytics-Ereignisse werden nach {analyticsRetentionMonths} Monaten gelöscht.
            </p>
          </div>
        </div>
        <span className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors group-open:bg-slate-50">
          <span className="group-open:hidden">Aufklappen</span>
          <span className="hidden group-open:inline">Zuklappen</span>
        </span>
      </summary>
      <div className="border-t px-5 pb-5 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {message || "Prüfe zuerst per Dry-Run, bevor alte Fälle anonymisiert werden."}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={dryRun} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dry-Run prüfen"}
            </Button>
            <Button type="button" onClick={execute} disabled={loading}>
              Alte Fälle anonymisieren
            </Button>
          </div>
        </div>
      </div>
    </details>
  );
}

function TopContentTable({ rows }: { rows: AdminStats["topContentPages"] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Noch keine externen Ratgeber-Aufrufe erfasst.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-5 sm:mx-0">
      <table className="min-w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500 border-b">
          <tr>
            <Th>Seite</Th>
            <Th className="text-right">Aufrufe</Th>
            <Th className="text-right">Besucher</Th>
            <Th>Zuletzt</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.path} className="hover:bg-slate-50">
              <Td className="font-mono text-xs text-slate-700">{row.path}</Td>
              <Td className="text-right font-bold tabular-nums">{row.views}</Td>
              <Td className="text-right tabular-nums">{row.visitors}</Td>
              <Td className="whitespace-nowrap text-xs text-slate-500">
                {new Date(row.lastSeen).toLocaleString("de-DE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WizardEventList({ rows }: { rows: AdminStats["latestWizardEvents"] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Noch keine Wizard-Zwischenstände erfasst.
      </p>
    );
  }

  return (
    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
      {rows.map((row, index) => {
        const meta = row.metadata ?? {};
        return (
          <div key={`${row.createdAt}-${index}`} className="rounded-xl border bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                {labelWizardEvent(row.eventType)} · Schritt {String(meta.step ?? "-")}
              </p>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                {new Date(row.createdAt).toLocaleString("de-DE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {labelPayment(String(meta.paymentMethod || "")) || "Zahlung offen"} ·{" "}
              {labelProblem(String(meta.problemType || "")) || "Problem offen"}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {String(meta.merchantCountry || "Land offen")} ·{" "}
              {meta.merchantContacted === true
                ? "Händler kontaktiert"
                : meta.merchantContacted === false
                  ? "Noch kein Kontakt"
                  : "Kontakt offen"}{" "}
              · {String(meta.evidenceCount ?? 0)} Belege
            </p>
          </div>
        );
      })}
    </div>
  );
}

function FunnelPanel({ stats }: { stats: AdminStats }) {
  const steps = [
    {
      label: "Wizard-Starts",
      value: stats.traffic.wizardStarts7d,
      base: stats.traffic.wizardStarts7d,
      hint: "Schritt 1 geöffnet",
    },
    {
      label: "Analyse gestartet",
      value: stats.traffic.analysisSubmits7d,
      base: stats.traffic.wizardStarts7d,
      hint: "KI-Analyse angefordert",
    },
    {
      label: "Analyse erfolgreich",
      value: stats.traffic.analysisSuccesses7d,
      base: stats.traffic.analysisSubmits7d,
      hint: "Ergebnis erzeugt",
    },
    {
      label: "Paywall gesehen",
      value: stats.traffic.paywallViews7d,
      base: stats.traffic.analysisSuccesses7d,
      hint: "Freischaltung sichtbar",
    },
    {
      label: "Checkout geklickt",
      value: stats.traffic.checkoutClicks7d,
      base: stats.traffic.paywallViews7d,
      hint: "Stripe geöffnet",
    },
    {
      label: "Bezahlt",
      value: stats.paid7d,
      base: stats.traffic.checkoutClicks7d,
      hint: "bestätigte Zahlungen",
    },
  ];

  const max = Math.max(1, ...steps.map((step) => step.value));

  return (
    <Card title="Conversion-Funnel (7 Tage)">
      <div className="grid gap-3 md:grid-cols-6">
        {steps.map((step) => {
          const rate = step.base > 0 ? Math.round((step.value / step.base) * 100) : 0;
          return (
            <div key={step.label} className="rounded-xl border bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {step.label}
              </p>
              <p className="mt-2 text-2xl font-black tabular-nums text-slate-950">{step.value}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: step.value > 0 ? `${Math.max(4, (step.value / max) * 100)}%` : 0,
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {step.hint} · {rate}% zur Vorstufe
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Datensparsam: erfasst werden nur strukturierte Ereignisse ohne Freitext. Admin-Browser mit
        aktivem Token werden ausgeschlossen.
      </p>
    </Card>
  );
}

function labelWizardEvent(eventType: string) {
  const labels: Record<string, string> = {
    wizard_step: "Schritt",
    wizard_draft: "Eingabe",
    analysis_submit: "Analyse gestartet",
    analysis_success: "Analyse erfolgreich",
    paywall_view: "Paywall gesehen",
    checkout_click: "Checkout geklickt",
  };
  return labels[eventType] ?? eventType;
}

function RangeSwitch({
  value,
  onChange,
}: {
  value: 7 | 30 | 90;
  onChange: (value: 7 | 30 | 90) => void;
}) {
  const options = [7, 30, 90] as const;
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`min-w-12 rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
            value === option
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {option}T
        </button>
      ))}
    </div>
  );
}

function AdminIconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* ── UI primitives ─────────────────────────────────── */

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub: string;
  accent: "blue" | "emerald" | "amber" | "violet";
}) {
  const accentMap = {
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
  } as const;
  return (
    <div className="bg-white rounded-2xl border p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-black tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

function StatBlock({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: number;
  sub: string;
  icon: typeof Activity;
}) {
  return (
    <div className="bg-white rounded-xl border px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold tabular-nums">
          {value} <span className="text-xs font-normal text-slate-500">{sub}</span>
        </p>
      </div>
    </div>
  );
}

function Card({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm uppercase tracking-wide text-slate-700">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function SeoQualityDisclosure({
  rows,
  indexable,
  candidates,
  averageScore,
  nextRelease,
}: {
  rows: ReturnType<typeof getAllSeoQualityResults>;
  indexable: number;
  candidates: number;
  averageScore: number;
  nextRelease: { date: string; count: number } | null;
}) {
  return (
    <details className="group bg-white rounded-2xl border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden">
        <div>
          <h2 className="font-bold text-sm uppercase tracking-wide text-slate-700">
            SEO Quality Gate · Threshold {SEO_QUALITY_CONFIG.threshold}/100
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {indexable} index · {candidates} candidate · Ø {averageScore} ·{" "}
            {SEO_QUALITY_CONFIG.scheduledIndexing.batchSize}/Tranche
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sitemap-Soll nach Build: {indexable} indexierbare Anbieter-Detailseiten. Prüfung:
            <code className="ml-1 rounded bg-slate-100 px-1 py-0.5">pnpm seo:smoke</code>
          </p>
          {nextRelease && (
            <p className="mt-1 text-xs font-medium text-slate-600">
              Nächste geplante Freigabe: {nextRelease.count} Seiten ab {nextRelease.date}
            </p>
          )}
        </div>
        <span className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors group-open:bg-slate-50">
          <span className="group-open:hidden">Aufklappen</span>
          <span className="hidden group-open:inline">Zuklappen</span>
        </span>
      </summary>
      <div className="border-t px-5 pb-5 pt-4">
        <SeoQualityTable rows={rows} />
      </div>
    </details>
  );
}

function getNextSeoRelease(rows: ReturnType<typeof getAllSeoQualityResults>) {
  const today = new Date().toISOString().slice(0, 10);
  const futureDates = rows
    .map((row) => row.releaseDate)
    .filter((date): date is string => !!date && date > today)
    .sort((a, b) => a.localeCompare(b));
  const date = futureDates[0];
  if (!date) return null;
  return {
    date,
    count: rows.filter((row) => row.releaseDate === date).length,
  };
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left font-semibold py-2 px-3 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-2.5 px-3 ${className}`}>{children}</td>;
}

function DistributionBars({ data }: { data: { label: string; count: number; color: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (data.length === 0) return <p className="text-xs text-muted-foreground">Keine Daten.</p>;
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600">{d.label}</span>
            <span className="font-bold text-slate-900 tabular-nums">{d.count}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full ${d.color} transition-all`}
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SeoQualityTable({ rows }: { rows: ReturnType<typeof getAllSeoQualityResults> }) {
  const sortedRows = [...rows].sort((a, b) => {
    if (a.status !== b.status) return a.status === "noindex" ? -1 : 1;
    return a.score - b.score;
  });

  return (
    <div className="overflow-x-auto -mx-5 sm:mx-0">
      <table className="min-w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500 border-b">
          <tr>
            <Th>URL</Th>
            <Th className="text-right">Score</Th>
            <Th>Status</Th>
            <Th>Tranche</Th>
            <Th>Gate</Th>
            <Th>Missing items</Th>
            <Th>Empfehlung</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sortedRows.map((row) => (
            <tr key={row.url} className="hover:bg-slate-50">
              <Td className="font-mono text-xs text-slate-600">{row.url}</Td>
              <Td className="text-right font-bold tabular-nums">{row.score}</Td>
              <Td>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                    row.status === "index"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {row.override ? `${row.status} · ${row.override}` : row.status}
                </span>
              </Td>
              <Td className="whitespace-nowrap text-xs text-slate-600">
                {row.releaseDate ? (
                  row.releaseDate <= new Date().toISOString().slice(0, 10) ? (
                    <span className="font-semibold text-emerald-700">seit {row.releaseDate}</span>
                  ) : (
                    <span>ab {row.releaseDate}</span>
                  )
                ) : (
                  "sofort"
                )}
              </Td>
              <Td className="text-xs text-slate-600">{labelSeoGate(row.gateReason)}</Td>
              <Td className="text-xs text-slate-600 max-w-sm">
                {row.missing.length ? row.missing.join(", ") : "OK"}
              </Td>
              <Td className="text-xs font-semibold">{row.recommendation}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function labelSeoGate(gate: ReturnType<typeof getAllSeoQualityResults>[number]["gateReason"]) {
  const labels = {
    quality: "Score erreicht",
    scheduled: "Tranche freigegeben",
    future_tranche: "geplant",
    forceIndex: "Override index",
    forceNoindex: "Override noindex",
  } as const;
  return labels[gate];
}

function DailyChart({ series }: { series: { day: string; total: number; paid: number }[] }) {
  if (series.length === 0)
    return <p className="text-sm text-muted-foreground text-center py-6">Noch keine Daten.</p>;
  const max = Math.max(1, ...series.map((s) => s.total));
  return (
    <div>
      <div className="flex items-end gap-1 h-32">
        {series.map((s) => {
          const totalH = (s.total / max) * 100;
          const paidH = (s.paid / max) * 100;
          return (
            <div
              key={s.day}
              className="flex-1 flex flex-col justify-end items-center gap-0.5 group relative"
            >
              <div className="w-full bg-slate-200 rounded-t" style={{ height: `${totalH}%` }}>
                <div
                  className="w-full bg-emerald-500 rounded-t"
                  style={{ height: `${(paidH / Math.max(totalH, 1)) * 100}%` }}
                />
              </div>
              <div className="absolute -top-9 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10">
                {s.day} · {s.total} ({s.paid} bezahlt)
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <span>{series[0]?.day}</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-slate-300" /> Fälle
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-500" /> bezahlt
          </span>
        </div>
        <span>{series[series.length - 1]?.day}</span>
      </div>
    </div>
  );
}
