import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

const root = document.getElementById("root")!;
const app = (
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);

if (root.hasChildNodes()) {
  let hydrated = false;

  const hydrate = () => {
    if (hydrated) return;
    hydrated = true;
    cleanupEarlyHydrationTriggers();
    hydrateRoot(root, app);
  };

  const schedule = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(cb, 2500) as unknown as number);
  const cancel = window.cancelIdleCallback ?? window.clearTimeout;
  const idleId = schedule(hydrate, { timeout: 3000 });

  const onEarlyInteraction = () => hydrate();
  const earlyEvents = ["pointerdown", "keydown", "touchstart"] as const;

  function cleanupEarlyHydrationTriggers() {
    cancel(idleId as number);
    earlyEvents.forEach((eventName) => window.removeEventListener(eventName, onEarlyInteraction));
  }

  earlyEvents.forEach((eventName) => window.addEventListener(eventName, onEarlyInteraction, { once: true, passive: true }));
} else {
  createRoot(root).render(app);
}
