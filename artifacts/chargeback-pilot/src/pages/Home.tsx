import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ShieldCheck, Scale, FileText, Clock, AlertTriangle, FileSignature } from "lucide-react";
import { useGetCaseStats } from "@workspace/api-client-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Home() {
  const { data: stats } = useGetCaseStats();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
            Intelligente Formulierungshilfe
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Dein KI-Pilot für Chargebacks & <span className="text-primary">Zahlungsreklamationen</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Strukturiere deinen Fall, erkenne fehlende Beweise und erstelle professionelle Formulierungen für PayPal, Kreditkarte, Amex, Klarna und Händler.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/fall-pruefen">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 gap-2">
                Fall kostenlos prüfen
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/ratgeber">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                Ratgeber lesen
              </Button>
            </Link>
          </div>
          
          {stats && (
            <div className="mt-12 pt-8 border-t flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span><strong className="text-foreground">{stats.totalCases}</strong> Fälle analysiert</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Präzise KI-Auswertung</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Fertige Textvorlagen</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">So funktioniert es</h2>
            <p className="text-muted-foreground">In drei einfachen Schritten zur professionellen Reklamation.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border -z-10" />
            {[
              { title: "1. Fall beschreiben", desc: "Beantworte einfache Fragen zu deiner Zahlung und dem aufgetretenen Problem.", icon: FileSignature },
              { title: "2. Beweise prüfen", desc: "Unsere KI analysiert deine Situation und zeigt dir, welche Nachweise du benötigst.", icon: Scale },
              { title: "3. Textvorlagen erhalten", desc: "Kopiere fertige, professionell formulierte Anschreiben für Händler und Bank.", icon: FileText }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center bg-card p-6 rounded-xl border shadow-sm">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Unterstützte Fälle</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "PayPal Käuferschutz", href: "/paypal-chargeback" },
              { title: "Kreditkarten-Chargeback", href: "/visa-mastercard-chargeback" },
              { title: "Flug nicht erstattet", href: "/flug-chargeback" },
              { title: "Ware nicht erhalten", href: "/ware-nicht-erhalten" },
              { title: "Abo-Falle", href: "/abo-falle-chargeback" },
              { title: "Lieferdienst Problem", href: "/lieferando-rueckerstattung" }
            ].map((uc, i) => (
              <Link key={i} href={uc.href}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {uc.title}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-background border-t">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Alle Funktionen</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Chargeback-Strategie", desc: "Passende Vorgehensweise je nach Zahlungsart." },
              { icon: CheckCircle2, title: "Beweis-Checkliste", desc: "Welche Dokumente für deinen Fall zwingend sind." },
              { icon: FileSignature, title: "Formulierungsassistent", desc: "Rechtlich saubere, überzeugende Formulierungen." },
              { icon: Clock, title: "Fristen-Überblick", desc: "Kenne die Deadlines deiner Bank." },
              { icon: AlertTriangle, title: "Gegenargumente", desc: "Bereite dich auf Standardausreden der Händler vor." },
              { icon: FileText, title: "PDF-Export", desc: "Druckfertige Anschreiben (Premium)." }
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-4">
                <f.icon className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing placeholder */}
      <section className="py-20 px-4 bg-muted/50 border-t">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Einfache Preisgestaltung</h2>
            <p className="text-muted-foreground">Kostenlose Ersteinschätzung für alle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Basisanalyse</CardTitle>
                <CardDescription>Kostenlose Ersteinschätzung</CardDescription>
                <div className="text-3xl font-bold mt-4">0 €</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Stärken-Analyse</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Beweis-Checkliste</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Standard-Vorlage</li>
                </ul>
                <Link href="/fall-pruefen">
                  <Button className="w-full mt-4" variant="outline">Jetzt starten</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-primary shadow-md relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                Beliebt
              </div>
              <CardHeader>
                <CardTitle>Premium Bericht</CardTitle>
                <CardDescription>Einmalig pro Fall</CardDescription>
                <div className="text-3xl font-bold mt-4">7,99 €</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Detaillierte Begründung</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Bessere Textvorlagen</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Gegenargumente</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> PDF Export</li>
                </ul>
                <Button className="w-full mt-4">Premium wählen</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Abo</CardTitle>
                <CardDescription>Für Vielkäufer</CardDescription>
                <div className="text-3xl font-bold mt-4">9,99 €<span className="text-sm font-normal text-muted-foreground">/mtl.</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Unbegrenzte Fälle</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Gespeicherte Fälle</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Alle Premium-Features</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">Abo abschließen</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-background border-t">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Häufige Fragen</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Ist ChargebackPilot eine Rechtsberatung?</AccordionTrigger>
              <AccordionContent>
                Nein, wir bieten keine Rechtsberatung an. Wir unterstützen dich lediglich dabei, deinen Fall strukturiert aufzubereiten und stellen allgemeine Textvorlagen zur Verfügung, die du für die Kommunikation mit Banken und Händlern nutzen kannst.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Wie sicher sind meine Daten?</AccordionTrigger>
              <AccordionContent>
                Sehr sicher. Wir speichern deine Fall-Daten nur lokal während deiner Sitzung, es sei denn, du legst explizit einen Account an.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Gibt es eine Erfolgsgarantie?</AccordionTrigger>
              <AccordionContent>
                Nein. Ob ein Chargeback oder eine Reklamation erfolgreich ist, hängt von den Richtlinien der Bank, des Zahlungsdienstleisters und den genauen Umständen deines Falles ab.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

    </MainLayout>
  );
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${className}`}>{children}</span>;
}
