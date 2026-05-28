import { Component, type ErrorInfo, type ReactNode } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary caught error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <MainLayout>
          <SeoHead
            title="Technischer Fehler (500) · ChargebackPilot"
            description="Es ist ein technischer Fehler aufgetreten. Bitte lade die Seite neu oder starte auf der Startseite."
            canonical="/500"
            noindex
          />
          <main className="container mx-auto max-w-3xl py-16 px-4 text-center">
            <h1 className="text-3xl font-bold mb-3">Ein technischer Fehler ist aufgetreten</h1>
            <p className="text-muted-foreground mb-6">
              Bitte lade die Seite neu. Wenn das Problem bestehen bleibt, starte auf der Startseite neu.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>Seite neu laden</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/")}>Zur Startseite</Button>
            </div>
          </main>
        </MainLayout>
      );
    }

    return this.props.children;
  }
}
