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
  const description = `Probleme mit ${merchant.name}? Hier findest du Schritt-für-Schritt-Anleitungen für alle häufigen ${merchant.name}-Probleme: Lieferung, Defekte, Erstattung und mehr.`;
  const problems = merchant.problems
    .map((slug) => getProblem(slug))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const indexedProblems = problems.filter((p) =>
    isIndexableMerchantProblemPath(`/hilfe/${merchant.slug}/${p.slug}`)
  );
  const candidateProblems = problems.filter(
    (p) => !isIndexableMerchantProblemPath(`/hilfe/${merchant.slug}/${p.slug}`)
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
          <section>
            <h2 className="text-2xl font-bold mb-5">Wichtige Guides zu {merchant.name}</h2>
            <div className="grid gap-3">
              {(indexedProblems.length ? indexedProblems : problems).map((p) => (
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

          {candidateProblems.length > 0 && indexedProblems.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Weitere vorbereitete Themen</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Diese Seiten sind erreichbar, werden aber erst nach zusätzlicher redaktioneller
                Aufwertung aktiv für Google priorisiert.
              </p>
              <div className="grid gap-3">
                {candidateProblems.map((p) => (
                  <Link key={p.slug} href={`/hilfe/${merchant.slug}/${p.slug}`}>
                    <Card className="border-dashed shadow-none hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-5 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-muted-foreground">
                            {merchant.name}: {p.label}
                          </div>
                          <div className="text-sm text-muted-foreground leading-relaxed mt-2">
                            Allgemeine Orientierung mit Beleg-Checkliste und nächstem
                            Zahlungsschritt.
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
        </div>
      </article>
    </MainLayout>
  );
}
