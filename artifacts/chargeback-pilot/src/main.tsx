import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import HomeApp from "./HomeApp";

const root = document.getElementById("root")!;

function loadClientApp() {
  if (window.location.pathname === "/") {
    return Promise.resolve({ default: HomeApp });
  }
  return import("./App");
}

loadClientApp()
  .then(({ default: App }) => {
    const app = (
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    );

    if (root.hasChildNodes()) {
      hydrateRoot(root, app);
    } else {
      createRoot(root).render(app);
    }
  })
  .catch((error) => {
    console.error("ChargebackPilot konnte nicht gestartet werden.", error);
  });
