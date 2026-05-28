import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { SeoHead } from "@/components/SeoHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <MainLayout>
      <SeoHead
        title="Seite nicht gefunden (404) · ChargebackPilot"
        description="Die angeforderte Seite existiert nicht oder wurde verschoben. Nutze unsere Startseite oder den Ratgeber, um schnell weiterzumachen."
        canonical="/404"
        noindex
      />
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <Card className="border-primary/20 shadow-sm">
          <CardContent className="p-8 sm:p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
              <Compass className="w-7 h-7" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Fehler 404</p>
            <h1 className="text-3xl font-bold mb-3">Diese Seite wurde nicht gefunden</h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Die URL ist eventuell veraltet oder falsch eingegeben. Du kannst direkt zur Startseite zurückkehren
              oder im Ratgeber weitermachen.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="gap-2 w-full sm:w-auto">
                  <Home className="w-4 h-4" />
                  Zur Startseite
                </Button>
              </Link>
              <Link href="/ratgeber">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Search className="w-4 h-4" />
                  Zum Ratgeber
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
