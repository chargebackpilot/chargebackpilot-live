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
} from "lucide-react";
import { getAllSeoQualityResults, SEO_QUALITY_CONFIG } from "@/seo-quality";
import {
  adminLogin,
  clearAdminPassword,
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
  other: "Sonstiges",
};

function labelPayment(m: string) {
  return PAYMENT_METHOD_LABELS[m] ?? m;
}
function labelProblem(t: string) {
  return PROBLEM_TYPE_LABELS[t] ?? t;
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
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
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
  const [onlyPaid, setOnlyPaid] = useState(false);
  const seoQualityRows = getAllSeoQualityResults();
  const seoIndexable = seoQualityRows.filter((row) => row.status === "index").length;
  const seoCandidates = seoQualityRows.length - seoIndexable;
  const averageSeoScore =
    seoQualityRows.length > 0
      ? Math.round(seoQualityRows.reduce((sum, row) => sum + row.score, 0) / seoQualityRows.length)
      : 0;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, c] = await Promise.all([getAdminStats(), getAdminCases(onlyPaid, 100)]);
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
  }, [onlyPaid]);

  const logout = () => {
    clearAdminPassword();
    onLogout();
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
                label="Fälle gesamt"
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

            <Card
              title={`SEO Quality Gate · Threshold ${SEO_QUALITY_CONFIG.threshold}/100`}
              right={
                <span className="text-xs font-semibold text-slate-500">
                  {seoIndexable} index · {seoCandidates} candidate · Ø {averageSeoScore}
                </span>
              }
            >
              <SeoQualityTable rows={seoQualityRows} />
            </Card>

            {/* Daily chart */}
            <Card title="Tägliches Aufkommen (30 Tage)">
              <DailyChart series={stats.dailySeries} />
            </Card>

            {/* Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card title="Erfolgsbewertung">
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

            {/* Cases table */}
            <Card
              title="Fälle"
              right={
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
                        <Th className="text-right">Erfolg</Th>
                        <Th>Bezahlt</Th>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        ) : null}
      </main>
    </div>
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
