import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { activateFlatrate } from "@/lib/case-persistence";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminDemo() {
  const { toast } = useToast();

  const handleUnlockStripe = () => {
    // Generate a dummy session ID to activate the flatrate
    const dummySessionId = "cs_test_" + Math.random().toString(36).substring(2);
    activateFlatrate(dummySessionId, 12);
    toast({
      title: "Test-Modus aktiviert",
      description: "Du hast die Flatrate für 12 Monate kostenlos freigeschaltet. Alle Paywalls sind jetzt deaktiviert.",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Demo-Modus & Testumgebung</h1>
        <p className="text-muted-foreground mb-8">
          Hier kannst du die Stripe-Bezahlschranke für deinen lokalen Browser umgehen, um alle Funktionen von ChargebackPilot 
          zu testen (z.B. PDF-Download, KI-Auswertungen).
        </p>

        <Card className="border-primary/50 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Stripe Paywall freischalten
            </CardTitle>
            <CardDescription>
              Klicke hier, um eine aktive "12-Monats-Flatrate" zu Testzwecken im LocalStorage zu hinterlegen.
              Danach wird keine Bezahlschranke mehr angezeigt, wenn du den Wizard durchspielst.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleUnlockStripe} size="lg" className="gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Test-Freischaltung aktivieren
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Was passiert im Hintergrund?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Normalerweise erfordert die Nutzung der Dokumenten-Generierung und der tiefen Analyse eine Zahlung via Stripe.
              Sobald der Checkout erfolgreich ist, leitet Stripe auf die Startseite zurück mit dem Parameter <code>?flatrate_success=1</code>.
            </p>
            <p>
              In diesem Demo-Modus simulieren wir diesen Vorgang, indem wir den entsprechenden Schluessel direkt in den Browser-Storage (LocalStorage) legen.
              Diese Freischaltung gilt nur für deinen aktuellen Browser.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
