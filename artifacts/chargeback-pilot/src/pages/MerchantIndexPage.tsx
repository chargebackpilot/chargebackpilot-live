import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/SeoHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import NotFound from "./not-found";
import { getMerchant, getProblem } from "@/data/merchants";
import { isIndexableMerchantProblemPath } from "@/seo-quality";

export default function MerchantIndexPage() {
  const [, params] = useRoute<{ merchantSlug: string }>("/hilfe/:merchantSlug");
  const merchant = params ? getMerchant(params.merchantSlug) : null;
  if (!merchant) return <NotFound />;

  const title = `${merchant.name} Reklamation & Chargeback 2026 | ChargebackPilot`;
  const description = `Probleme mit ${merchant.name}? Strukturierte Orientierung zu Lieferung, Defekten, Erstattung, Abbuchung und passenden Zahlungswegen.`;
  const problems = merchant.problems
    .map((slug) => getProblem(slug))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const indexedProblems = problems.filter((p) =>
    isIndexableMerchantProblemPath(`/hilfe/${merchant.slug}/${p.slug}`)
  );

  return (
    <MainLayout>
      <SeoHead title={title} description={description} canonical={`/hilfe/${merchant.slug}`} />
      <Breadcrumbs items={[{ label: "Ratgeber", href: "/ratgeber" }, { label: merchant.name }]} />

      <article className="pb-20">
        <header className="bg-gradient-to-b from-blue-50 to-background py-12 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {merchant.name}: Reklamation & Chargeback
            </h1>
            <p className="text-lg text-muted-foreground mb-6">{merchant.description}</p>
            <Link href="/vorlagen-generator">
              <Button size="lg" className="gap-2">
                Kostenlosen Fall-Check starten <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto max-w-3xl px-4 mt-10 space-y-10">
          {indexedProblems.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-5">Wichtige Guides zu {merchant.name}</h2>
              <div className="grid gap-3">
                {indexedProblems.map((p) => (
                  <Link key={p.slug} href={`/hilfe/${merchant.slug}/${p.slug}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-5 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">
                            {merchant.name}: {p.label}
                          </div>
                          <div className="text-sm text-muted-foreground leading-relaxed mt-2">
                            <p>
                              <strong>3 sinnvolle Schritte bei {merchant.name}:</strong>
                            </p>
                            <ol className="list-decimal pl-4 mt-2 space-y-1">
                              <li>Kontaktiere den Support von {merchant.name} schriftlich.</li>
                              <li>Sichere Beweise passend zu Problem und Zahlungsart.</li>
                              <li>
                                Erstelle strukturierte Formulierungsvorschläge für Händler und
                                Zahlungsdienstleister.
                              </li>
                            </ol>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {indexedProblems.length === 0 && (
            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-3">
                Fall bei {merchant.name} strukturiert vorbereiten
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Bei {merchant.name} kommt es vor allem auf eine klare Chronologie, den passenden
                Zahlungsweg und nachvollziehbare Belege an. Der kostenlose Fall-Check hilft dir,
                dein konkretes Problem sachlich einzuordnen und die nächsten Schritte vorzubereiten.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {problems.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/vorlagen-generator?merchant=${encodeURIComponent(
                      merchant.name
                    )}&problem=${encodeURIComponent(p.wizardProblemId)}`}
                    className="rounded-lg border bg-muted/30 px-3 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="font-semibold">{p.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Belege sichern, Zahlungsweg prüfen, Textentwurf vorbereiten
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Belege sichern",
                text: "Bestellung, Zahlungsnachweis, Tracking, Screenshots und Supportverlauf geordnet ablegen.",
              },
              {
                title: "Zahlungsweg prüfen",
                text: "PayPal, Kreditkarte, Klarna oder Bank haben unterschiedliche Abläufe und Fristen.",
              },
              {
                title: "Sachlich formulieren",
                text: "Keine Vorwürfe, sondern konkrete Daten, Problem, bisherige Klärung und gewünschte Lösung.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-4">
                  <h2 className="mb-1 text-sm font-bold">{item.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </article>
    </MainLayout>
  );
}
