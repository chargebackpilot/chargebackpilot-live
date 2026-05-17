import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";

export const GUIDES = [
  { path: "/paypal-chargeback", title: "PayPal Käuferschutz", desc: "Wie du dein Geld bei PayPal zurückholst." },
  { path: "/amex-chargeback", title: "Amex Chargeback", desc: "American Express Reklamationen erfolgreich einreichen." },
  { path: "/visa-mastercard-chargeback", title: "Visa & Mastercard Chargeback", desc: "Der Weg zur Rückerstattung bei Kreditkartenzahlungen." },
  { path: "/klarna-reklamation", title: "Klarna Reklamation", desc: "Käuferschutz bei Klarna-Zahlungen nutzen." },
  { path: "/flug-chargeback", title: "Flug Chargeback", desc: "Reiserückerstattung bei Ausfällen und Stornierungen." },
  { path: "/lieferando-rueckerstattung", title: "Lieferando Rückerstattung", desc: "Geld zurück bei falschem oder fehlendem Essen." },
  { path: "/ware-nicht-erhalten", title: "Ware nicht erhalten", desc: "Was tun, wenn das Paket nie ankommt?" },
  { path: "/abo-falle-chargeback", title: "Abo-Falle", desc: "Ungewollte Abbuchungen stoppen und Geld zurückfordern." }
];

export default function RatgeberIndex() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl py-16 px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Ratgeber & Chargeback-Guides</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Umfassende Informationen, Tipps und Schritt-für-Schritt Anleitungen für jede Art von Zahlungsproblem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map((guide, i) => (
            <Link key={i} href={guide.path}>
              <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-4">
                    <span>{guide.title}</span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    {guide.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
